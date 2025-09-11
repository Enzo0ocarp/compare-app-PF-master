// src/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ 
  message = 'Cargando...', 
  size = 'medium',
  fullScreen = true 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium', 
    large: 'spinner-large'
  };

  const containerClass = fullScreen ? 'loading-container-fullscreen' : 'loading-container';

  return (
    <div className={containerClass}>
      <div className="loading-content">
        <div className={`loading-spinner ${sizeClasses[size]}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>

      <style jsx>{`
        .loading-container-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 200px;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-spinner {
          display: inline-block;
          position: relative;
          margin-bottom: 1rem;
        }

        .spinner-small {
          width: 40px;
          height: 40px;
        }

        .spinner-medium {
          width: 60px;
          height: 60px;
        }

        .spinner-large {
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top: 3px solid currentColor;
          border-radius: 50%;
          animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        .spinner-ring:nth-child(1) { animation-delay: -0.45s; }
        .spinner-ring:nth-child(2) { animation-delay: -0.3s; }
        .spinner-ring:nth-child(3) { animation-delay: -0.15s; }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-message {
          font-size: 1.125rem;
          font-weight: 500;
          margin: 0;
          opacity: 0.9;
        }

        .loading-container .loading-content {
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;