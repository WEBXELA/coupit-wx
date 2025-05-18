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
    tokenUrl: 'https://connect.squareup.com/oauth2/token'
  },
  sandbox: {
    redirectUri: 'https://coupit.ai/square/sandbox/callback',
    oauthUrl: 'https://connect.squareupsandbox.com/oauth2/authorize',
    tokenUrl: 'https://connect.squareupsandbox.com/oauth2/token'
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
        client_id: squareAppId,
        client_secret: squareAppSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    // ... rest of the refresh token function ...
  } catch (error) {
    console.error('Error refreshing Square token:', error);
    throw error;
  }
}

export async function makeSquareApiCall(endpoint: string, options: SquareApiOptions = {}) {
  const { method = 'GET', body, environment = 'production' } = options;
  
  try {
    // ... existing user and profile checks ...

    // Make the API call to Square
    const baseUrl = environment === 'production' 
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // ... rest of the function ...
  } catch (error) {
    console.error('Square API call error:', error);
    throw error;
  }
}