import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { Pricing } from './pages/Pricing';
import { SquareOnboarding } from './pages/SquareOnboarding';
import { SquareCallback } from './pages/SquareCallback';
import { SquareSuccess } from './pages/SquareSuccess';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/square/onboarding" element={<SquareOnboarding />} />
        <Route path="/square/callback" element={<SquareCallback />} />
        <Route path="/square/success" element={<SquareSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;