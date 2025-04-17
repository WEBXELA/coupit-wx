import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight } from 'lucide-react';

export function SquareOnboarding() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get('utm_source');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async () => {
    try {
      setError('');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/square/onboarding?utm_source=${utmSource}`,
          data: {
            utm_source: utmSource,
          },
        },
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
              utm_source: utmSource,
            }
          ]);

        if (profileError) throw profileError;

        // Redirect to Square OAuth
        window.location.href = `https://api.coupit.ai/v1/square/oauth/callback?utm_source=${utmSource}&user_id=${authData.user.id}`;
      }
    } catch (error) {
      console.error('Error:', error.message);
      setError(error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      setError('');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to Square OAuth after successful sign in
      window.location.href = `https://api.coupit.ai/v1/square/oauth/callback?utm_source=${utmSource}&user_id=${data.user.id}`;
    } catch (error) {
      console.error('Error:', error.message);
      setError(error.message);
    }
  };

  const fetchConnectedSellers = async (userId) => {
    try {
      const response = await fetch(`https://api.squareup.com/v2/merchants/${userId}/sellers`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connected sellers');
      }

      const data = await response.json();
      return data.sellers;
    } catch (error) {
      console.error('Error fetching connected sellers:', error.message);
      setError('Failed to fetch connected sellers. Please try again.');
      return [];
    }
  };

  const handleSquareConnect = async () => {
    if (session?.user) {
      try {
        const sellers = await fetchConnectedSellers(session.user.id);
        if (sellers.length > 0) {
          const { error: insertError } = await supabase
            .from('connected_sellers')
            .insert(sellers.map(seller => ({
              user_id: session.user.id,
              seller_id: seller.id,
              seller_name: seller.name,
              connected_at: new Date().toISOString()
            })));

          if (insertError) throw insertError;

          window.location.href = `https://api.coupit.ai/v1/square/oauth/callback?utm_source=${utmSource}&user_id=${session.user.id}`;
        } else {
          setError('No connected sellers found. Please ensure your Square account is properly connected.');
        }
      } catch (error) {
        console.error('Error during Square connect:', error.message);
        setError('Failed to connect Square account. Please try again.');
      }
    }
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
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
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
