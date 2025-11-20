import React from 'react';
import './Home.css';

export default function Home() {
  return (
    <div className="page-container home-container">
      <div className="hero-section">
        <h1>Welcome to SmartAgriNode</h1>
        <p className="hero-text">
          Your intelligent farming companion for better crop management and sustainable agriculture
        </p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <h3>Smart Dashboard</h3>
          <p>Monitor your farm's vital statistics and get real-time insights</p>
        </div>
        
        <div className="feature-card">
          <h3>AI-Powered Recommendations</h3>
          <p>Get personalized crop recommendations based on your soil and climate conditions</p>
        </div>
        
        <div className="feature-card">
          <h3>Weed Detection</h3>
          <p>Advanced image processing to identify and manage unwanted plant growth</p>
        </div>
      </div>
    </div>
  );
}