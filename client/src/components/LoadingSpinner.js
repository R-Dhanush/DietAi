import React from 'react';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ fullPage = false, message = 'Loading...' }) => {
  return (
    <div className={`loading-container ${fullPage ? 'full-page' : ''}`}>
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;