import React from 'react';
import './HeroBanner.css';
import { backgroundGradient, colors } from './styles.js';

const HeroBanner = () => {
  return (
    <div
      className="hero-banner"
      style={{
        background: backgroundGradient,
        color: colors.white
      }}
    >
      <div className="container">
        <div className="hero-content">
          <h1>¿Qué te gustaría aprender?</h1>
          <div className="search-container">
            {/* Aquí iría el componente SearchBar */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;