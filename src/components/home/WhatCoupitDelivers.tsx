import React from 'react';

export function WhatCoupitDelivers() {
  return (
    <section className="bg-[#f7f7f7] section-padding">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-[#2B2C30] text-5xl font-bold tracking-tight mb-16 text-center">
          W H A T&nbsp;&nbsp;C O U P I T&nbsp;&nbsp;D E L I V E R S
        </h2>

        {/* AI-Powered Dashboard */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h3 className="text-[#2B2C30] text-4xl font-bold mb-6">
              AI-POWERED DATA<br />
              DRIVEN DASHBOARD
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Coupit's business dashboard provides real-time AI-generated insights into 
              stock and sales; giving brands the power to fulfil or create strategies to 
              launch on the Coupit terminals. Control multiple locations and screens with 
              one dashboard.
            </p>
          </div>
          <div className="relative">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <img 
                src="https://raw.githubusercontent.com/Coupit-ai/brand-images/main/dashboard-coupit.png"
                alt="AI-Powered Dashboard"
                className="w-full h-auto rounded-lg"
              />
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Physical Engagement Tools */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <img 
                  src="https://raw.githubusercontent.com/Coupit-ai/brand-images/main/physical-tool-coupit.png"
                  alt="Physical Engagement Tools"
                  className="w-full h-auto rounded-lg"
                />
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#2B2C30]/5 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-[#2B2C30] text-4xl font-bold mb-6">
              PHYSICAL<br />
              ENGAGEMENT TOOLS
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Once a sales strategy is launched on the terminals, customers can play, 
              engage and win rewards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}