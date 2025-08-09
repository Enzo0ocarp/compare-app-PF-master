/**
 * @fileoverview Página de perfil de usuario de Compare Precios Argentina
 * @description Componente Perfil que permite a los usuarios ver y editar su información personal,
 * gestionar configuraciones de cuenta y realizar operaciones relacionadas con el perfil.
 * @author Compare Team
 * @version 1.0.0
 * @since 2025
 */

// src/pages/Perfil.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../functions/src/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';
import BottomNav from '../components/BottomNav';
import EditProfile from '../components/EditProfile';
import Notification from '../components/Notification';
import '../styles/Perfil.css';

/**
 * @typedef {Object} UserInfo
 * @property {string} name - Nombre completo del usuario
 * @property {string} email - Dirección de correo electrónico del usuario
 * @property {string} membership - Información sobre la membresía del usuario
 * @property {string} photoURL - URL de la foto de perfil del usuario
 * @property {string} [phone] - Número de teléfono opcional
 * @property {string} [address] - Dirección física opcional
 * @property {string} [preferences] - Preferencias del usuario
 * @property {Date} [lastLogin] - Fecha del último inicio de sesión
 * @property {boolean} [emailVerified] - Estado de verificación del email
 */

/**
 * @typedef {Object} NotificationState
 * @property {string} message - Mensaje de la notificación
 * @property {('success'|'error'|'warning'|'info')} type - Tipo de notificación
 * @property {number} [duration] - Duración en milisegundos para auto-cierre
 * @property {boolean} [autoClose] - Si la notificación se cierra automáticamente
 */

/**
 * @component Perfil
 * @description Página de perfil de usuario que incluye:
 * - Visualización de información personal del usuario
 * - Funcionalidad para editar el perfil
 * - Integración con Firebase Authentication y Firestore
 * - Sistema de notificaciones para feedback al usuario
 * - Opciones de gestión de cuenta y cierre de sesión
 * 
 * @returns {JSX.Element} Componente de la página de perfil
 * 
 * @example
 * <Perfil />
 */
function Perfil() {
  /** @type {[UserInfo|null, Function]} Información del usuario actual */
  const [userInfo, setUserInfo] = useState(null);
  
  /** @type {[boolean, Function]} Estado de carga de los datos del usuario */
  const [loading, setLoading] = useState(true);
  
  /** @type {[boolean, Function]} Estado de visibilidad del formulario de edición */
  const [showEditForm, setShowEditForm] = useState(false);
  
  /** @type {[NotificationState|null, Function]} Estado de la notificación actual */
  const [notification, setNotification] = useState(null);

  /**
   * @description Efecto para manejar la autenticación y cargar datos del usuario
   * Escucha los cambios en el estado de autenticación de Firebase y carga
   * la información adicional del usuario desde Firestore
   * @function
   * @since 1.0.0
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Datos básicos de Firebase Auth
        let userData = {
          name: user.displayName || 'Usuario sin nombre',
          email: user.email,
          membership: `Miembro desde ${new Date(user.metadata.creationTime).getFullYear()}`,
          photoURL: user.photoURL || '/default-profile.png',
        };
        
        try {
          // Consultar información extra en Firestore
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const extraData = docSnap.data();
            userData = { ...userData, ...extraData };
          }
        } catch (error) {
          console.error('Error al cargar datos adicionales del usuario:', error);
          setNotification({
            message: 'Error al cargar algunos datos del perfil',
            type: 'warning',
            duration: 3000
          });
        }
        
        setUserInfo(userData);
      } else {
        setUserInfo(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * @description Maneja el cierre de sesión del usuario
   * @async
   * @function
   * @since 1.0.0
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando el usuario cierra sesión
   * 
   * @throws {Error} Error al cerrar sesión
   * 
   * @example
   * await handleLogout(); // Cierra la sesión del usuario actual
   */
  const handleLogout = async () => {
    try {
      // Aquí iría la lógica de cierre de sesión
      // await auth.signOut();
      setNotification({
        message: 'Sesión cerrada exitosamente',
        type: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setNotification({
        message: 'Error al cerrar sesión. Intenta nuevamente.',
        type: 'error',
        duration: 3000
      });
    }
  };

  /**
   * @description Abre el formulario de edición de perfil
   * @function
   * @since 1.0.0
   * 
   * @example
   * handleEditProfile(); // Muestra el modal de edición
   */
  const handleEditProfile = () => setShowEditForm(true);
  
  /**
   * @description Cierra el formulario de edición de perfil
   * @function
   * @since 1.0.0
   * 
   * @example
   * handleCloseEditForm(); // Oculta el modal de edición
   */
  const handleCloseEditForm = () => setShowEditForm(false);

  /**
   * @description Maneja la actualización exitosa del perfil
   * @function
   * @since 1.0.0
   * 
   * @param {UserInfo} updatedUserData - Datos actualizados del usuario
   * 
   * @example
   * handleProfileUpdate({ name: 'Nuevo Nombre', phone: '123456789' });
   */
  const handleProfileUpdate = (updatedUserData) => {
    setUserInfo(prevInfo => ({ ...prevInfo, ...updatedUserData }));
    setShowEditForm(false);
    setNotification({
      message: 'Perfil actualizado correctamente',
      type: 'success',
      duration: 3000
    });
  };

  /**
   * @description Maneja errores durante la actualización del perfil
   * @function
   * @since 1.0.0
   * 
   * @param {string} errorMessage - Mensaje de error a mostrar
   * 
   * @example
   * handleProfileError('No se pudo actualizar el perfil');
   */
  const handleProfileError = (errorMessage) => {
    setNotification({
      message: errorMessage || 'Error al actualizar el perfil',
      type: 'error',
      duration: 4000
    });
  };

  /**
   * @description Cierra la notificación actual
   * @function
   * @since 1.0.0
   * 
   * @example
   * handleCloseNotification(); // Oculta la notificación actual
   */
  const handleCloseNotification = () => setNotification(null);

  // Mostrar indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="perfil-page loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
            <p>Cargando perfil...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Mostrar mensaje si no hay usuario autenticado
  if (!userInfo) {
    return (
      <div className="perfil-page">
        <div className="no-user-container">
          <div className="no-user-content">
            <i className="pi pi-user" style={{ fontSize: '4rem', color: '#ccc' }}></i>
            <h2>No hay usuario autenticado</h2>
            <p>Inicia sesión para ver tu perfil</p>
            <button 
              className="login-btn"
              onClick={() => window.location.href = '/login'}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="perfil-page">
 
      <div className="perfil-container">
        <section className="section profile-section fade-in">
          <div className="profile-header">
            <h2>
              <i className="pi pi-user"></i>
              Perfil de Usuario
            </h2>
            <p>Gestiona tu información personal y configuraciones de cuenta</p>
          </div>
          
          <ProfileCard 
            user={userInfo} 
            onEditProfile={handleEditProfile} 
            onLogout={handleLogout} 
          />
          
          {showEditForm && (
            <EditProfile 
              user={userInfo} 
              onClose={handleCloseEditForm}
              onUpdate={handleProfileUpdate}
              onError={handleProfileError}
            />
          )}
        </section>
        
        {/* Sección adicional de estadísticas del usuario */}
        <section className="user-stats-section">
          <div className="stats-header">
            <h3>
              <i className="pi pi-chart-bar"></i>
              Tu Actividad en Compare
            </h3>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="pi pi-search"></i>
              </div>
              <div className="stat-content">
                <h4>Búsquedas Realizadas</h4>
                <span className="stat-number">124</span>
                <small>Este mes</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="pi pi-heart"></i>
              </div>
              <div className="stat-content">
                <h4>Productos Favoritos</h4>
                <span className="stat-number">18</span>
                <small>En tu lista</small>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="pi pi-dollar"></i>
              </div>
              <div className="stat-content">
                <h4>Ahorro Estimado</h4>
                <span className="stat-number">$2,450</span>
                <small>Este mes</small>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sección de configuraciones rápidas */}
        <section className="quick-settings-section">
          <div className="settings-header">
            <h3>
              <i className="pi pi-cog"></i>
              Configuración Rápida
            </h3>
          </div>
          
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Notificaciones por Email</h4>
                <p>Recibe alertas de ofertas y actualizaciones</p>
              </div>
              <div className="setting-control">
                <input type="checkbox" defaultChecked className="setting-toggle" />
              </div>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Ubicación Automática</h4>
                <p>Detectar tu ubicación para ofertas cercanas</p>
              </div>
              <div className="setting-control">
                <input type="checkbox" className="setting-toggle" />
              </div>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <h4>Alertas de Precios</h4>
                <p>Notificaciones cuando bajen los precios</p>
              </div>
              <div className="setting-control">
                <input type="checkbox" defaultChecked className="setting-toggle" />
              </div>
            </div>
          </div>
        </section>
      </div>
      
      
      {notification && (
        <Notification 
          {...notification} 
          onClose={handleCloseNotification} 
        />
      )}
    </div>
  );
}

export default Perfil;