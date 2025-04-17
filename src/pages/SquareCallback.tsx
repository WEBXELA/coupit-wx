import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SquareCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev, message]);
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code and state from the URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const error_description = searchParams.get('error_description');

        addDebugLog(`Received callback params - Code: ${code ? 'present' : 'missing'}, State: ${state}, Error: ${error}`);

        // Check for errors
        if (error) {
          const errorMsg = `Square OAuth error: ${error}${error_description ? ` - ${error_description}` : ''}`;
          addDebugLog(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        if (!code) {
          const errorMsg = 'No authorization code received from Square';
          addDebugLog(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        // Validate state parameter
        const storedState = sessionStorage.getItem('square_oauth_state');
        addDebugLog(`State validation - Received: ${state}, Stored: ${storedState}`);
        
        if (!state || state !== storedState) {
          const errorMsg = 'Invalid state parameter - possible CSRF attack';
          addDebugLog(errorMsg);
          setErrorMessage(errorMsg);
          return;
        }

        // Clear the stored state
        sessionStorage.removeItem('square_oauth_state');

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          const errorMsg = 'User not authenticated - please log in again';
          addDebugLog(`Auth error: ${userError?.message || 'No user found'}`);
          setErrorMessage(errorMsg);
          return;
        }

        addDebugLog(`Authenticated user: ${user.email}`);

        // Exchange the authorization code for an access token
        const redirectUri = 'https://coupit.ai/square/callback';
        addDebugLog(`Using redirect URI: ${redirectUri}`);

        try {
          const tokenResponse = await fetch('https://connect.squareup.com/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Square-Version': '2024-02-22'
            },
            body: JSON.stringify({
              client_id: import.meta.env.VITE_SQUARE_APP_ID,
              client_secret: import.meta.env.VITE_SQUARE_APP_SECRET,
              code,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code'
            }),
          });

          addDebugLog(`Token response status: ${tokenResponse.status}`);
          const tokenData = await tokenResponse.json();
          
          if (!tokenResponse.ok) {
            addDebugLog(`Token exchange error: ${JSON.stringify(tokenData)}`);
            setErrorMessage(`Failed to exchange code for token: ${JSON.stringify(tokenData)}`);
            return;
          }

          addDebugLog('Token exchange successful');
          addDebugLog(`Received merchant ID: ${tokenData.merchant_id || 'missing'}`);

          // Calculate expiration timestamp
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 0));

          // Store the access token in Supabase
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              square_access_token: tokenData.access_token,
              square_refresh_token: tokenData.refresh_token,
              square_token_expires_at: expiresAt.toISOString(),
              square_merchant_id: tokenData.merchant_id,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (updateError) {
            addDebugLog(`Database update error: ${updateError.message}`);
            setErrorMessage(`Failed to save Square credentials: ${updateError.message}`);
            return;
          }

          addDebugLog('Successfully stored Square credentials');
          navigate('/square/success');
        } catch (fetchError) {
          addDebugLog(`Fetch error: ${fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'}`);
          throw fetchError;
        }
      } catch (error) {
        const errorMsg = `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        addDebugLog(`Error: ${errorMsg}`);
        setErrorMessage(errorMsg);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Connection Error</h2>
            <p>{errorMessage}</p>
          </div>
          
          <div className="bg-gray-900 text-gray-200 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <h3 className="text-white mb-2">Debug Log:</h3>
            <pre>{debugLog.join('\n')}</pre>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/square/onboarding')}
              className="bg-[#2B2C30] text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Connecting to Square...</h2>
        <p className="text-gray-600 mb-8">Please wait while we connect your Square account.</p>
        
        <div className="bg-gray-900 text-gray-200 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <h3 className="text-white mb-2">Debug Log:</h3>
          <pre>{debugLog.join('\n')}</pre>
        </div>
      </div>
    </div>
  );
}