import React from 'react';
import { CheckCircle } from 'lucide-react';

export function SquareSuccess() {
  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
      <div className="text-center max-w-md mx-4">
        <div className="inline-block bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#2B2C30] mb-4">Successfully Connected!</h2>
        <p className="text-gray-600 mb-8">
          Your Square account has been successfully connected to Coupit. You can now start using our AI-powered retail solutions.
        </p>
        <a
          href="https://api.coupit.ai/v1/dashboard"
          className="bg-[#2B2C30] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 inline-block"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}