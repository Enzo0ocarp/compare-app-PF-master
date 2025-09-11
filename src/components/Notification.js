// src/components/Notification.js - Sistema de notificaciones corregido
import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexto de notificaciones
const NotificationContext = createContext();

// Provider de notificaciones
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove después del duration especificado
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      showNotification,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook para usar notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider');
  }
  return context;
};

// Componente contenedor de notificaciones
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
      
      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .notification-container {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

// Componente individual de notificación
const NotificationItem = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(onClose, 300); // Esperar a que termine la animación
  };

  const getNotificationConfig = (type) => {
    const configs = {
      success: {
        icon: 'fas fa-check-circle',
        className: 'notification-success',
        iconColor: '#10b981'
      },
      error: {
        icon: 'fas fa-times-circle',
        className: 'notification-error',
        iconColor: '#ef4444'
      },
      warning: {
        icon: 'fas fa-exclamation-triangle',
        className: 'notification-warning',
        iconColor: '#f59e0b'
      },
      info: {
        icon: 'fas fa-info-circle',
        className: 'notification-info',
        iconColor: '#3b82f6'
      }
    };

    return configs[type] || configs.info;
  };

  const config = getNotificationConfig(notification.type);

  return (
    <div 
      className={`notification-item ${config.className} ${isVisible ? 'visible' : ''} ${isRemoving ? 'removing' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-content">
        <div className="notification-icon" style={{ color: config.iconColor }}>
          <i className={config.icon}></i>
        </div>
        
        <div className="notification-message">
          {notification.message}
        </div>
        
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <style jsx>{`
        .notification-item {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          transform: translateX(100%);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .notification-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: currentColor;
        }

        .notification-item.visible {
          transform: translateX(0);
          opacity: 1;
        }

        .notification-item.removing {
          transform: translateX(100%);
          opacity: 0;
        }

        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .notification-icon {
          flex-shrink: 0;
          margin-top: 2px;
          font-size: 18px;
        }

        .notification-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          color: #374151;
        }

        .notification-close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          margin-top: 2px;
          font-size: 14px;
        }

        .notification-close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #374151;
        }

        .notification-success {
          border-left: 4px solid #10b981;
        }

        .notification-error {
          border-left: 4px solid #ef4444;
        }

        .notification-warning {
          border-left: 4px solid #f59e0b;
        }

        .notification-info {
          border-left: 4px solid #3b82f6;
        }

        @media (max-width: 768px) {
          .notification-item {
            padding: 12px;
          }

          .notification-content {
            gap: 8px;
          }

          .notification-message {
            font-size: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .notification-item {
            transition: opacity 0.2s ease;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationProvider;