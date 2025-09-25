import React from 'react';
import './Navbar.css';
import logo from '../assets/skynetlogo.png';

export default function Navbar({ setCurrentPage }) {
  const handleClick = (page, event) => {
    event.preventDefault();
    setCurrentPage(page);
    // clear any deep-link hash so FlightDetails doesn't persist
    if (window.location.hash.startsWith('#/flight')) {
      window.location.hash = '#/';
    }
    // Ensure viewport returns to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={(e) => handleClick('home', e)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <img src={logo} alt="SkyNet Logo" className="logo-image" />
        <span className="brand-name">SkyNet</span>
      </div>

      <ul className="menu">
        <li><a href="#" onClick={(e) => handleClick('flights', e)}>Current Flights</a></li>
        <li><a href="#" onClick={(e) => handleClick('layover', e)}>Layover Chances</a></li>
        <li><a href="#" onClick={(e) => handleClick('about', e)}>About</a></li>
      </ul>
    </nav>
  );
}
