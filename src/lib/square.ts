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
      console.error('Token refresh error:', errorData);
      throw new Error(`Failed to refresh token: ${JSON.stringify(errorData)}`);
    }

    const tokenData = await response.json();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 0));

    // Update the tokens in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        square_access_token: tokenData.access_token,
        square_refresh_token: tokenData.refresh_token || refreshToken, // Keep old refresh token if new one not provided
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
      .select('square_access_token, square_refresh_token, square_token_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    if (!profile.square_access_token) {
      throw new Error('Square account not connected');
    }

    let accessToken = profile.square_access_token;
    const tokenExpiresAt = new Date(profile.square_token_expires_at);

    // Refresh token if it's expired or about to expire (within 5 minutes)
    if (tokenExpiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      if (!profile.square_refresh_token) {
        throw new Error('Square access token has expired. Please reconnect your Square account.');
      }
      accessToken = await refreshSquareToken(user.id, profile.square_refresh_token, environment);
    }

    const baseUrl = environment === 'production' 
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

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
      throw new Error(`Square API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Square API call error:', error);
    throw error;
  }
}