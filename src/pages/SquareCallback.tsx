import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SquareCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code and state from the URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        console.log('Square Callback Params:', {
          code,
          state,
          error,
          error_description
        });

        // Check for errors
        if (error) {
          console.error('Square OAuth error:', error, error_description);
          navigate(`/square/onboarding?error=${error}&error_description=${error_description}`);
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          navigate('/square/onboarding?error=no_code');
          return;
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('square_oauth_state');
        console.log('State validation:', { received: state, stored: storedState });
        
        if (!state || state !== storedState) {
          console.error('Invalid state parameter');
          navigate('/square/onboarding?error=invalid_state');
          return;
        }

        // Clear the stored state
        sessionStorage.removeItem('square_oauth_state');

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('User not authenticated:', userError);
          navigate('/square/onboarding?error=not_authenticated');
          return;
        }

        // Exchange the authorization code for an access token
        const response = await fetch('https://connect.squareup.com/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: import.meta.env.VITE_SQUARE_APP_ID,
            client_secret: import.meta.env.VITE_SQUARE_APP_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `${window.location.origin}/square/callback`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Token exchange error:', errorData);
          throw new Error(`Failed to exchange code for token: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('Token exchange successful:', { 
          access_token: data.access_token ? 'present' : 'missing',
          refresh_token: data.refresh_token ? 'present' : 'missing',
          expires_in: data.expires_in,
          merchant_id: data.merchant_id
        });

        // Store the access token in Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            square_access_token: data.access_token,
            square_refresh_token: data.refresh_token,
            square_token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
            square_merchant_id: data.merchant_id,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw updateError;
        }

        // Redirect to success page
        navigate('/square/success');
      } catch (error) {
        console.error('Error handling Square callback:', error);
        navigate(`/square/onboarding?error=callback_error&details=${encodeURIComponent(error.message)}`);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Connecting to Square...</h2>
        <p className="text-gray-600">Please wait while we connect your Square account.</p>
      </div>
    </div>
  );
} 