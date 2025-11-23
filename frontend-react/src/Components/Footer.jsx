import React from 'react';
import './Footer.css';
import sanLogo from '../assets/SAN.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-column links">
          <a href="/">HOME &rarr;</a>
          <a href="/dashboard">DASHBOARD &rarr;</a>
          <a href="/croprecommendation">CROP RECOMMENDTION &rarr;</a>
          <a href="/weeddetection">WEED DETECTION &rarr;</a>
        </div>

        <div className="footer-column copyright">
          <a href="http://www.linkedin.com/in/kushalm2301" target='blank'>LINKEDIN &rarr;</a>
          <a href="https://github.com/KushalM23" target='blank'>GITHUB &rarr;</a>
          <a href="https://www.instagram.com/kushalll.5/ target='blank'">INSTAGRAM &rarr;</a>
          <a href="mailto:kusham2301@gmail.com" target='blank'>CONTACT US &rarr;</a>
        </div>

        <div className="footer-column legal">
          <a href="#">TERMS & CONDITIONS &rarr;</a>
          <a href="#">PRIVACY POLICY &rarr;</a>
        </div>
      </div>

      <div className="footer-brand">
        <img src={sanLogo} alt="SAN" />
        <p>&copy; 2025 SMARTAGRINODE INC.</p>
      </div>
    </footer>
  );
}
