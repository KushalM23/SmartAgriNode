import React from 'react';
import './Footer.css';
import sanLogo from '../assets/SAN.png';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-column links">
          <span onClick={() => navigate('/#')}>HOME &rarr;</span>
          <span onClick={() => navigate('/dashboard#')}>DASHBOARD &rarr;</span>
          <span onClick={() => navigate('/crop-recommendation#')}>CROP RECOMMENDATION &rarr;</span>
          <span onClick={() => navigate('/weed-detection#')}>WEED DETECTION &rarr;</span>
        </div>

        <div className="footer-column copyright">
          <a href="http://www.linkedin.com/in/kushalm2301" target='blank'>LINKEDIN &rarr;</a>
          <a href="https://github.com/KushalM23" target='blank'>GITHUB &rarr;</a>
          <a href="https://www.instagram.com/kushalll.5/" target="blank">INSTAGRAM &rarr;</a>
          <a href="mailto:kusham2301@gmail.com" target="blank">CONTACT US &rarr;</a>
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
