import React from 'react';
import { Award } from 'lucide-react';

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#002131] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="heading">What Our Clients Say About Coupit's AI-Powered Retail Solutions</h2>
          <p className="subheading max-w-2xl mx-auto">
            Join hundreds of satisfied businesses already using Coupit to boost engagement and sales
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "Coupit has transformed how we engage with customers. Our foot traffic is up 30% since implementing their AI-powered solution.",
              author: "Sarah Johnson",
              role: "Marketing Director, RetailPlus",
              image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80"
            },
            {
              quote: "The gamified promotions have revolutionized our loyalty program. Customer engagement has never been higher thanks to Coupit's innovative tools.",
              author: "Mike Chen",
              role: "Owner, Urban Coffee Co.",
              image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80"
            },
            {
              quote: "Easy to set up, amazing support, and most importantly - it drives real results. Our ROI has been incredible with Coupit's AI-driven analytics.",
              author: "Emily Rodriguez",
              role: "CEO, Fashion Forward",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-[#001824] p-8 rounded-2xl border border-[#62d84e]/20 section-animate">
              <Award className="w-8 h-8 text-[#62d84e] mb-4" />
              <p className="text-lg mb-6">{testimonial.quote}</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
