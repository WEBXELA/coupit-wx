import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function SquareTest() {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, square_merchant_id, square_token_expires_at')
        .not('square_merchant_id', 'is', null);

      if (error) throw error;
      setConnectedAccounts(data || []);
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      setError('Failed to fetch connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectNew = () => {
    // Generate and store state
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('square_oauth_state', state);

    // Build the OAuth URL with required parameters
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_SQUARE_APP_ID,
      scope: 'MERCHANT_PROFILE_READ PAYMENTS_READ PAYMENTS_WRITE ORDERS_READ ORDERS_WRITE CUSTOMERS_READ CUSTOMERS_WRITE ITEMS_READ ITEMS_WRITE INVENTORY_READ INVENTORY_WRITE',
      state: state,
      session: 'false',
      redirect_uri: 'https://coupit.ai/square/callback',
    });

    window.location.href = `https://connect.squareup.com/oauth2/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2B2C30] mb-4">
            Square Connection Test
          </h1>
          <p className="text-xl text-gray-600">
            Connect test accounts to meet Square's requirements
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#2B2C30]">
              Connected Accounts ({connectedAccounts.length}/5)
            </h2>
            <button
              onClick={fetchConnectedAccounts}
              className="flex items-center gap-2 text-[#2B2C30] hover:text-opacity-80"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading connected accounts...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-[#2B2C30]">{account.email}</p>
                      <p className="text-sm text-gray-500">
                        Merchant ID: {account.square_merchant_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Expires: {new Date(account.square_token_expires_at).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {connectedAccounts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No connected accounts found</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={handleConnectNew}
            className="bg-[#2B2C30] text-white px-8 py-3 rounded-lg hover:bg-opacity-90"
          >
            Connect New Account
          </button>
        </div>
      </div>
    </div>
  );
} 