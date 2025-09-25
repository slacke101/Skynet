import React from 'react';
import './Footer.css';

export default function Footer({ setCurrentPage }) {
  const navigate = (page, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof setCurrentPage === 'function') {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col brand">
          <div className="footer-logo">SkyNet</div>
          <p className="footer-tag">Your all-in-one assistant for flights, layovers, and luggage.</p>
        </div>

        <div className="footer-col links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#" onClick={(e) => navigate('home', e)}>Home</a></li>
            <li><a href="#" onClick={(e) => navigate('flights', e)}>Current Flights</a></li>
            <li><a href="#" onClick={(e) => navigate('layover', e)}>Layover Chances</a></li>
            <li><a href="#" onClick={(e) => navigate('about', e)}>About</a></li>
          </ul>
        </div>

        <div className="footer-col meta">
          <h4>Powered By</h4>
          <ul>
            <li>Cesium & Resium</li>
            <li>OpenSky Network API</li>
            <li>Vite + React</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} SkyNet</span>
      </div>
    </footer>
  );
}


