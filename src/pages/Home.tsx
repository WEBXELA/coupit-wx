import React, { useEffect } from 'react';
import { Hero } from '../components/home/Hero';
import { Stats } from '../components/home/Stats';
import { Features } from '../components/home/Features';
import { HowItWorks } from '../components/home/HowItWorks';
import { WhatWeDeliver } from '../components/home/WhatWeDeliver';
import { WhyDifferent } from '../components/home/WhyDifferent';
import { FutureRetail } from '../components/home/FutureRetail';
import { Testimonials } from '../components/home/Testimonials';
import { ContactSection } from '../components/home/ContactSection';
import { Subscribe } from '../components/home/Subscribe';
import { Cta } from '../components/home/Cta';

export function Home() {
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1
    });

    document.querySelectorAll('.section-animate').forEach(
      element => observer.observe(element)
    );

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <WhatWeDeliver />
      <WhyDifferent />
      <FutureRetail />
      <Testimonials />
      <ContactSection />
      <Subscribe />
      <Cta />
    </div>
  );
}
