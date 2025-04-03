import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Pricing() {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-[#2B2C30]">Pricing</h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Our pricing is simple and transparent.
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-[#2B2C30]">Basic Plan</h2>
              <p className="text-4xl font-bold text-[#2B2C30]">£5</p>
              <p className="text-gray-600 mb-6">per month</p>
              <ul className="space-y-4 text-gray-600">
                <li>AI-Powered Analytics</li>
                <li>Interactive Displays</li>
                <li>Gamified Rewards</li>
              </ul>
              <button
                className="primary-button mt-6 w-full"
                onClick={() => navigate('/contact')}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}