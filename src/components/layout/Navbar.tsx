import React, { useState } from 'react';
import { Menu, X, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-[#f7f7f7] border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Target className="w-8 h-8 text-[#62d84e]" />
            <span className="text-2xl font-bold text-[#002131]">Coupit - AI-Powered Retail Solutions</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/contact" className="primary-button">Contact Us</Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#002131]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col gap-4">
              <Link to="/contact" className="primary-button w-full text-center">Contact Us</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
