import { supabase } from './supabase';

async function refreshSquareToken(userId: string, refreshToken: string) {
  try {
    const response = await fetch('https://connect.squareup.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-01-18',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: import.meta.env.VITE_SQUARE_APP_ID,
        client_secret: import.meta.env.VITE_SQUARE_APP_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to refresh token: ${JSON.stringify(errorData)}`);
    }

    const tokenData = await response.json();

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 0));

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        square_access_token: tokenData.access_token,
        square_refresh_token: tokenData.refresh_token || refreshToken,
        square_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update tokens: ${updateError.message}`);
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing Square token:', error);
    throw error;
  }
}

export async function makeSquareApiCall(endpoint: string, options: any = {}) {
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

    if (profileError) {
      throw new Error('Failed to fetch Square credentials');
    }

    if (!profile?.square_access_token) {
      throw new Error('Square access token not found');
    }

    let accessToken = profile.square_access_token;
    if (profile.square_token_expires_at) {
      const expiresAt = new Date(profile.square_token_expires_at);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      
      if (expiresAt <= fiveMinutesFromNow && profile.square_refresh_token) {
        accessToken = await refreshSquareToken(user.id, profile.square_refresh_token);
      }
    }

    const response = await fetch(`https://connect.squareup.com${endpoint}`, {
      method,
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    await trackSquareApiCall({
      endpoint,
      method,
      status_code: response.status,
      environment,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Square API error: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error) {
    console.error('Square API call error:', error);
    throw error;
  }
}

export async function trackSquareApiCall(apiCall: any) {
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

export async function checkSquareConnection() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Please log in first');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('square_access_token, square_merchant_id, square_token_expires_at, square_refresh_token')
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

    if (profile.square_token_expires_at) {
      const expiresAt = new Date(profile.square_token_expires_at);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      
      if (expiresAt <= fiveMinutesFromNow && profile.square_refresh_token) {
        await refreshSquareToken(user.id, profile.square_refresh_token);
      }
    }

    return {
      isConnected: true,
      merchantId: profile.square_merchant_id,
      expiresAt: profile.square_token_expires_at
    };
  } catch (error: any) {
    return {
      isConnected: false,
      error: error.message
    };
  }
}