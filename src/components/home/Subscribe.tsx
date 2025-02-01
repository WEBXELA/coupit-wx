import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Subscribe() {
  const [email, setEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          setIsDuplicate(true);
          setShowConfirmation(true);
          setTimeout(() => {
            setShowConfirmation(false);
            setIsDuplicate(false);
          }, 3000);
        } else {
          throw error;
        }
      } else {
        setIsDuplicate(false);
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          setIsDuplicate(false);
        }, 3000);
        setEmail('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <section className="bg-[#f7f7f7] section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute transform rotate-45 -right-1/4 -top-1/4 w-1/2 h-1/2 bg-[#62d84e]/20 rounded-full blur-3xl"></div>
        <div className="absolute transform -rotate-45 -left-1/4 -bottom-1/4 w-1/2 h-1/2 bg-[#62d84e]/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative">
        <div className="bg-white p-12 rounded-2xl shadow-lg">
          <div className="text-center mb-12">
            <h2 className="heading text-[#002131]">Stay Updated</h2>
            <p className="subheading text-gray-600 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest updates, exclusive offers, and industry insights.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-grow px-6 py-4 bg-[#f7f7f7] border border-gray-200 rounded-full focus:outline-none focus:border-[#62d84e] text-gray-800"
                required
              />
              <button
                type="submit"
                className="primary-button whitespace-nowrap flex items-center justify-center gap-2"
              >
                Subscribe <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </form>

          {showConfirmation && (
            <div className="text-center mt-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isDuplicate 
                  ? 'bg-amber-50 text-amber-800' 
                  : 'bg-[#62d84e]/10 text-[#002131]'
              }`}>
                {isDuplicate ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">Email already subscribed. Please try another email.</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-[#62d84e]" />
                    <span className="font-medium">Thank you for subscribing!</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}