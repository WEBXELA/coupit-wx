import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { makeSquareApiCall, checkSquareConnection } from '../lib/square';

interface SquareAccount {
  id: string;
  email: string;
  square_merchant_id: string;
  square_token_expires_at: string;
  square_access_token: string | null;
}

export function SquareTest() {
  const navigate = useNavigate();
  const [connectedAccounts, setConnectedAccounts] = useState<SquareAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    error?: string;
    merchantId?: string;
    expiresAt?: string;
  }>({ isConnected: false });
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
    details?: string;
  }>({ loading: false, success: false, message: '' });

  useEffect(() => {
    checkConnectionStatus();
    fetchConnectedAccounts();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const status = await checkSquareConnection();
      setConnectionStatus(status);
    } catch (error: any) {
      console.error('Error checking connection status:', error);
      setConnectionStatus({
        isConnected: false,
        error: error.message
      });
    }
  };

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
      setTestStatus({ loading: true, success: false, message: 'Testing connection...' });
      
      // First verify we have a valid user and Square token
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please log in first');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('square_access_token, square_merchant_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch Square credentials');
      }

      if (!profile?.square_access_token) {
        throw new Error('No Square access token found. Please connect your Square account first.');
      }

      if (!profile?.square_merchant_id) {
        throw new Error('No Square merchant ID found. Please connect your Square account first.');
      }

      // Make a test API call to Square
      const response = await makeSquareApiCall('/v2/merchants/me', {
        method: 'GET',
        environment: 'production'
      });

      console.log('Square API Response:', response);

      if (!response || !response.merchant) {
        throw new Error('Invalid response from Square API');
      }

      setTestStatus({
        loading: false,
        success: true,
        message: 'Successfully connected to Square!',
        details: `Merchant ID: ${response.merchant.id}`
      });

      // Refresh the connection status and accounts list
      await checkConnectionStatus();
      await fetchConnectedAccounts();
    } catch (error: any) {
      console.error('Square connection test error:', error);
      setTestStatus({
        loading: false,
        success: false,
        message: 'Connection test failed',
        details: error.message || 'Unknown error occurred'
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

        {!connectionStatus.isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Square account not connected</p>
            <p className="text-sm mt-1">{connectionStatus.error}</p>
            <button
              onClick={() => navigate('/square/onboarding')}
              className="mt-3 flex items-center gap-2 text-yellow-700 hover:text-yellow-800"
            >
              Connect Square Account <ArrowRight className="w-4 h-4" />
            </button>
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
                  <button
                    onClick={() => navigate('/square/onboarding')}
                    className="mt-4 flex items-center gap-2 text-[#2B2C30] hover:text-opacity-80"
                  >
                    Connect Square Account <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {connectionStatus.isConnected && (
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
                <p className="font-medium">{testStatus.message}</p>
                {testStatus.details && (
                  <p className="text-sm mt-2">{testStatus.details}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}