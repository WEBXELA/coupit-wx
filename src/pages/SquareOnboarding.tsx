import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Auth } from '../components/auth/Auth';

export function SquareOnboarding() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
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
      console.error('Square connection error:', errorParam);
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

  const handleSquareConnect = () => {
    if (!SQUARE_APP_ID) {
      console.error('Square configuration is missing');
      return;
    }

    const state = generateState();
    sessionStorage.setItem('square_oauth_state', state);

    const redirectUri = 'https://coupit.ai/square/callback';
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

          {session ? (
            <div className="max-w-md mx-auto">
              <button
                onClick={handleSquareConnect}
                className="primary-button w-full"
              >
                Connect Square Account
              </button>
            </div>
          ) : (
            <Auth onAuthSuccess={() => setSession(true)} />
          )}
        </div>
      </div>
    </div>
  );
}