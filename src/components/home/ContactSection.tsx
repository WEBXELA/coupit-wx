import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ContactSection() {
  return (
    <section className="bg-[#002131] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading">Get in Touch with Coupit</h2>
          <p className="subheading max-w-2xl mx-auto">
            Have questions about our AI-powered retail solutions? We're here to help. Reach out to us through any of these channels.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-[#001824] p-8 rounded-2xl border border-[#62d84e]/20 section-animate hover:border-[#62d84e]/40 transition-all duration-300 group">
            <div className="bg-[#002131] p-6 rounded-xl inline-block mb-6 group-hover:bg-[#62d84e]/10 transition-colors duration-300">
              <Mail className="w-10 h-10 text-[#62d84e]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Email Us</h3>
            <p className="text-gray-400 mb-6">Ready to answer your questions at contact@coupit.ai</p>
            <a 
              href="mailto:contact@coupit.ai" 
              className="inline-flex items-center text-[#62d84e] hover:gap-3 gap-2 transition-all duration-300"
            >
              Send email 
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
          
          <div className="bg-[#001824] p-8 rounded-2xl border border-[#62d84e]/20 section-animate hover:border-[#62d84e]/40 transition-all duration-300 group">
            <div className="bg-[#002131] p-6 rounded-xl inline-block mb-6 group-hover:bg-[#62d84e]/10 transition-colors duration-300">
              <Phone className="w-10 h-10 text-[#62d84e]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Call Us</h3>
            <p className="text-gray-400 mb-6">Speak with our team at +44 7535 499519</p>
            <a 
              href="tel+44 7535 499519" 
              className="inline-flex items-center text-[#62d84e] hover:gap-3 gap-2 transition-all duration-300"
            >
              Call now 
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
          
          <div className="bg-[#001824] p-8 rounded-2xl border border-[#62d84e]/20 section-animate hover:border-[#62d84e]/40 transition-all duration-300 group">
            <div className="bg-[#002131] p-6 rounded-xl inline-block mb-6 group-hover:bg-[#62d84e]/10 transition-colors duration-300">
              <MapPin className="w-10 h-10 text-[#62d84e]" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Visit Us</h3>
            <p className="text-gray-400 mb-6">UK<br /></p>
            <a 
              href="https://maps.app.goo.gl/8J8E25oE85gRaqEM6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-[#62d84e] hover:gap-3 gap-2 transition-all duration-300"
            >
              Get directions 
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>
        </div>

        <div className="text-center">
          <Link 
            to="/contact" 
            className="primary-button inline-flex items-center gap-2 group"
          >
            Contact Us for Details
            <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
