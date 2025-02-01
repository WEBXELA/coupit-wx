import React from 'react';
import { Rocket, Globe, DollarSign } from 'lucide-react';

export function WhyDifferent() {
  return (
    <section className="bg-[#f7f7f7] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading text-[#002131]">What Makes Coupit Different</h2>
          <p className="subheading text-gray-600 max-w-2xl mx-auto">
            Innovation meets results in every interaction
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Rocket className="w-12 h-12 text-[#62d84e]" />,
              title: "AI-Driven Precision",
              subtitle: "Smarter insights. Better outcomes.",
              description: "Our AI technology learns and adapts to your unique business needs, delivering personalized solutions that drive real results."
            },
            {
              icon: <Globe className="w-12 h-12 text-[#62d84e]" />,
              title: "Scalable & Seamless",
              subtitle: "One platform. Infinite possibilities.",
              description: "Whether you have one store or thousands, our platform grows with you, maintaining performance at any scale."
            },
            {
              icon: <DollarSign className="w-12 h-12 text-[#62d84e]" />,
              title: "Revenue-Focused",
              subtitle: "Designed to grow your business, effortlessly.",
              description: "Every feature is built with your bottom line in mind, turning customer engagement into measurable revenue growth."
            }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-2xl shadow-lg section-animate relative
                         before:absolute before:inset-0 before:rounded-2xl before:border-2 
                         before:border-[#62d84e]/30 before:scale-95 before:opacity-0
                         before:transition-all before:duration-300 hover:before:scale-105 
                         hover:before:opacity-100 after:absolute after:inset-0 after:rounded-2xl 
                         after:border-2 after:border-[#62d84e]/30 after:transition-all 
                         after:duration-500 hover:after:scale-110 hover:after:opacity-0
                         overflow-visible"
            >
              <div className="relative z-10">
                <div className="bg-[#f7f7f7] p-4 rounded-xl inline-block mb-6
                               transform transition-all duration-300 group-hover:scale-110
                               group-hover:bg-[#62d84e]/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#002131] mb-2
                               transition-transform duration-300 group-hover:translate-x-2">
                  {feature.title}
                </h3>
                <p className="text-[#62d84e] font-semibold mb-4
                             transition-transform duration-300 group-hover:translate-x-2">
                  {feature.subtitle}
                </p>
                <p className="text-gray-600 transition-transform duration-300
                             group-hover:translate-x-2">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}