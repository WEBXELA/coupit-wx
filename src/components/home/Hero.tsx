import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center bg-[#002131] section-padding pt-32">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="heading text-5xl lg:text-7xl">
            Upgrade Your<br />
              <span className="text-[#F1EFE8]">Physical Store</span> <br />
              with AI Today
            </h1>
            <p className="subheading max-w-2xl">
              Coupit bridges the gap between physical and digital retail with AI-powered 
              engagement tools that drive foot traffic and boost sales.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="primary-button flex items-center gap-2">
                Contact Us <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
              
              {/* Main image container */}
              <div className="relative bg-gradient-to-br from-[#001824] to-[#002131] p-6 rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80"
                  alt="Coupit Dashboard"
                  className="rounded-lg w-full h-auto shadow-2xl transform transition-transform duration-500 hover:scale-[1.02]"
                />
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-[#F1EFE8] text-[#002131] px-4 py-2 rounded-full text-sm font-semibold">
                  Live Demo
                </div>
                
                {/* Stats pill */}
                <div className="absolute -bottom-4 -left-4 bg-white text-[#002131] px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Active Users</p>
                    <p className="text-lg font-bold">50K+</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-600">Growth</p>
                    <p className="text-lg font-bold text-[#F1EFE8]">+30%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
