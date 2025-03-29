import React from 'react';
import { Users, Store, TrendingUp, ShoppingBag } from 'lucide-react';

export function Stats() {
  return (
    <section className="bg-[#f7f7f7] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: <Users className="w-8 h-8 text-[#F1EFE8]" />, stat: "25K+", label: "UK Active Users" },
            { icon: <Store className="w-8 h-8 text-[#F1EFE8]" />, stat: "500+", label: "UK High Street Stores" },
            { icon: <TrendingUp className="w-8 h-8 text-[#F1EFE8]" />, stat: "35%", label: "Footfall Increase" },
            { icon: <ShoppingBag className="w-8 h-8 text-[#F1EFE8]" />, stat: "2.8x", label: "Average ROI" }
          ].map((item, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-2xl shadow-lg section-animate relative
                        before:absolute before:inset-0 before:rounded-2xl before:border-2 
                        before:border-[#F1EFE8]/30 before:scale-90 before:opacity-0
                        before:transition-all before:duration-300 hover:before:scale-105 
                        hover:before:opacity-100 after:absolute after:inset-0 after:rounded-2xl 
                        after:border-2 after:border-[#F1EFE8]/30 after:transition-all 
                        after:duration-500 hover:after:scale-110 hover:after:opacity-0
                        overflow-visible"
            >
              <div className="relative z-10">
                <div className="bg-[#f7f7f7] p-4 rounded-xl inline-block mb-4 
                              transition-transform duration-300 group-hover:scale-110 
                              group-hover:bg-[#F1EFE8]/10">
                  {item.icon}
                </div>
                <p className="text-3xl font-bold mt-4 mb-2 text-[#002131] 
                             transition-transform duration-300 group-hover:translate-x-2">
                  {item.stat}
                </p>
                <p className="text-gray-600 transition-transform duration-300 
                             group-hover:translate-x-2">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
