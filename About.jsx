import React from 'react';

function About() {
  return (
    <section className="page-section">
      <div className="section-card">
        <h1>About this Project</h1>
        <p>
          SkyNet is a personal  project by <strong>Oregon State University</strong> computer science student Rafael A Castro. It brings live flight data together with a layover-success estimator so travelers can gauge whether their tight connections are realistic.
        </p>
        <h3>Why?</h3>
        <p>Missed connections are stressful and expensive. Airlines publish minimum connection times, but real-world odds depend on seat row, terminal transfer time, and airline punctuality. SkyNet visualizes those factors in one click.</p>
        <h3>How to Use</h3>
        <ul style={{ listStyle: 'disc', marginLeft: '1.5rem' }}>
          <li>On the home page, hit “Layover Assistant”.</li>
          <li>Enter your two airports, layover minutes, seat row, and whether the flights use the same terminal.</li>
          <li>The estimator returns a probability plus the inputs it assumed.</li>
          <li>Switch to “Flight Tracking” to see live aircraft positions via OpenSky.</li>
        </ul>
        <h3>Tech Stack</h3>
        <p>React&nbsp;+&nbsp;Vite front-end · Express proxy · FastAPI micro-service · OpenSky Network API · Cesium 3D globe.</p>
        <p style={{ marginTop: '1rem' }}>Source code on <a href="https://github.com/slacke101/Skynet" target="_blank" rel="noreferrer" className="back-link">GitHub: slacke101</a></p>
        <p>Rafael A Castro | Oregon State University</p>
      </div>
    </section>
  );
}

export default About;
