import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SQUARE_CONFIG, SquareEnvironment } from '../lib/square';
import { Loader2 } from 'lucide-react';

export function SquareCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setLoading(true);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        if (error) {
          const errorMsg = `Square OAuth error: ${error}${error_description ? ` - ${error_description}` : ''}`;
          setErrorMessage(errorMsg);
          return;
        }

        if (!code) {
          const errorMsg = 'No authorization code received from Square';
          setErrorMessage(errorMsg);
          return;
        }

        const storedState = sessionStorage.getItem('square_oauth_state');
        const environment = (sessionStorage.getItem('square_environment') || 'production') as SquareEnvironment;
        
        if (!state || state !== storedState) {
          const errorMsg = 'Invalid state parameter - possible CSRF attack';
          setErrorMessage(errorMsg);
          return;
        }

        sessionStorage.removeItem('square_oauth_state');
        sessionStorage.removeItem('square_environment');

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          const errorMsg = 'User not authenticated - please log in again';
          setErrorMessage(errorMsg);
          return;
        }

        const config = SQUARE_CONFIG[environment];
        const tokenResponse = await fetch(config.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: config.appId,
            client_secret: import.meta.env.VITE_SQUARE_APP_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          const errorMsg = `Failed to exchange code for token: ${JSON.stringify(errorData)}`;
          setErrorMessage(errorMsg);
          return;
        }

        const tokenData = await tokenResponse.json();

        if (!tokenData.merchant_id) {
          const errorMsg = 'No merchant ID received from Square';
          setErrorMessage(errorMsg);
          return;
        }

        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 0));

        // Create a new profile for the Square connection using user.id as both id and user_id
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            user_id: user.id,
            email: user.email,
            square_access_token: tokenData.access_token,
            square_refresh_token: tokenData.refresh_token,
            square_token_expires_at: expiresAt.toISOString(),
            square_merchant_id: tokenData.merchant_id,
            square_environment: environment,
            square_connected_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Database insert error:', insertError);
          setErrorMessage(`Failed to save Square credentials: ${insertError.message}`);
          return;
        }

        // Store the merchant ID in session storage for the success page
        sessionStorage.setItem('connected_merchant_id', tokenData.merchant_id);
        navigate('/square/success');
      } catch (error) {
        const errorMsg = `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('Error handling Square callback:', error);
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
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
        <Loader2 className="w-8 h-8 text-[#2B2C30] animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Connecting to Square...</h2>
        <p className="text-gray-600">Please wait while we connect your Square account.</p>
      </div>
    </div>
  );
}