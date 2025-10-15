// src/components/Notification.js - Sistema de Notificaciones Completo
import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification debe usarse dentro de NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const toastRef = useRef(null);

    const showNotification = (message, type = 'info', options = {}) => {
        const {
            life = 3000,
            sticky = false,
            closable = true,
            summary
        } = options;

        const severityConfig = {
            success: {
                severity: 'success',
                summary: summary || '¡Éxito!',
                icon: 'pi pi-check-circle'
            },
            error: {
                severity: 'error',
                summary: summary || 'Error',
                icon: 'pi pi-times-circle'
            },
            warn: {
                severity: 'warn',
                summary: summary || 'Advertencia',
                icon: 'pi pi-exclamation-triangle'
            },
            info: {
                severity: 'info',
                summary: summary || 'Información',
                icon: 'pi pi-info-circle'
            }
        };

        const config = severityConfig[type] || severityConfig.info;

        toastRef.current?.show({
            ...config,
            detail: message,
            life: sticky ? null : life,
            closable
        });
    };

    const contextValue = {
        showNotification,
        showSuccess: (message, options) => showNotification(message, 'success', options),
        showError: (message, options) => showNotification(message, 'error', options),
        showWarn: (message, options) => showNotification(message, 'warn', options),
        showInfo: (message, options) => showNotification(message, 'info', options)
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            <Toast ref={toastRef} position="top-right" />
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;