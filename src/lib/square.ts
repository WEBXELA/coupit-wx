import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Ensure environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const squareAppId = import.meta.env.VITE_SQUARE_APP_ID;
const squareAppSecret = import.meta.env.VITE_SQUARE_APP_SECRET;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

if (!squareAppId || !squareAppSecret) {
  throw new Error('Missing Square environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Square OAuth configuration
export const SQUARE_CONFIG = {
  production: {
    redirectUri: 'https://coupit.ai/square/callback',
    oauthUrl: 'https://connect.squareup.com/oauth2/authorize',
    tokenUrl: 'https://connect.squareup.com/oauth2/token',
    appId: squareAppId
  },
  sandbox: {
    redirectUri: 'https://coupit.ai/square/sandbox/callback',
    oauthUrl: 'https://connect.squareupsandbox.com/oauth2/authorize',
    tokenUrl: 'https://connect.squareupsandbox.com/oauth2/token',
    appId: import.meta.env.VITE_SQUARE_SANDBOX_APP_ID
  }
};

export type SquareEnvironment = 'production' | 'sandbox';

export interface SquareApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  environment?: SquareEnvironment;
}

async function refreshSquareToken(userId: string, refreshToken: string, environment: SquareEnvironment = 'production') {
  try {
    console.log('Attempting to refresh Square token...');
    
    const response = await fetch(SQUARE_CONFIG[environment].tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SQUARE_CONFIG[environment].appId,
        client_secret: squareAppSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to refresh token: ${JSON.stringify(errorData)}`);
    }

    const tokenData = await response.json();
    console.log('Token refresh successful');
    
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 0));

    // Update the tokens in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        square_access_token: tokenData.access_token,
        square_refresh_token: tokenData.refresh_token || refreshToken,
        square_token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update tokens in database:', updateError);
      throw updateError;
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing Square token:', error);
    throw error;
  }
}

export async function makeSquareApiCall(endpoint: string, options: SquareApiOptions = {}) {
  const { method = 'GET', body, environment = 'production' } = options;
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('square_access_token, square_refresh_token, square_token_expires_at, square_merchant_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile.square_access_token) {
      console.error('No Square access token found for user:', user.id);
      throw new Error('Square account not connected');
    }

    let accessToken = profile.square_access_token;
    const tokenExpiresAt = new Date(profile.square_token_expires_at);

    // Refresh token if it's expired or about to expire (within 10 minutes)
    if (tokenExpiresAt.getTime() - Date.now() < 10 * 60 * 1000) {
      console.log('Token is expiring soon, attempting refresh...');
      if (!profile.square_refresh_token) {
        console.error('No refresh token available for user:', user.id);
        throw new Error('Square access token has expired. Please reconnect your Square account.');
      }
      try {
        accessToken = await refreshSquareToken(user.id, profile.square_refresh_token, environment);
        console.log('Token refreshed successfully');
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Failed to refresh Square token. Please reconnect your Square account.');
      }
    }

    const baseUrl = environment === 'production' 
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    console.log('Making Square API call to:', endpoint);
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-02-15'
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Square API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Square API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Square API call error:', error);
    throw error;
  }
}

export async function revokeSquareToken(userId: string, environment: SquareEnvironment = 'production') {
  try {
    // Get the current access token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('square_access_token')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.square_access_token) {
      throw new Error('No Square access token found');
    }

    // Revoke the token with Square
    const baseUrl = environment === 'production' 
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    const response = await fetch(`${baseUrl}/oauth2/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SQUARE_CONFIG[environment].appId,
        access_token: profile.square_access_token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to revoke token: ${JSON.stringify(errorData)}`);
    }

    // Clear Square-related data from the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        square_access_token: null,
        square_refresh_token: null,
        square_token_expires_at: null,
        square_merchant_id: null,
        square_environment: null,
        square_connected_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error revoking Square token:', error);
    throw error;
  }
}

export async function checkSquareConnection(): Promise<{
  isConnected: boolean;
  error?: string;
  merchantId?: string;
  expiresAt?: string;
}> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('square_access_token, square_merchant_id, square_token_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    if (!profile.square_access_token || !profile.square_merchant_id) {
      return { isConnected: false };
    }

    // Check if token is expired
    const tokenExpiresAt = new Date(profile.square_token_expires_at);
    if (tokenExpiresAt.getTime() < Date.now()) {
      return {
        isConnected: false,
        error: 'Square access token has expired',
        merchantId: profile.square_merchant_id,
        expiresAt: profile.square_token_expires_at
      };
    }

    return {
      isConnected: true,
      merchantId: profile.square_merchant_id,
      expiresAt: profile.square_token_expires_at
    };
  } catch (error) {
    console.error('Error checking Square connection:', error);
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}