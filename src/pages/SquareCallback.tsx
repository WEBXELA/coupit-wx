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
        const storedStateData = localStorage.getItem('square_oauth_state');
        if (!storedStateData) {
          const errorMsg = 'No stored state found - possible CSRF attack';
          console.error(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        try {
          const { value: storedState, timestamp } = JSON.parse(storedStateData);
          
          // Check if state is expired (older than 10 minutes)
          if (Date.now() - timestamp > 10 * 60 * 1000) {
            const errorMsg = 'State parameter expired - please try again';
            console.error(errorMsg);
            setErrorMessage(errorMsg);
            return;
          }

          if (!state || state !== storedState) {
            const errorMsg = 'Invalid state parameter - possible CSRF attack';
            console.error(errorMsg, { received: state, stored: storedState });
            setErrorMessage(errorMsg);
            return;
          }
        } catch (parseError) {
          const errorMsg = 'Invalid stored state format';
          console.error(errorMsg, parseError);
          setErrorMessage(errorMsg);
          return;
        }

        // Clear the stored state immediately after validation
        localStorage.removeItem('square_oauth_state');

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
            'Square-Version': '2024-01-17',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: import.meta.env.VITE_SQUARE_APP_ID,
            client_secret: import.meta.env.VITE_SQUARE_APP_SECRET,
            code,
            grant_type: 'authorization_code'
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

        // Verify the merchant ID and tokens
        if (!tokenData.merchant_id) {
          const errorMsg = 'No merchant ID received from Square';
          console.error(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        if (!tokenData.access_token || !tokenData.refresh_token) {
          const errorMsg = 'Incomplete token data received from Square';
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
            square_connected_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          setErrorMessage(`Failed to save Square credentials: ${updateError.message}`);
          return;
        }

        // Verify the connection by making a test API call
        try {
          const testResponse = await fetch('https://connect.squareup.com/v2/merchants/me', {
            method: 'GET',
            headers: {
              'Square-Version': '2024-01-17',
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!testResponse.ok) {
            throw new Error('Failed to verify Square connection');
          }

          const testData = await testResponse.json();
          console.log('Successfully verified Square connection:', testData);

          // Redirect to success page
          navigate('/square/success');
        } catch (error) {
          console.error('Error verifying Square connection:', error);
          setErrorMessage('Failed to verify Square connection. Please try again.');
          return;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
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