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
      .select('square_access_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch Square credentials');
    }

    if (!profile?.square_access_token) {
      throw new Error('Square access token not found');
    }

    console.log('Making Square API call:', {
      endpoint,
      method,
      environment,
      hasToken: !!profile.square_access_token
    });

    // Make the API call to Square
    const response = await fetch(`https://connect.squareup.com${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${profile.square_access_token}`,
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
      .select('square_access_token, square_merchant_id, square_token_expires_at')
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

    // Check if token is expired
    if (profile.square_token_expires_at) {
      const expiresAt = new Date(profile.square_token_expires_at);
      if (expiresAt < new Date()) {
        throw new Error('Square access token has expired. Please reconnect your Square account.');
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