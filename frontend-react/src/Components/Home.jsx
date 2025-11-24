import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';

export default function Home() {
  const testimonials = [
    {
      text: "SmartAgriNode has revolutionized how I manage my farm. The crop recommendations are spot on!",
      author: "Periyaswamy, Wheat Farmer"
    },
    {
      text: "The weed detection feature saved me hours of manual labor. Highly recommended!",
      author: "Annamma shetty, Organic Farmer"
    },
    {
      text: "I love the data-driven insights. It helps me plan my season with confidence.",
      author: "Narayana Murthy, Corn Grower"
    },
    {
      text: "Sustainable farming is easier with SmartAgriNode. My yield has increased by 20%.",
      author: "Sarala Murthy, Vineyard Owner"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const getCardStyle = (index) => {
    if (index === currentIndex) return "center";
    if (index === (currentIndex + 1) % testimonials.length) return "right";
    if (index === (currentIndex - 1 + testimonials.length) % testimonials.length) return "left";
    return "hidden";
  };

  const variants = {
    center: {
      x: "0%",
      scale: 1,
      opacity: 1,
      zIndex: 5,
      filter: "blur(0px)",
      transition: { duration: 0.5 }
    },
    left: {
      x: "-60%",
      scale: 0.8,
      opacity: 0.6,
      zIndex: 3,
      filter: "blur(4px)",
      transition: { duration: 0.5 }
    },
    right: {
      x: "60%",
      scale: 0.8,
      opacity: 0.6,
      zIndex: 3,
      filter: "blur(4px)",
      transition: { duration: 0.5 }
    },
    hidden: {
      x: "0%",
      scale: 0.5,
      opacity: 0,
      zIndex: 1,
      filter: "blur(10px)",
      transition: { duration: 0.5 }
    }
  };

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

      <div className="info-section">
        <h2>Why Choose SmartAgriNode?</h2>
        <div className="info-grid">
          <div className="info-item">
            <h4>Data-Driven Decisions</h4>
            <p>Leverage the power of big data to make informed decisions about your crops.</p>
          </div>
          <div className="info-item">
            <h4>Sustainable Practices</h4>
            <p>Promote eco-friendly farming with precise resource management.</p>
          </div>
          <div className="info-item">
            <h4>Increased Yield</h4>
            <p>Optimize your harvest with tailored recommendations and early disease detection.</p>
          </div>
        </div>
      </div>

      <div className="testimonials-section">
        <h2>What Farmers Say</h2>
        <div className="testimonial-carousel">
          <div className="testimonial-content-wrapper">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={variants}
                initial="hidden"
                animate={getCardStyle(index)}
                className="testimonial-card"
              >
                <p>"{testimonial.text}"</p>
                <span>- {testimonial.author}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}