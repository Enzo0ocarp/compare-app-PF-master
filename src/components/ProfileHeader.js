// src/components/ProfileHeader.js - COMPLETO Y COMPATIBLE CON FIREBASE ACTUAL
import React, { useRef } from 'react';

const ProfileHeader = ({ user, onLogout, isAdmin, onPhotoUpload, uploadingPhoto }) => {
  const fileInputRef = useRef(null);

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const formatMemberSince = (date) => {
    if (!date) return 'Reciente';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long'
    }).format(new Date(date));
  };

  const handlePhotoClick = () => {
    if (uploadingPhoto) return; // Evitar clicks durante upload
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && onPhotoUpload) {
      onPhotoUpload(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    event.target.value = '';
  };

  return (
    <div className="profile-header">
      <div className="profile-banner">
        <div className="profile-main-info">
          {/* Avatar mejorado con funcionalidad de cambio */}
          <div className="profile-avatar">
            <div 
              className={`avatar-container ${uploadingPhoto ? 'uploading' : ''}`}
              onClick={handlePhotoClick}
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={`${user.firstName} ${user.lastName}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="avatar-placeholder"
                style={{ display: user.photoURL ? 'none' : 'flex' }}
              >
                {getInitials(user.firstName, user.lastName)}
              </div>
              
              {/* Overlay de cambio de foto */}
              <div className="photo-overlay">
                {uploadingPhoto ? (
                  <div className="upload-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-camera"></i>
                    <span>Cambiar foto</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="status-indicator online"></div>
            
            {/* Input oculto para seleccionar archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploadingPhoto}
            />
          </div>

          {/* Información principal */}
          <div className="profile-info">
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
              {isAdmin && (
                <span className="admin-badge">
                  <i className="fas fa-shield-alt"></i>
                  Admin
                </span>
              )}
            </h1>
            
            <p className="profile-email">
              <i className="fas fa-envelope"></i>
              {user.email}
            </p>
            
            <p className="profile-member-since">
              <i className="fas fa-calendar"></i>
              Miembro desde {formatMemberSince(user.memberSince)}
            </p>

            {user.bio && (
              <p className="profile-bio">
                <i className="fas fa-quote-left"></i>
                {user.bio}
              </p>
            )}

            {user.location && (
              <p className="profile-location">
                <i className="fas fa-map-marker-alt"></i>
                {user.location}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="profile-actions">
          <button className="action-btn edit-profile">
            <i className="fas fa-edit"></i>
            <span>Editar Perfil</span>
          </button>
          
          <button 
            className="action-btn logout-btn"
            onClick={onLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .profile-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .profile-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><circle cx="7" cy="7" r="7"/></g></svg>') repeat;
          opacity: 0.3;
        }

        .profile-banner {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .profile-main-info {
          display: flex;
          align-items: flex-start;
          gap: 2rem;
          flex: 1;
        }

        .profile-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-container {
          position: relative;
          width: 120px;
          height: 120px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 50%;
          overflow: hidden;
        }

        .avatar-container:not(.uploading):hover {
          transform: scale(1.05);
        }

        .avatar-container.uploading {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .avatar-container img,
        .avatar-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .avatar-placeholder {
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
          backdrop-filter: blur(10px);
        }

        .photo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          gap: 0.25rem;
        }

        .avatar-container:hover .photo-overlay {
          opacity: 1;
        }

        .avatar-container.uploading .photo-overlay {
          opacity: 1;
          background: rgba(0, 0, 0, 0.8);
        }

        .upload-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-spinner i {
          font-size: 1.5rem;
        }

        .status-indicator {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          z-index: 10;
        }

        .status-indicator.online {
          background: #10b981;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }

        .profile-info {
          flex: 1;
          min-width: 0;
        }

        .profile-name {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          line-height: 1.2;
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .profile-email,
        .profile-member-since,
        .profile-bio,
        .profile-location {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0.5rem 0;
          font-size: 1rem;
          opacity: 0.9;
          line-height: 1.4;
        }

        .profile-bio {
          font-style: italic;
          max-width: 500px;
          line-height: 1.6;
          align-items: flex-start;
        }

        .profile-bio i {
          margin-top: 0.2rem;
          flex-shrink: 0;
        }

        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          min-width: 160px;
          justify-content: center;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .action-btn i {
          font-size: 1rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-banner {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }

          .profile-main-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-name {
            font-size: 2rem;
            justify-content: center;
          }

          .profile-actions {
            flex-direction: row;
            width: 100%;
          }

          .action-btn {
            flex: 1;
          }

          .profile-bio {
            text-align: center;
            max-width: none;
          }
        }

        @media (max-width: 480px) {
          .profile-banner {
            padding: 1rem;
          }

          .avatar-container,
          .avatar-container img,
          .avatar-placeholder {
            width: 100px;
            height: 100px;
          }

          .profile-name {
            font-size: 1.75rem;
          }

          .action-btn span {
            display: none;
          }

          .action-btn {
            min-width: auto;
            padding: 0.75rem;
          }

          .profile-email,
          .profile-member-since,
          .profile-bio,
          .profile-location {
            font-size: 0.875rem;
          }
        }

        /* Accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          .avatar-container,
          .action-btn,
          .photo-overlay {
            transition: none;
          }

          .upload-spinner i {
            animation: none;
          }
        }

        /* Mejoras para pantallas táctiles */
        @media (hover: none) {
          .photo-overlay {
            opacity: 0.8;
          }
          
          .avatar-container:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileHeader;