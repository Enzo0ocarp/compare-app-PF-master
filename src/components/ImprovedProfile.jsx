import React, { useState, useEffect } from 'react';
import { 
  User, Edit2, Save, X, Mail, Calendar, MapPin, 
  Star, Award, TrendingUp, Settings, Camera, 
  Shield, Bell, Globe, Smartphone, LogOut,
  ChevronRight, Activity, Heart, BookOpen
} from 'lucide-react';

// Componente de Avatar mejorado
const UserAvatar = ({ photoURL, name, size = 'large', onPhotoChange, editable = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20', 
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Simular upload de imagen
      const formData = new FormData();
      formData.append('photo', file);
      
      // Aquí iría la lógica real de upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPhotoURL = URL.createObjectURL(file);
      onPhotoChange?.(newPhotoURL);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="user-avatar-container">
      <div className={`user-avatar ${sizeClasses[size]} ${isUploading ? 'uploading' : ''}`}>
        <img
          src={photoURL || '/default-profile.png'}
          alt={`Foto de perfil de ${name}`}
          className="avatar-image"
        />
        
        {editable && (
          <label className="avatar-edit-btn">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Camera className="w-4 h-4" />
          </label>
        )}
        
        {isUploading && (
          <div className="avatar-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .user-avatar-container {
          position: relative;
          display: inline-block;
        }

        .user-avatar {
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #667eea;
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }

        .user-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #667eea;
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .avatar-edit-btn:hover {
          background: #5a67d8;
          transform: scale(1.1);
        }

        .hidden {
          display: none;
        }

        .avatar-loading {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .loading-spinner {
          width: 2rem;
          height: 2rem;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Componente de información del usuario
const UserInfoCard = ({ user, onEdit, isEditing, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    birthDate: user.birthDate || '',
    bio: user.bio || '',
    location: user.location || '',
    phone: user.phone || ''
  });

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="user-info-card">
      <div className="card-header">
        <h3>Información Personal</h3>
        {!isEditing ? (
          <button className="edit-btn" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        ) : (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button className="cancel-btn" onClick={onCancel}>
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="card-content">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Tu apellido"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="tu@email.com"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de nacimiento</label>
                <input
                  type="date"
                  value={editData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Ubicación</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ciudad, País"
              />
            </div>
            
            <div className="form-group">
              <label>Biografía</label>
              <textarea
                value={editData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Cuéntanos algo sobre ti..."
                rows="3"
              />
            </div>
          </div>
        ) : (
          <div className="info-display">
            <div className="info-item">
              <User className="w-5 h-5" />
              <div>
                <span className="label">Nombre completo</span>
                <span className="value">{user.firstName} {user.lastName}</span>
              </div>
            </div>
            
            <div className="info-item">
              <Mail className="w-5 h-5" />
              <div>
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
            </div>
            
            {user.birthDate && (
              <div className="info-item">
                <Calendar className="w-5 h-5" />
                <div>
                  <span className="label">Fecha de nacimiento</span>
                  <span className="value">{new Date(user.birthDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            
            {user.phone && (
              <div className="info-item">
                <Smartphone className="w-5 h-5" />
                <div>
                  <span className="label">Teléfono</span>
                  <span className="value">{user.phone}</span>
                </div>
              </div>
            )}
            
            {user.location && (
              <div className="info-item">
                <MapPin className="w-5 h-5" />
                <div>
                  <span className="label">Ubicación</span>
                  <span className="value">{user.location}</span>
                </div>
              </div>
            )}
            
            {user.bio && (
              <div className="info-item bio">
                <BookOpen className="w-5 h-5" />
                <div>
                  <span className="label">Biografía</span>
                  <span className="value bio-text">{user.bio}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .user-info-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(135deg, #f8faff, #e8f5e8);
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }

        .edit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-btn:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-btn,
        .cancel-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn {
          background: #10b981;
          color: white;
        }

        .save-btn:hover {
          background: #059669;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #6b7280;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .card-content {
          padding: 1.5rem;
        }

        .info-display {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8faff;
          border-radius: 12px;
          border: 1px solid #e0e7ff;
          transition: all 0.2s ease;
        }

        .info-item:hover {
          background: #f0f7ff;
          border-color: #c7d2fe;
        }

        .info-item svg {
          color: #667eea;
          margin-top: 0.25rem;
          flex-shrink: 0;
        }

        .info-item div {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
        }

        .bio-text {
          line-height: 1.6;
          color: #4b5563;
        }

        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.975rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .card-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .edit-actions {
            justify-content: stretch;
          }

          .save-btn,
          .cancel-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

// Componente de estadísticas del usuario
const UserStatsCard = ({ stats }) => {
  const defaultStats = {
    searchesThisMonth: 124,
    favoriteProducts: 18,
    estimatedSavings: 2450,
    contributionsApproved: 5,
    reviewsWritten: 12,
    memberSince: '2024-08-15'
  };

  const userStats = { ...defaultStats, ...stats };

  return (
    <div className="user-stats-card">
      <div className="stats-header">
        <h3>
          <Activity className="w-5 h-5" />
          Tu Actividad en Compare & Nourish
        </h3>
        <p>Resumen de tu participación en la plataforma</p>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon search">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-number">{userStats.searchesThisMonth}</span>
            <span className="stat-label">Búsquedas este mes</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon favorite">
            <Heart className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-number">{userStats.favoriteProducts}</span>
            <span className="stat-label">Productos favoritos</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon savings">
            <Award className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-number">${userStats.estimatedSavings.toLocaleString()}</span>
            <span className="stat-label">Ahorro estimado</span>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon contributions">
            <Star className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-number">{userStats.contributionsApproved}</span>
            <span className="stat-label">Contribuciones aprobadas</span>
          </div>
        </div>
      </div>

      <div className="member-since">
        <Calendar className="w-4 h-4" />
        <span>Miembro desde {new Date(userStats.memberSince).toLocaleDateString('es-AR', { 
          year: 'numeric', 
          month: 'long' 
        })}</span>
      </div>

      <style jsx>{`
        .user-stats-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
        }

        .stats-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
        }

        .stats-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
        }

        .stats-header p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: #f8faff;
          border-radius: 12px;
          border: 1px solid #e0e7ff;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
          background: #f0f7ff;
        }

        .stat-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.search {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .stat-icon.favorite {
          background: linear-gradient(135deg, #f093fb, #f5576c);
        }

        .stat-icon.savings {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
        }

        .stat-icon.contributions {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 800;
          color: #374151;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .member-since {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
          font-size: 0.875rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Componente principal del perfil mejorado
const ImprovedProfile = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedData) => {
    try {
      await onUpdateUser(updatedData);
      setIsEditing(false);
      setNotification({
        type: 'success',
        message: 'Perfil actualizado correctamente'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error al actualizar el perfil'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handlePhotoChange = async (newPhotoURL) => {
    try {
      await onUpdateUser({ photoURL: newPhotoURL });
      setNotification({
        type: 'success',
        message: 'Foto de perfil actualizada'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error al actualizar la foto'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="improved-profile">
      {/* Header del perfil */}
      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-main">
            <UserAvatar 
              photoURL={user.photoURL}
              name={user.firstName || user.name}
              size="xlarge"
              editable={true}
              onPhotoChange={handlePhotoChange}
            />
            <div className="profile-title">
              <h1>{user.firstName} {user.lastName}</h1>
              <p className="user-role">
                {user.role === 'admin' ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Administrador
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    Usuario
                  </>
                )}
              </p>
            </div>
          </div>
          
          <button className="logout-btn" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido del perfil */}
      <div className="profile-content">
        <div className="profile-grid">
          <div className="profile-column main">
            <UserInfoCard 
              user={user}
              onEdit={handleEdit}
              isEditing={isEditing}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
          
          <div className="profile-column sidebar">
            <UserStatsCard />
          </div>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .improved-profile {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }

        .profile-header {
          padding: 2rem 1rem 1rem;
          position: relative;
        }

        .profile-banner {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .profile-main {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .profile-title h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .user-role {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0 0 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          font-weight: 500;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .profile-content {
          padding: 0 1rem 2rem;
          position: relative;
          z-index: 2;
        }

        .profile-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-top: -1rem;
        }

        .profile-column {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 1000;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(20px);
          animation: slideIn 0.3s ease-out;
        }

        .notification.success {
          background: rgba(16, 185, 129, 0.9);
          color: white;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .notification.error {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 1024px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .profile-banner {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
          }

          .profile-main {
            flex-direction: column;
            text-align: center;
          }

          .profile-title h1 {
            font-size: 2rem;
          }

          .notification {
            top: 1rem;
            right: 1rem;
            left: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ImprovedProfile;