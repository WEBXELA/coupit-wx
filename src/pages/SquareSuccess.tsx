import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface MerchantInfo {
  merchant_id: string;
  business_name: string;
  email: string;
  country: string;
  created_at: string;
}

export function SquareSuccess() {
  const navigate = useNavigate();
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null);

  useEffect(() => {
    const fetchMerchantInfo = async () => {
      const merchantId = sessionStorage.getItem('connected_merchant_id');
      if (!merchantId) {
        navigate('/square/onboarding');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('square_merchant_id, square_connected_at')
          .eq('square_merchant_id', merchantId)
          .single();

        if (error) throw error;

        if (data) {
          setMerchantInfo({
            merchant_id: data.square_merchant_id,
            business_name: 'Your Business', // You can fetch this from Square API if needed
            email: 'your@email.com', // You can fetch this from Square API if needed
            country: 'United States', // You can fetch this from Square API if needed
            created_at: data.square_connected_at
          });
        }
      } catch (error) {
        console.error('Error fetching merchant info:', error);
      }
    };

    fetchMerchantInfo();
  }, [navigate]);

  const handleAddAnotherAccount = () => {
    sessionStorage.removeItem('connected_merchant_id');
    navigate('/square/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center">
          <div className="inline-block bg-green-100 p-4 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Successfully Connected!</h2>
          
          {merchantInfo && (
            <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Account Details:</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Merchant ID:</span> {merchantInfo.merchant_id}</p>
                <p><span className="font-medium">Connected At:</span> {new Date(merchantInfo.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleAddAnotherAccount}
              className="w-full bg-[#2B2C30] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 flex items-center justify-center gap-2"
            >
              Connect Another Account <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border-2 border-[#2B2C30] text-[#2B2C30] px-6 py-3 rounded-lg hover:bg-[#2B2C30] hover:text-white transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}