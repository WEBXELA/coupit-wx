import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Contact } from './pages/Contact';
import { Pricing } from './pages/Pricing';
import { SquareOnboarding } from './pages/SquareOnboarding';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/square/onboarding" element={<SquareOnboarding />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;