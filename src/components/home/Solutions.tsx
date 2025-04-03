import React from 'react';

export function Solutions() {
  return (
    <section className="bg-[#2B2C30] section-padding">
      <div className="max-w-6xl mx-auto">
        {/* POS Section */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-[#F1EFE8] text-4xl md:text-5xl font-bold mb-6">
              POS APP STORES & COUNTER TOP TERMINALS
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ideal for coffee shops, boutiques, salons. We can integrate
              with their existing POS system or they can invest in a
              counter-top terminal.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              'https://github.com/Coupit-ai/brand-images/blob/main/pos1.png?raw=true',
              'https://github.com/Coupit-ai/brand-images/blob/main/pos2.png?raw=true',
              'https://github.com/Coupit-ai/brand-images/blob/main/pos3.png?raw=true'
            ].map((image, index) => (
              <div key={index} className="relative section-animate">
                <div className="bg-gradient-to-br from-[#1A1A1C] to-[#2B2C30] p-6 rounded-2xl transform hover:scale-105 transition-all duration-500">
                  <img 
                    src={image}
                    alt={`POS Terminal ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Exhibits Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-[#F1EFE8] text-4xl md:text-5xl font-bold mb-6">
              DIGITAL EXHIBITS,<br />
              GAMIFICATION & CONNECTIVITY
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ideal for leading high-street brands. We work with the retailer to bring
              their brand to life in a digital exhibit.
              We plan to integrate our digital exhibit technology with the brands existing
              customer loyalty apps to provide additional value and synchronicity for the
              brand and the customer.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              'https://github.com/Coupit-ai/brand-images/blob/main/digital-1.png?raw=true',
              'https://github.com/Coupit-ai/brand-images/blob/main/digital-2.png?raw=true',
              'https://github.com/Coupit-ai/brand-images/blob/main/digital-3.png?raw=true'
            ].map((image, index) => (
              <div key={index} className="relative section-animate">
                <div className="bg-gradient-to-br from-[#1A1A1C] to-[#2B2C30] p-6 rounded-2xl transform hover:scale-105 transition-all duration-500">
                  <img 
                    src={image}
                    alt={`Digital Exhibit ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#F1EFE8]/10 rounded-full blur-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}