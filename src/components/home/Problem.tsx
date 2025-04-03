import React from 'react';

export function Problem() {
  return (
    <section className="bg-[#f7f7f7] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-[#2B2C30] text-5xl font-bold tracking-tight mb-8">
              T H E<br />P R O B L E M
            </h2>
            <p className="text-2xl text-[#2B2C30]/80 leading-relaxed">
              There's an urgent need for innovative solutions that bridge the gap between physical spaces and digital engagement
            </p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-[#1A1A1C] to-[#2B2C30] p-6 rounded-2xl">
              <img 
                src="https://raw.githubusercontent.com/Coupit-ai/brand-images/refs/heads/main/problemsolve-coupit.png"
                alt="The Problem"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}