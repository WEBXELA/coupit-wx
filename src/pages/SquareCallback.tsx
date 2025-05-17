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
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error) {
          throw new Error(`Square OAuth error: ${error}${error_description ? ` - ${error_description}` : ''}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Square');
        }

        const storedState = sessionStorage.getItem('square_oauth_state');
        if (!state || state !== storedState) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        sessionStorage.removeItem('square_oauth_state');

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated - please log in again');
        }

        const tokenResponse = await fetch('https://connect.squareup.com/oauth2/token', {
          method: 'POST',
          headers: {
            'Square-Version': '2024-01-18',
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

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(`Failed to exchange code for token: ${JSON.stringify(errorData)}`);
        }

        const tokenData = await tokenResponse.json();

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 0));

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
          throw new Error(`Failed to update tokens: ${updateError.message}`);
        }

        navigate('/square/success');
      } catch (error) {
        console.error('Error handling Square callback:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
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