import React from 'react';

export function Plan() {
  return (
    <section className="bg-[#2B2C30] section-padding">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="heading text-[#F1EFE8]">Basic Plan</h2>
        <p className="subheading text-[#F1EFE8]/80 max-w-2xl mx-auto">
          £5 per month
        </p>
        <ul className="list-disc list-inside text-[#F1EFE8] mt-6">
          <li>Feature 1: AI-powered analytics</li>
          <li>Feature 2: Interactive displays</li>
          <li>Feature 3: Gamified rewards</li>
          <li>Feature 4: Real-time insights</li>
          <li>Feature 5: Seamless integration</li>
        </ul>
      </div>
    </section>
  );
}
