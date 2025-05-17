import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSquareConnection } from '../lib/square';

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    merchantId?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkSquareConnection();
        setConnectionStatus(status);
      } catch (error) {
        console.error('Error checking Square connection:', error);
        setConnectionStatus({
          isConnected: false,
          error: error instanceof Error ? error.message : 'Failed to check Square connection'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we check your Square connection.</p>
        </div>
      </div>
    );
  }

  if (!connectionStatus?.isConnected) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Square Connection Required</h2>
          <p className="text-gray-600 mb-6">
            {connectionStatus?.error || 'Please connect your Square account to continue.'}
          </p>
          <button
            onClick={() => navigate('/square/onboarding')}
            className="bg-[#2B2C30] text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
          >
            Connect Square Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2B2C30] mb-8">Dashboard</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#2B2C30] mb-4">Square Connection Status</h2>
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Connected</span>
          </div>
          <p className="text-gray-600">
            Merchant ID: {connectionStatus.merchantId}
          </p>
        </div>
      </div>
    </div>
  );
} 