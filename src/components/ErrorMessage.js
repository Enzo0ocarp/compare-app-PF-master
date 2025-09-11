// src/components/ErrorMessage.js
import React from 'react';

const ErrorMessage = ({ 
  title = 'Ha ocurrido un error',
  message = 'Por favor, intenta nuevamente',
  actionText = 'Reintentar',
  onAction,
  type = 'error'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      case 'success':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-exclamation-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      case 'success':
        return '#10b981';
      default:
        return '#ef4444';
    }
  };

  return (
    <div className="error-container">
      <div className="error-content">
        <div 
          className="error-icon"
          style={{ color: getColor() }}
        >
          <i className={getIcon()}></i>
        </div>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        {onAction && (
          <button 
            className="error-action-btn"
            onClick={onAction}
            style={{ backgroundColor: getColor() }}
          >
            <i className="fas fa-redo"></i>
            {actionText}
          </button>
        )}
      </div>

      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem;
          background: #f9fafb;
        }

        .error-content {
          text-align: center;
          background: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 1rem;
        }

        .error-message {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .error-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .error-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 480px) {
          .error-content {
            padding: 2rem 1.5rem;
          }

          .error-icon {
            font-size: 3rem;
          }

          .error-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorMessage;