import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

export function SquareOnboarding() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!session) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('square_merchant_id, square_access_token')
          .eq('id', session.user.id)
          .single();

        if (profile?.square_access_token) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkExistingConnection();
  }, [session, navigate]);

  const handleSignUp = async () => {
    try {
      setError('');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // Store additional user data
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
            }
          ]);

        if (profileError) throw profileError;

        // After successful signup, redirect to Square OAuth
        handleSquareConnect();
      }
    } catch (error: any) {
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

      // After successful signin, redirect to Square OAuth
      handleSquareConnect();
    } catch (error: any) {
      console.error('Error:', error.message);
      setError(error.message);
    }
  };

  const handleSquareConnect = async () => {
    try {
      // Generate a secure random state value
      const state = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Store the state in localStorage with a timestamp
      const stateData = {
        value: state,
        timestamp: Date.now()
      };
      localStorage.setItem('square_oauth_state', JSON.stringify(stateData));

      // Construct the OAuth URL
      const redirectUri = 'https://coupit.ai/square/callback';
      const scopes = [
        'MERCHANT_PROFILE_READ',
        'ORDERS_READ',
        'ORDERS_WRITE',
        'PAYMENTS_READ',
        'PAYMENTS_WRITE',
        'CUSTOMERS_READ',
        'CUSTOMERS_WRITE',
        'ITEMS_READ',
        'ITEMS_WRITE',
        'INVENTORY_READ',
        'INVENTORY_WRITE'
      ].join(' ');

      const authUrl = new URL('https://connect.squareup.com/oauth2/authorize');
      authUrl.searchParams.append('client_id', import.meta.env.VITE_SQUARE_APP_ID);
      authUrl.searchParams.append('scope', scopes);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('redirect_uri', redirectUri);

      // Redirect to Square's OAuth page
      window.location.href = authUrl.toString();
    } catch (error: any) {
      console.error('Error initiating Square connection:', error);
      setError('Failed to connect to Square. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we check your session.</p>
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
                className="w-full bg-[#2B2C30] text-white px-8 py-3 rounded-full font-semibold 
                         hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
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
                    className="w-full bg-[#2B2C30] text-white px-8 py-3 rounded-full font-semibold 
                             hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Sign Up <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="w-full bg-white text-[#2B2C30] px-8 py-3 rounded-full font-semibold 
                             border border-[#2B2C30] hover:bg-gray-50 transition-all duration-300 
                             flex items-center justify-center gap-2"
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
