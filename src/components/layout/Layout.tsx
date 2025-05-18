import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isSuccessPage = location.pathname === '/square/success';

  return (
    <div className="min-h-screen flex flex-col">
      {!isSuccessPage && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isSuccessPage && <Footer />}
    </div>
  );
}