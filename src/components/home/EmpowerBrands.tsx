import React from 'react';

export function EmpowerBrands() {
  return (
    <section className="bg-[#f7f7f7] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-[#2B2C30] text-5xl font-bold mb-6">
              EMPOWER<br />
              BRANDS
            </h2>
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <img 
                  src="https://github.com/Coupit-ai/brand-images/blob/main/brand-empower-coupit.png?raw=true"
                  alt="Empower Brands"
                  className="w-full h-auto rounded-lg"
                />
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-[#2B2C30] text-5xl font-bold mb-6">
              ELEVATE<br />
              EXPERIENCES.
            </h2>
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <img 
                  src="https://github.com/Coupit-ai/brand-images/blob/main/experience-coupit.png?raw=true"
                  alt="Elevate Experiences"
                  className="w-full h-auto rounded-lg"
                />
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}