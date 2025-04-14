import React from 'react';
import '../styles/ErrorMessage.css';

const ErrorMessage = ({ message, onRetry, fullPage = false }) => {
  return (
    <div className={`error-container ${fullPage ? 'full-page' : ''}`}>
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;