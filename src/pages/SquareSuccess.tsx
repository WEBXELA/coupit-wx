import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, LogOut, ChevronDown, CheckCircle, Home } from 'lucide-react';

interface SquareAccount {
  id: string;
  email: string;
  square_merchant_id: string;
  square_token_expires_at: string;
  square_access_token: string | null;
}

export function SquareSuccess() {
  const navigate = useNavigate();
  const [connectedAccount, setConnectedAccount] = useState<SquareAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConnectedAccount();
  }, []);

  const fetchConnectedAccount = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!user) {
        throw new Error('Not authenticated. Please log in first.');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, square_merchant_id, square_token_expires_at, square_access_token')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setConnectedAccount(data);
    } catch (error: any) {
      console.error('Error fetching connected account:', error);
      setError(error?.message || 'Failed to fetch connected account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Profile Header */}
      <div className="fixed top-0 right-0 p-4 z-50">
        {connectedAccount && (
          <div className="relative group">
            <button 
              className="flex items-center gap-2 bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              aria-label="Account menu"
            >
              <div className="bg-[#2B2C30] p-2 rounded-full">
                <User className="w-6 h-6 text-white" />
              </div>
              <ChevronDown className="w-5 h-5 text-[#2B2C30]" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="p-4 border-b border-gray-100">
                <p className="font-medium text-[#2B2C30]">{connectedAccount.email}</p>
                <p className="text-sm text-gray-500">
                  Merchant ID: {connectedAccount.square_merchant_id || 'Not available'}
                </p>
                <p className="text-sm text-gray-500">
                  Connected: {new Date(connectedAccount.square_token_expires_at).toLocaleString()}
                </p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-[#2B2C30] mb-4">
              Successfully Connected!
            </h1>
            <p className="text-xl text-gray-600">
              Your Square account has been successfully connected to Coupit
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading account information...</p>
            </div>
          ) : connectedAccount && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-[#2B2C30] mb-6">
                Account Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2B2C30] p-3 rounded-full">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-lg text-[#2B2C30]">{connectedAccount.email}</p>
                    <p className="text-sm text-gray-500">
                      Merchant ID: {connectedAccount.square_merchant_id || 'Not available'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Connected: {new Date(connectedAccount.square_token_expires_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-8 space-y-4">
            <button
              onClick={() => navigate('/')}
              className="primary-button flex items-center justify-center gap-2 mx-auto"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>
            <p className="text-sm text-gray-500">
              © 2025 Coupit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}