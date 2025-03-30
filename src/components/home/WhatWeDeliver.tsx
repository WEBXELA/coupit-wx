import React from 'react';
import { Building2, Zap, BarChart3, Airplay as Display, Gift, Wallet, Smartphone, UserCheck } from 'lucide-react';

export function WhatWeDeliver() {
  return (
    <section className="bg-[#2B2C30] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading">What We Deliver</h2>
          <p className="subheading max-w-2xl mx-auto">
            Powerful AI-powered retail solutions for both brands and shoppers
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* For Brands */}
          <div className="section-animate">
            <div className="bg-[#1A1A1C] p-8 rounded-2xl border border-[#F1EFE8]/20 h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#2B2C30] p-4 rounded-xl">
                  <Building2 className="w-8 h-8 text-[#F1EFE8]" />
                </div>
                <h3 className="text-2xl font-bold">For Brands</h3>
              </div>
              <div className="space-y-6">
                {[
                  {
                    icon: <Zap className="w-6 h-6 text-[#F1EFE8]" />,
                    title: "AI-Powered Tools",
                    description: "Drive revenue and customer engagement with intelligent automation and personalization"
                  },
                  {
                    icon: <BarChart3 className="w-6 h-6 text-[#F1EFE8]" />,
                    title: "Real-Time Insights",
                    description: "Optimize campaigns and inventory with data-driven analytics and reporting"
                  },
                  {
                    icon: <Display className="w-6 h-6 text-[#F1EFE8]" />,
                    title: "Beautiful Displays",
                    description: "Captivate customers with sleek, interactive digital experiences"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">{feature.title}</h4>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* For Shoppers */}
          <div className="section-animate">
            <div className="bg-[#1A1A1C] p-8 rounded-2xl border border-[#F1EFE8]/20 h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#2B2C30] p-4 rounded-xl">
                  <UserCheck className="w-8 h-8 text-[#F1EFE8]" />
                </div>
                <h3 className="text-2xl font-bold">For Shoppers</h3>
              </div>
              <div className="space-y-6">
                {[
                  {
                    icon: <Gift className="w-6 h-6 text-[#F1EFE8]" />,
                    title: "Interactive Experiences",
                    description: "Enjoy fun, gamified promotions with instant rewards and surprises"
                  },
                  {
                    icon: <Wallet className="w-6 h-6 text-[#F1EFE8]" />,
                    title: "Frictionless Discounts",
                    description: "Save deals directly to mobile wallets for seamless redemption"
                  },
                  {
                    icon: <Smartphone className="w-6 h-6 text-[#F1EFE8]" />,
                    title: "Mobile-First Design",
                    description: "Access rewards and offers easily from any mobile device"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">{feature.title}</h4>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
