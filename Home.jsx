import React, { useRef } from 'react';
import Hero from './Hero';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import Map3D from './Map3D';
import './Home.css';

// Automatically gather airline logos placed in src/assets/airlines/*.png
const airlineLogos = Object.entries(
  import.meta.glob('../assets/airlines/*.png', { eager: true, as: 'url' })
).map(([path, url]) => {
  const name = path.split('/').pop().replace(/\.png$/, '');
  return { name, src: url };
});

// Gather provider logos from src/assets/homelogo/* (svg/png/jpg/jpeg/webp)
const apiLogos = Object.entries(
  import.meta.glob('../assets/homelogo/*.{svg,png,jpg,jpeg,webp}', { eager: true, as: 'url' })
).map(([path, url]) => {
  const name = path
    .split('/')
    .pop()
    .replace(/\.(svg|png|jpg|jpeg|webp)$/i, '');
  return { name, src: url };
});

function Home({ setCurrentPage }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Animation values based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // helper hook to build scroll-driven fade slide per section
  const Section = ({ children, className, slide="up" }) => {
    const secRef = useRef(null);
    const inView = useInView(secRef, { margin: "-20% 0px -20% 0px", amount: 0.4 });

    return (
      <motion.section
        ref={secRef}
        className={className}
        style={{ position: 'relative' }}
        initial={{ opacity: 0, x: slide === 'left' ? -120 : slide === 'right' ? 120 : 0, y: slide === 'up' ? 80 : 0 }}
        animate={{ opacity: inView ? 1 : 0, x: 0, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-card">{children}</div>
      </motion.section>
    );
  };

  return (
    <div className="home-gradient">
      <Hero onStart={() => setCurrentPage('layover')} />
      <div ref={ref} className="home-container">
      {/* Hero Section with Scroll Effects */}
      <motion.section
        className="hero"
        style={{ opacity, y: yBg, scale, position: 'relative' }}
      >
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>Welcome to SkyNet</h1>
          <p>Your all-in-one assistant for layovers, luggage tracking, and live flights.</p>
          <motion.button
            className="hero-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>

        <motion.div
          className="hero-image"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <Map3D />
        </motion.div>
      </motion.section>

      {/* Tech / API Sources Section (reads from src/assets/homelogo) */}
      <Section className="tech-section" slide="up">
        <h2>Powered by industry-leading APIs</h2>
        <p className="tech-tagline">SkyNet combines best-in-class data sources to deliver real-time accuracy.</p>

        <motion.div className="tech-logos" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }}>
          {apiLogos.map((logo) => (
            <motion.div key={logo.name} className="tech-logo-item" variants={{ hidden:{opacity:0,y:20}, visible:{opacity:1,y:0}}}>
              <img src={logo.src} alt={logo.name} />
              <span>{logo.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Featured Airlines */}
      <Section className="airlines-section" slide="up">
        <h2>Featured Airlines</h2>
        <motion.div
          className="airlines-logos"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {airlineLogos.map((air) => (
            <motion.div
              key={air.name}
              className="airline-bubble"
              variants={{ hidden: { scale: 0, y: 20, opacity: 0 }, visible: { scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 10 } } }}
              whileHover={{ scale: 1.15, rotate: 2 }}
            >
              <img src={air.src} alt={air.name} title={air.name} />
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* Content Below Hero */}
      <div className="content-below">
        {[
          {
            id: "flight",
            title: "Real-time Flight Tracking",
            desc:
              "Track aircraft live in 3D and click on any plane for callsign & altitude.",
            img: "/vite.svg", // placeholder asset
            reverse: false,
          },
          {
            id: "layover",
            title: "Layover Assistant",
            desc:
              "Estimate your chances of making tight connections — factoring seat row, terminal transfer time, and historical performance.",

            reverse: true,
            action: () => setCurrentPage?.('layover'),
          },
        ].map((sec, idx) => (
          <Section
            key={sec.id}
            className={`info-section ${sec.reverse ? "reverse" : ""}`}
            slide={sec.reverse ? "right" : "left"}
          >
            <div className="info-text">
              <h2>{sec.title}</h2>
              <p>{sec.desc}</p>
              {sec.id==='layover' && (
                <button className="btn-primary" onClick={sec.action}>Try Layover Assistant →</button>
              )}
            </div>
            {sec.img && (
            <div className="info-img">
              <motion.img whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 200 }} src={sec.img} alt={sec.title} />
            </div>
            )}
          </Section>
        ))}

        {/* Call to Action */}
        <Section className="cta-section">
          <div className="cta-content">
            <h2>Ready to explore live flights?</h2>
            <p>Jump straight into the 3-D globe and track aircraft in real time.</p>
            <motion.button
              className="cta-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('flight')?.scrollIntoView({behavior:'smooth'})}
            >
              Try Now →
            </motion.button>
          </div>
        </Section>
      </div>
    </div>
    </div>
  );
}

export default Home;
