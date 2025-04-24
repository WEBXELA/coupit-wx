import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { makeSquareApiCall } from '../lib/square';

interface SquareAccount {
  id: string;
  email: string;
  square_merchant_id: string;
  square_token_expires_at: string;
  square_access_token: string | null;
}

export function SquareTest() {
  const [connectedAccounts, setConnectedAccounts] = useState<SquareAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
  }>({ loading: false, success: false, message: '' });

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      setLoading(true);
      
      // First, get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!user) {
        throw new Error('Not authenticated. Please log in first.');
      }

      // Fetch profiles with Square connections
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, square_merchant_id, square_token_expires_at, square_access_token')
        .or('square_merchant_id.not.is.null,square_access_token.not.is.null');

      if (error) {
        throw error;
      }

      setConnectedAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching connected accounts:', error);
      setError(error?.message || 'Failed to fetch connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const testSquareConnection = async () => {
    try {
      setTestStatus({ loading: true, success: false, message: '' });
      
      // Make a test API call to Square
      const response = await makeSquareApiCall('/v2/merchants/me', {
        method: 'GET',
        environment: 'production'
      });

      setTestStatus({
        loading: false,
        success: true,
        message: 'Successfully connected to Square! Your account is now verified.'
      });

      // Refresh the connected accounts list
      await fetchConnectedAccounts();
    } catch (error: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: `Error: ${error.message}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2B2C30] mb-4">
            Square Connection Test
          </h1>
          <p className="text-xl text-gray-600">
            Test your Square connection and verify your account
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
              Connected Accounts ({connectedAccounts.length})
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
                        Merchant ID: {account.square_merchant_id || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {account.square_token_expires_at ? (
                      `Expires: ${new Date(account.square_token_expires_at).toLocaleDateString()}`
                    ) : (
                      'No expiration date'
                    )}
                  </div>
                </div>
              ))}

              {connectedAccounts.length === 0 && (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">No connected accounts found</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">
            Test Square Connection
          </h2>
          <p className="text-gray-600 mb-6">
            Click the button below to test your Square connection. This will make a test API call to Square
            and verify your account is properly connected.
          </p>

          <button
            onClick={testSquareConnection}
            disabled={testStatus.loading}
            className="primary-button flex items-center justify-center gap-2"
          >
            {testStatus.loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          {testStatus.message && (
            <div className={`mt-4 p-4 rounded-lg ${
              testStatus.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {testStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}