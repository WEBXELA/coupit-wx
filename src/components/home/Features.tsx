import React from 'react';
import { BarChart3, ChevronRight, Airplay as Display, GamepadIcon } from 'lucide-react';

export function Features() {
  return (
    <section id="features" className="bg-[#2B2C30] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading">Powerful Features to Drive Retail Growth</h2>
          <p className="subheading max-w-2xl mx-auto">
            Everything you need to transform your physical store into a digital powerhouse with AI-powered retail solutions
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <BarChart3 className="w-12 h-12 text-[#F1EFE8]" />,
              title: "AI-Powered Analytics",
              description: "Get real-time insights into customer behavior, campaign performance, and sales trends",
              features: [
                "Smart inventory optimization",
                "Customer behavior tracking",
                "Predictive analytics"
              ]
            },
            {
              icon: <Display className="w-12 h-12 text-[#F1EFE8]" />,
              title: "Interactive Displays",
              description: "Engage customers with beautiful, interactive displays that drive action",
              features: [
                "Touch-screen interfaces",
                "QR code integration",
                "Digital signage"
              ]
            },
            {
              icon: <GamepadIcon className="w-12 h-12 text-[#F1EFE8]" />,
              title: "Gamified Rewards",
              description: "Turn shopping into an engaging experience with instant rewards",
              features: [
                "Interactive games",
                "Instant rewards",
                "Loyalty programs"
              ]
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="group bg-[#1A1A1C] p-8 rounded-2xl section-animate relative
                         before:absolute before:inset-0 before:rounded-2xl before:border-2 
                         before:border-[#F1EFE8]/20 before:transition-all before:duration-300
                         hover:before:border-[#F1EFE8]/40 hover:before:scale-105
                         after:absolute after:inset-0 after:rounded-2xl after:border-2
                         after:border-[#F1EFE8]/10 after:transition-all after:duration-500
                         hover:after:scale-110 hover:after:opacity-0
                         overflow-visible"
            >
              <div className="relative z-10">
                <div className="bg-[#2B2C30] p-4 rounded-xl inline-block mb-6
                               transform transition-all duration-300 group-hover:scale-110
                               group-hover:bg-[#F1EFE8]/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 transition-transform duration-300
                               group-hover:translate-x-2">{feature.title}</h3>
                <p className="text-gray-300 mb-6 transition-transform duration-300
                             group-hover:translate-x-2">{feature.description}</p>
                <ul className="space-y-2 text-gray-400">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 transition-transform
                                         duration-300 group-hover:translate-x-2">
                      <ChevronRight className="w-4 h-4 text-[#F1EFE8]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
