import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SquareCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

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
          const errorMsg = `Square OAuth error: ${error}${error_description ? ` - ${error_description}` : ''}`;
          console.error(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        if (!code) {
          const errorMsg = 'No authorization code received from Square';
          console.error(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('square_oauth_state');
        console.log('State validation:', { received: state, stored: storedState });
        
        if (!state || state !== storedState) {
          const errorMsg = 'Invalid state parameter - possible CSRF attack';
          console.error(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        // Clear the stored state
        sessionStorage.removeItem('square_oauth_state');

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          const errorMsg = 'User not authenticated - please log in again';
          console.error(errorMsg, userError);
          setErrorMessage(errorMsg);
          return;
        }

        // Exchange the authorization code for an access token
        const tokenResponse = await fetch('https://connect.squareup.com/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: import.meta.env.VITE_SQUARE_APP_ID,
            client_secret: import.meta.env.VITE_SQUARE_APP_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: 'https://coupit.ai/square/callback',
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('Token exchange error:', errorData);
          const errorMsg = `Failed to exchange code for token: ${JSON.stringify(errorData)}`;
          setErrorMessage(errorMsg);
          return;
        }

        const tokenData = await tokenResponse.json();
        console.log('Token exchange successful:', { 
          access_token: tokenData.access_token ? 'present' : 'missing',
          refresh_token: tokenData.refresh_token ? 'present' : 'missing',
          expires_in: tokenData.expires_in,
          merchant_id: tokenData.merchant_id
        });

        // Verify the merchant ID
        if (!tokenData.merchant_id) {
          const errorMsg = 'No merchant ID received from Square';
          console.error(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        // Calculate expiration timestamp properly
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 0));

        // Store the access token in Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            square_access_token: tokenData.access_token,
            square_refresh_token: tokenData.refresh_token,
            square_token_expires_at: expiresAt.toISOString(),
            square_merchant_id: tokenData.merchant_id,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          setErrorMessage(`Failed to save Square credentials: ${updateError.message}`);
          return;
        }

        // Redirect to success page
        navigate('/square/success');
      } catch (error) {
        const errorMsg = `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('Error handling Square callback:', error);
        setErrorMessage(errorMsg);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/square/onboarding')}
            className="bg-[#2B2C30] text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Connecting to Square...</h2>
        <p className="text-gray-600">Please wait while we connect your Square account.</p>
      </div>
    </div>
  );
}