import { supabase } from './supabase';

interface SquareApiCall {
  endpoint: string;
  method: string;
  status_code: number;
  environment: 'production' | 'sandbox';
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