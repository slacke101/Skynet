import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';
import phone from '../assets/phone.png';

export default function Hero({ onStart }) {
  return (
    <section className="hero-dark">
      <div className="hero-inner">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="tag">Smart Layover Assistant</span>
          <h1>
            Know what to do,<br /> where to go, and <span className="accent">when to walk</span>
          </h1>
          <p>Your layover just got smarter. Zero downloads needed.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onStart}>Try Layover Assistant →</button>
            <button className="btn-ghost" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>See How It Works</button>
          </div>
        </motion.div>

        <motion.div
          className="hero-mock"
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 20, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <img src={phone} alt="Layover assistant mock" />
        </motion.div>
      </div>
    </section>
  );
}
