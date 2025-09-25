import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import CurrentFlights from './components/CurrentFlights';
import LayoverChances from './components/LayoverChances';
import About from './components/About';
import ChatWidget from './components/ChatWidget';
import FlightDetails from './components/FlightDetails';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));

  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const renderPage = () => {
    // allow hash-based deep link to flight details when icao24 param present
    if (hash.startsWith('#/flight')) {
      const qs = hash.split('?')[1] || '';
      const params = new URLSearchParams(qs);
      if (params.get('icao24')) {
        return <FlightDetails />;
      }
    }
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'flights':
        return <CurrentFlights />;
      case 'layover':
        return <LayoverChances />;
      case 'about':
        return <About />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      <Navbar setCurrentPage={setCurrentPage} />
      {/* main flex: 1 ensures it grows, overflow-y auto allows page scroll if content taller */}
      <main style={{ flex: 1, width: '100%', margin: 0, padding: 0, display: 'block', overflowY: 'auto' }}>
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
      <ChatWidget />
    </div>
  );
}

export default App;