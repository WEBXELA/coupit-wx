import { supabase } from './supabase';

interface SquareApiCall {
  endpoint: string;
  method: string;
  status_code: number;
  environment: 'production' | 'sandbox';
}

interface SquareApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  environment?: 'production' | 'sandbox';
}

async function renewSquareToken(refreshToken: string) {
  try {
    const response = await fetch('https://connect.squareup.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: import.meta.env.VITE_SQUARE_APP_ID,
        client_secret: import.meta.env.VITE_SQUARE_APP_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      // If the refresh token is invalid or expired, clear the Square connection
      if (response.status === 400 || response.status === 401) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!userError && user) {
          // Clear Square credentials but keep the merchant ID for reconnection
          const { data: profile } = await supabase
            .from('profiles')
            .select('square_merchant_id')
            .eq('id', user.id)
            .single();

          await supabase
            .from('profiles')
            .update({
              square_access_token: null,
              square_refresh_token: null,
              square_token_expires_at: null,
              // Keep the merchant ID for reconnection
              square_merchant_id: profile?.square_merchant_id || null,
            })
            .eq('id', user.id);
        }
        throw new Error('Square refresh token is invalid or expired. Please reconnect your Square account.');
      }
      throw new Error(`Failed to refresh token: ${JSON.stringify(responseData)}`);
    }

    // Calculate new expiration timestamp
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (responseData.expires_in || 0));

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Update the tokens in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        square_access_token: responseData.access_token,
        square_refresh_token: responseData.refresh_token || refreshToken, // Keep old refresh token if new one not provided
        square_token_expires_at: expiresAt.toISOString(),
        square_connected_at: new Date().toISOString(), // Update connection timestamp
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }

    return responseData.access_token;
  } catch (error) {
    console.error('Error renewing Square token:', error);
    throw error;
  }
}

export async function makeSquareApiCall(endpoint: string, options: SquareApiOptions = {}) {
  const { method = 'GET', body, environment = 'production' } = options;
  
  try {
    // Get the current user's Square access token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('square_access_token, square_refresh_token, square_token_expires_at, square_merchant_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch Square credentials');
    }

    if (!profile?.square_access_token) {
      // If we have a merchant ID but no token, we need to reconnect
      if (profile?.square_merchant_id) {
        window.location.href = '/square/onboarding';
        throw new Error('Square connection needs to be refreshed. Redirecting to reconnect...');
      }
      throw new Error('Square access token not found. Please connect your Square account first.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const expiresAt = profile.square_token_expires_at ? new Date(profile.square_token_expires_at) : null;
    const isExpired = expiresAt && expiresAt.getTime() - 5 * 60 * 1000 < Date.now();

    let accessToken = profile.square_access_token;

    // If token is expired and we have a refresh token, try to renew it
    if (isExpired && profile.square_refresh_token) {
      try {
        accessToken = await renewSquareToken(profile.square_refresh_token);
      } catch (renewError) {
        // If token renewal fails, redirect to onboarding
        window.location.href = '/square/onboarding';
        throw new Error('Square access token has expired. Please reconnect your Square account.');
      }
    }

    console.log('Making Square API call:', {
      endpoint,
      method,
      environment,
      hasToken: !!accessToken,
      merchantId: profile.square_merchant_id
    });

    // Make the API call to Square
    const response = await fetch(`https://connect.squareup.com${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Track the API call
    await trackSquareApiCall({
      endpoint,
      method,
      status_code: response.status,
      environment,
    });

    const responseData = await response.json();

    if (!response.ok) {
      // If we get a 401, the token is invalid - redirect to onboarding
      if (response.status === 401) {
        // Clear invalid tokens but keep merchant ID
        await supabase
          .from('profiles')
          .update({
            square_access_token: null,
            square_refresh_token: null,
            square_token_expires_at: null,
          })
          .eq('id', user.id);

        window.location.href = '/square/onboarding';
        throw new Error('Square access token is invalid. Please reconnect your Square account.');
      }
      
      console.error('Square API error response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });
      throw new Error(`Square API error: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error) {
    console.error('Square API call error:', error);
    throw error;
  }
}

export async function trackSquareApiCall(apiCall: SquareApiCall) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User not authenticated');
      return;
    }

    const { error } = await supabase
      .from('square_api_calls')
      .insert({
        profile_id: user.id,
        ...apiCall
      });

    if (error) {
      console.error('Error tracking API call:', error);
    }
  } catch (error) {
    console.error('Unexpected error tracking API call:', error);
  }
}

export async function verifyConnectedSellers() {
  try {
    // Get all profiles with Square connections
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, square_merchant_id')
      .not('square_merchant_id', 'is', null);

    if (profilesError) {
      throw profilesError;
    }

    const activeSellers = [];

    for (const profile of profiles) {
      // Check for production API calls in the last 30 days
      const { data: apiCalls, error: apiCallsError } = await supabase
        .from('square_api_calls')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('environment', 'production')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (apiCallsError) {
        console.error(`Error checking API calls for profile ${profile.id}:`, apiCallsError);
        continue;
      }

      // Check if there are any non-ListLocations API calls
      const hasActiveCalls = apiCalls.some(call => 
        call.endpoint !== '/v2/locations' && 
        call.status_code >= 200 && 
        call.status_code < 300
      );

      if (hasActiveCalls) {
        activeSellers.push({
          id: profile.id,
          email: profile.email,
          merchant_id: profile.square_merchant_id,
          last_active: apiCalls[0]?.created_at
        });
      }
    }

    return activeSellers;
  } catch (error) {
    console.error('Error verifying connected sellers:', error);
    return [];
  }
}

export async function checkSquareConnection() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Please log in first');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('square_access_token, square_refresh_token, square_merchant_id, square_token_expires_at')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch Square credentials');
    }

    if (!profile?.square_access_token) {
      throw new Error('No Square access token found. Please connect your Square account first.');
    }

    if (!profile?.square_merchant_id) {
      throw new Error('No Square merchant ID found. Please connect your Square account first.');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const expiresAt = profile.square_token_expires_at ? new Date(profile.square_token_expires_at) : null;
    const isExpired = expiresAt && expiresAt.getTime() - 5 * 60 * 1000 < Date.now();

    // If token is expired and we have a refresh token, try to renew it
    if (isExpired && profile.square_refresh_token) {
      try {
        await renewSquareToken(profile.square_refresh_token);
        // After successful renewal, fetch the updated profile
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('square_access_token, square_merchant_id, square_token_expires_at')
          .eq('id', user.id)
          .single();

        if (!updatedProfile?.square_access_token) {
          throw new Error('Failed to renew Square access token');
        }

        return {
          isConnected: true,
          merchantId: updatedProfile.square_merchant_id,
          expiresAt: updatedProfile.square_token_expires_at
        };
      } catch (renewError) {
        console.error('Failed to renew token:', renewError);
        // Clear invalid tokens but keep merchant ID
        await supabase
          .from('profiles')
          .update({
            square_access_token: null,
            square_refresh_token: null,
            square_token_expires_at: null,
          })
          .eq('id', user.id);
        throw new Error('Square access token has expired. Please reconnect your Square account.');
      }
    }

    // Verify the token is still valid by making a test API call
    try {
      const response = await fetch('https://connect.squareup.com/v2/merchants/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${profile.square_access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid Square access token');
      }

      return {
        isConnected: true,
        merchantId: profile.square_merchant_id,
        expiresAt: profile.square_token_expires_at
      };
    } catch (error) {
      console.error('Error verifying Square token:', error);
      // Clear invalid tokens but keep merchant ID
      await supabase
        .from('profiles')
        .update({
          square_access_token: null,
          square_refresh_token: null,
          square_token_expires_at: null,
        })
        .eq('id', user.id);
      throw new Error('Square access token is invalid. Please reconnect your Square account.');
    }
  } catch (error: any) {
    return {
      isConnected: false,
      error: error.message
    };
  }
} 