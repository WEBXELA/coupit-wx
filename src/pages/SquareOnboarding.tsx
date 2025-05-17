import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';

export function SquareOnboarding() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID;
  const SQUARE_OAUTH_URL = 'https://connect.squareup.com/oauth2/authorize';

  const generateState = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(`Square connection error: ${errorParam}`);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleSignUp = async () => {
    try {
      setError('');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
            }
          ]);

        if (profileError) throw profileError;

        handleSquareConnect();
      }
    } catch (error) {
      console.error('Error:', error.message);
      setError(error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      setError('');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      handleSquareConnect();
    } catch (error) {
      console.error('Error:', error.message);
      setError(error.message);
    }
  };

  const handleSquareConnect = () => {
    if (!SQUARE_APP_ID) {
      setError('Square configuration is missing. Please contact support.');
      return;
    }

    const state = generateState();
    sessionStorage.setItem('square_oauth_state', state);

    const redirectUri = `${window.location.origin}/square/callback`;
    const params = new URLSearchParams({
      client_id: SQUARE_APP_ID,
      scope: 'MERCHANT_PROFILE_READ PAYMENTS_READ PAYMENTS_WRITE ORDERS_READ ORDERS_WRITE CUSTOMERS_READ CUSTOMERS_WRITE ITEMS_READ ITEMS_WRITE INVENTORY_READ INVENTORY_WRITE',
      state: state,
      session: 'false',
      redirect_uri: redirectUri,
    });

    window.location.href = `${SQUARE_OAUTH_URL}?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#2B2C30]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-[#2B2C30]">
              Connect Your Square Account
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {session 
                ? "You're almost there! Connect your Square account to get started."
                : "Sign up or log in to connect your Square account with Coupit."}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {session ? (
              <button
                onClick={handleSquareConnect}
                className="primary-button w-full flex items-center justify-center gap-2"
              >
                Connect Square Account <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-[#2B2C30]"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-[#2B2C30]"
                  />
                  <button
                    onClick={handleSignUp}
                    className="primary-button w-full flex items-center justify-center gap-2"
                  >
                    Sign Up <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center gap-2 bg-[#2B2C30] text-white px-8 py-3 rounded-full font-semibold 
                             hover:bg-opacity-90 transition-all duration-300"
                  >
                    Log In <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}