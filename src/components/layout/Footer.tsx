import React from 'react';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#001824] section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <Target className="w-8 h-8 text-[#F1EFE8]" />
            <span className="text-2xl font-bold">Coupit.</span>
          </Link>
        </div>
        <div className="text-center text-gray-400">
          <p>© {new Date().getFullYear()} Coupit. All rights reserved.</p>
          {/* <p>Boost your business with our AI-powered retail solutions.</p> */}
        </div>
      </div>
    </footer>
  );
}
