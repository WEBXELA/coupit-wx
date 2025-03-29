import React from 'react';
import { Settings, MessageSquare, GamepadIcon, LineChart } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#F1EFE8] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading text-[#002131]">How Coupit Works</h2>
          <p className="subheading text-[#002131]/80 max-w-2xl mx-auto">
            Get up and running in minutes with our seamless integration process
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              icon: <Settings className="w-12 h-12 text-[#F1EFE8]" />,
              title: "Install & Customize",
              description: "Place sleek, customizable displays in your store that match your brand",
              details: [
                "Quick setup process",
                "Brand-aligned design",
                "Flexible display options"
              ]
            },
            {
              icon: <MessageSquare className="w-12 h-12 text-[#F1EFE8]" />,
              title: "Seamless Integration",
              description: "Sync with your POS system and automate your entire workflow",
              details: [
                "POS integration",
                "Automated discounts",
                "Performance tracking"
              ]
            },
            {
              icon: <GamepadIcon className="w-12 h-12 text-[#F1EFE8]" />,
              title: "Engage Customers",
              description: "Create interactive experiences that drive engagement and loyalty",
              details: [
                "Gamified promotions",
                "QR code integration",
                "Instant rewards"
              ]
            },
            {
              icon: <LineChart className="w-12 h-12 text-[#F1EFE8]" />,
              title: "Measure & Optimize",
              description: "Get real-time insights to refine your strategy and boost results",
              details: [
                "Real-time analytics",
                "Performance insights",
                "Strategy optimization"
              ]
            }
          ].map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl border border-[#002131]/10 section-animate hover:border-[#002131]/20 transition-all duration-300 relative">
              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#002131]/30"></div>
              )}
              <div className="bg-[#f7f7f7] p-4 rounded-xl inline-block mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#002131]">{step.title}</h3>
              <p className="text-[#002131]/70 mb-4">{step.description}</p>
              <ul className="space-y-2">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#002131]/80">
                    <ChevronRight className="w-4 h-4 text-[#002131]" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
