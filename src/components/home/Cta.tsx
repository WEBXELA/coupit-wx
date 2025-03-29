import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

export function Cta() {
  return (
    <section className="bg-[#F1EFE8] section-padding">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="heading text-[#002131]">The Future of In-Store Engagement Starts Here</h2>
        <p className="subheading text-[#002131]/80 max-w-2xl mx-auto">
          Transform the way you connect. Let's redefine retail—together with AI-powered retail solutions.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-[#002131] text-white px-8 py-3 rounded-full font-semibold 
                   hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
            Request a Demo <ArrowRight className="w-5 h-5" />
          </button>
          <button className="border-2 border-[#002131] text-[#002131] px-8 py-3 rounded-full font-semibold 
                   hover:bg-[#002131] hover:text-white transition-all duration-300 flex items-center gap-2">
            Contact Sales <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
