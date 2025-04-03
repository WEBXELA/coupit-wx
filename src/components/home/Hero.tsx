import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="min-h-screen bg-[#2B2C30] section-padding pt-32">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="heading text-5xl lg:text-7xl">
            Upgrade Your Physical<br />
            <span className="text-[#F1EFE8]">Store with AI Today</span> 
          </h1>
          <p className="subheading max-w-2xl mx-auto">
            Coupit bridges the gap between physical and digital retail with AI-powered 
            engagement tools that drive foot traffic and boost sales.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/contact" className="primary-button flex items-center gap-2">
              Contact Us <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Store Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              src: "https://raw.githubusercontent.com/Coupit-ai/brand-images/refs/heads/main/meet-coupit-1.png",
              alt: "Coupit Store Display 1"
            },
            {
              src: "https://raw.githubusercontent.com/Coupit-ai/brand-images/refs/heads/main/meet-coupit-2.png",
              alt: "Coupit Store Display 2"
            },
            {
              src: "https://raw.githubusercontent.com/Coupit-ai/brand-images/refs/heads/main/meet-coupit-3.png",
              alt: "Coupit Store Display 3"
            }
          ].map((image, index) => (
            <div 
              key={index} 
              className="relative bg-gradient-to-br from-[#1A1A1C] to-[#2B2C30] p-6 rounded-2xl transform hover:scale-105 transition-all duration-500"
            >
              <img 
                src={image.src}
                alt={image.alt}
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}