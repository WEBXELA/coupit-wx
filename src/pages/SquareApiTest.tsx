import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeSquareApiCall, checkSquareConnection } from '../lib/square';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export function SquareApiTest() {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    error?: string;
    merchantId?: string;
  }>({ isConnected: false });
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
    details?: string;
  }>({ loading: false, success: false, message: '' });

  useEffect(() => {
    checkConnectionStatus();
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

  const testApiCalls = async () => {
    try {
      setTestStatus({ loading: true, success: false, message: 'Making test API calls...' });

      // 1. Create a test customer
      const customerResponse = await makeSquareApiCall('/v2/customers', {
        method: 'POST',
        body: {
          given_name: 'Test',
          family_name: 'Customer',
          email_address: `test${Date.now()}@example.com`,
          note: 'Test customer created for Square verification'
        },
        environment: 'production'
      });

      // 2. Create a test catalog item
      const catalogResponse = await makeSquareApiCall('/v2/catalog/object', {
        method: 'POST',
        body: {
          idempotency_key: `test-item-${Date.now()}`,
          object: {
            type: 'ITEM',
            id: `#test-item-${Date.now()}`,
            item_data: {
              name: 'Test Item',
              description: 'Test item created for Square verification',
              visibility: 'PRIVATE'
            }
          }
        },
        environment: 'production'
      });

      // 3. Get locations to use in order creation
      const locationsResponse = await makeSquareApiCall('/v2/locations', {
        method: 'GET',
        environment: 'production'
      });

      if (!locationsResponse.locations || locationsResponse.locations.length === 0) {
        throw new Error('No locations found in your Square account');
      }

      // 4. Create a test order
      const orderResponse = await makeSquareApiCall('/v2/orders', {
        method: 'POST',
        body: {
          idempotency_key: `test-order-${Date.now()}`,
          order: {
            location_id: locationsResponse.locations[0].id,
            line_items: [
              {
                name: 'Test Order Item',
                quantity: '1',
                base_price_money: {
                  amount: 100,
                  currency: 'USD'
                }
              }
            ]
          }
        },
        environment: 'production'
      });

      setTestStatus({
        loading: false,
        success: true,
        message: 'Successfully made test API calls to Square',
        details: 'Created test customer, catalog item, and order in production environment'
      });
    } catch (error: any) {
      console.error('API test error:', error);
      setTestStatus({
        loading: false,
        success: false,
        message: 'Failed to make test API calls',
        details: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2B2C30] mb-4">
            Square API Test
          </h1>
          <p className="text-xl text-gray-600">
            Make test API calls to verify your Square connection
          </p>
        </div>

        {!connectionStatus.isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-6 py-4 rounded-lg mb-8">
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

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">
              Test API Calls
            </h2>
            <p className="text-gray-600 mb-6">
              Click the button below to make test API calls to Square. This will:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Create a test customer</li>
              <li>Create a test catalog item</li>
              <li>Create a test order</li>
            </ul>
            <p className="text-sm text-gray-500 mb-6">
              These API calls will help verify your Square connection and meet Square's requirements for active sellers.
            </p>
          </div>

          <button
            onClick={testApiCalls}
            disabled={!connectionStatus.isConnected || testStatus.loading}
            className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              connectionStatus.isConnected
                ? 'bg-[#2B2C30] text-white hover:bg-opacity-90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {testStatus.loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Making API Calls...
              </>
            ) : (
              'Make Test API Calls'
            )}
          </button>

          {testStatus.message && (
            <div className={`mt-6 p-4 rounded-lg ${
              testStatus.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              <div className="flex items-start gap-3">
                {testStatus.success ? (
                  <CheckCircle className="w-6 h-6 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 mt-1" />
                )}
                <div>
                  <p className="font-medium">{testStatus.message}</p>
                  {testStatus.details && (
                    <p className="text-sm mt-2">{testStatus.details}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}