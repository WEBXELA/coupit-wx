import React from 'react';
import { useNavigate } from 'react-router-dom';

export function SquareSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Square Account Connected</h2>
        <p className="text-gray-600 mb-6">
          Your Square account has been successfully connected to Coupit. You can now use our AI-powered retail solutions.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-[#2B2C30] text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
} 