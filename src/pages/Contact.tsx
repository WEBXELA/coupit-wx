import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Toast } from '../components/ui/Toast';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      setFormData({ name: '', email: '', subject: '', message: '' });
      setShowConfirmation(true);
      
      // Hide confirmation after 5 seconds
      setTimeout(() => {
        setShowConfirmation(false);
      }, 5000);
    } catch (error) {
      setShowConfirmation(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-[#2B2C30]">Get in Touch with Coupit</h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions about our AI-powered retail solutions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {showConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
              <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4 transform animate-fade-in">
                <CheckCircle className="w-16 h-16 text-[#F1EFE8] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#2B2C30] mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
                <button 
                  onClick={() => setShowConfirmation(false)}
                  className="primary-button"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-[#2B2C30]">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg focus:outline-none focus:border-[#F1EFE8] text-[#2B2C30]"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-[#2B2C30]">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg focus:outline-none focus:border-[#F1EFE8] text-[#2B2C30]"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="mb-8">
                <label htmlFor="subject" className="block text-sm font-medium mb-2 text-[#2B2C30]">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg focus:outline-none focus:border-[#F1EFE8] text-[#2B2C30]"
                  placeholder="How can we help?"
                  required
                />
              </div>
              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-medium mb-2 text-[#2B2C30]">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-[#f7f7f7] border border-gray-200 rounded-lg focus:outline-none focus:border-[#F1EFE8] text-[#2B2C30]"
                  placeholder="Your message..."
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="primary-button w-full flex items-center justify-center gap-2 hover:shadow-lg transition-shadow duration-300"
              >
                Send Message <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}