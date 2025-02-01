import React from 'react';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';

export function FutureRetail() {
  return (
    <section className="bg-[#002131] section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute transform -rotate-45 -left-1/4 -top-1/4 w-1/2 h-1/2 bg-[#62d84e]/20 rounded-full blur-3xl"></div>
        <div className="absolute transform rotate-45 -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-[#62d84e]/20 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center">
          <div className="inline-block bg-[#001824] p-3 rounded-full mb-8">
            <Sparkles className="w-6 h-6 text-[#62d84e]" />
          </div>
          <h2 className="heading mb-4">The Future of In-Store Engagement Starts Here</h2>
          <p className="subheading mb-12">Transform the way you connect. Let's redefine retail—together.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="primary-button flex items-center gap-2">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </button>
            <button className="secondary-button flex items-center gap-2">
              Schedule Demo <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}