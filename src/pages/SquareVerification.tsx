import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { verifyConnectedSellers } from '../lib/square';

interface ActiveSeller {
  id: string;
  email: string;
  merchant_id: string;
  last_active: string;
}

export function SquareVerification() {
  const [activeSellers, setActiveSellers] = useState<ActiveSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveSellers();
  }, []);

  const fetchActiveSellers = async () => {
    try {
      setLoading(true);
      const sellers = await verifyConnectedSellers();
      setActiveSellers(sellers);
    } catch (error: any) {
      console.error('Error fetching active sellers:', error);
      setError(error?.message || 'Failed to fetch active sellers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#2B2C30] mb-4">
            Square Seller Verification
          </h1>
          <p className="text-xl text-gray-600">
            Verify your connected sellers meet Square's requirements
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
              Active Sellers ({activeSellers.length})
            </h2>
            <button
              onClick={fetchActiveSellers}
              className="flex items-center gap-2 text-[#2B2C30] hover:text-opacity-80"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading active sellers...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-[#2B2C30]">{seller.email}</p>
                      <p className="text-sm text-gray-500">
                        Merchant ID: {seller.merchant_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last Active: {new Date(seller.last_active).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {activeSellers.length === 0 && (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">No active sellers found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Sellers need to make API calls in the production environment to be considered active.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 