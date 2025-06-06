// src/components/Notification.js - VERSIÓN MEJORADA
import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import '../styles/NotificationStyles.css';

const Notification = ({ 
  type = 'info', 
  message, 
  title,
  onClose, 
  duration = 5000,
  autoClose = true,
  position = 'top-right',
  closable = true,
  actions = null,
  avatar = null,
  expandable = false,
  persistent = false
}) => {
  const toast = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(100);

  // Iconos según el tipo
  const getIcon = (notificationType) => {
    const icons = {
      success: 'pi pi-check-circle',
      error: 'pi pi-times-circle',
      warning: 'pi pi-exclamation-triangle',
      info: 'pi pi-info-circle'
    };
    return icons[notificationType] || icons.info;
  };

  // Títulos por defecto según el tipo
  const getDefaultTitle = (notificationType) => {
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información'
    };
    return titles[notificationType] || 'Notificación';
  };

  useEffect(() => {
    if (toast.current && message) {
      const toastMessage = {
        severity: type,
        summary: title || getDefaultTitle(type),
        detail: message,
        life: autoClose ? duration : 0,
        closable: closable,
        icon: getIcon(type)
      };

      // Agregar contenido personalizado si hay acciones o avatar
      if (actions || avatar || expandable) {
        toastMessage.content = (
          <div className={`notification-toast ${type} ${persistent ? 'persistent' : ''} ${expandable ? 'expandable' : ''} ${isExpanded ? 'expanded' : ''}`}>
            {/* Header */}
            <div className="notification-header">
              {avatar && (
                <img src={avatar} alt="Avatar" className="notification-avatar" />
              )}
              <div className="notification-icon">
                <i className={getIcon(type)}></i>
              </div>
              <h4 className="notification-title">{title || getDefaultTitle(type)}</h4>
              {closable && (
                <button 
                  className="notification-close"
                  onClick={() => {
                    toast.current.clear();
                    if (onClose) onClose();
                  }}
                  aria-label="Cerrar notificación"
                >
                  <i className="pi pi-times"></i>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="notification-content">
              <p>{message}</p>
            </div>

            {/* Expandir/Contraer */}
            {expandable && message.length > 100 && (
              <button 
                className="notification-expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}

            {/* Actions */}
            {actions && (
              <div className="notification-actions">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className={`notification-action ${action.primary ? 'primary' : ''}`}
                    onClick={() => {
                      if (action.onClick) action.onClick();
                      if (action.closeOnClick !== false) {
                        toast.current.clear();
                        if (onClose) onClose();
                      }
                    }}
                  >
                    {action.icon && <i className={action.icon}></i>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Progress bar para auto-close */}
            {autoClose && !persistent && (
              <div 
                className="notification-progress"
                style={{ width: `${progress}%` }}
              ></div>
            )}
          </div>
        );
      }

      toast.current.show(toastMessage);

      // Manejar la barra de progreso
      if (autoClose && !persistent) {
        const interval = setInterval(() => {
          setProgress(prev => {
            if (prev <= 0) {
              clearInterval(interval);
              return 0;
            }
            return prev - (100 / (duration / 100));
          });
        }, 100);

        return () => clearInterval(interval);
      }
    }
  }, [type, message, title, onClose, duration, autoClose, closable, actions, avatar, expandable, persistent, isExpanded, progress]);

  // Configurar posición del toast
  const getToastPosition = () => {
    const positions = {
      'top-left': 'top-left',
      'top-center': 'top-center',
      'top-right': 'top-right',
      'bottom-left': 'bottom-left',
      'bottom-center': 'bottom-center',
      'bottom-right': 'bottom-right'
    };
    return positions[position] || 'top-right';
  };

  return (
    <Toast 
      ref={toast} 
      position={getToastPosition()}
      className={`notification-container ${position}`}
    />
  );
};

// Hook personalizado para usar notificaciones
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = (options) => {
    setNotification({
      ...options,
      key: Date.now() // Para forzar re-render
    });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const showSuccess = (message, options = {}) => {
    showNotification({
      type: 'success',
      message,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    showNotification({
      type: 'error',
      message,
      duration: 8000, // Errores se muestran más tiempo
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    showNotification({
      type: 'warning',
      message,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    showNotification({
      type: 'info',
      message,
      ...options
    });
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationComponent: notification ? (
      <Notification 
        key={notification.key}
        {...notification} 
        onClose={hideNotification} 
      />
    ) : null
  };
};

export default Notification;