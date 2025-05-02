import React, { useState } from 'react';
import { makeSquareApiCall } from '../lib/square';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function SquareApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testApiCalls = async () => {
    try {
      setLoading(true);
      setResult(null);

      // 1. Create a test customer (write API call)
      const customerResponse = await makeSquareApiCall('/v2/customers', {
        method: 'POST',
        body: {
          given_name: 'Test',
          family_name: 'Customer',
          email_address: 'test@example.com',
          note: 'Test customer created for Square verification'
        },
        environment: 'production'
      });

      console.log('Customer created:', customerResponse);

      // 2. Create a test catalog item (write API call)
      const catalogResponse = await makeSquareApiCall('/v2/catalog/object', {
        method: 'POST',
        body: {
          type: 'ITEM',
          item_data: {
            name: 'Test Item',
            description: 'Test item created for Square verification',
            visibility: 'PRIVATE'
          }
        },
        environment: 'production'
      });

      console.log('Catalog item created:', catalogResponse);

      // 3. Create a test order (write API call)
      const orderResponse = await makeSquareApiCall('/v2/orders', {
        method: 'POST',
        body: {
          order: {
            location_id: 'main', // This will be replaced with actual location ID
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

      console.log('Order created:', orderResponse);

      setResult({
        success: true,
        message: 'Successfully made test API calls to Square',
        details: `Created test customer, catalog item, and order in production environment`
      });
    } catch (error: any) {
      console.error('API test error:', error);
      setResult({
        success: false,
        message: 'Failed to make test API calls',
        details: error.message || 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
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
            disabled={loading}
            className="primary-button flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Making API Calls...
              </>
            ) : (
              'Make Test API Calls'
            )}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 mt-1" />
                )}
                <div>
                  <p className="font-medium">{result.message}</p>
                  {result.details && (
                    <p className="text-sm mt-2">{result.details}</p>
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