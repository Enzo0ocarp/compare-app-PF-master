// src/components/UserInfoSection.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const UserInfoSection = ({ user, isEditing, onEdit, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      birthDate: user.birthDate || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || ''
    }
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await onSave(data);
      reset(data);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="user-info-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-user-edit"></i>
          Mi Información Personal
        </h2>
        <p>Administra tu información personal y preferencias de cuenta</p>
      </div>

      <div className="info-card">
        {!isEditing ? (
          // Vista de solo lectura
          <div className="info-display">
            <div className="card-header">
              <h3>Información Personal</h3>
              <button 
                className="edit-btn"
                onClick={onEdit}
              >
                <i className="fas fa-edit"></i>
                Editar
              </button>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="info-content">
                  <label>Nombre completo</label>
                  <span>{user.firstName} {user.lastName}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="info-content">
                  <label>Correo electrónico</label>
                  <span>{user.email}</span>
                </div>
              </div>

              {user.birthDate && (
                <div className="info-item">
                  <div className="info-icon">
                    <i className="fas fa-birthday-cake"></i>
                  </div>
                  <div className="info-content">
                    <label>Fecha de nacimiento</label>
                    <span>
                      {new Date(user.birthDate).toLocaleDateString('es-ES')}
                      {calculateAge(user.birthDate) && (
                        <small> ({calculateAge(user.birthDate)} años)</small>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {user.phone && (
                <div className="info-item">
                  <div className="info-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="info-content">
                    <label>Teléfono</label>
                    <span>{user.phone}</span>
                  </div>
                </div>
              )}

              {user.location && (
                <div className="info-item">
                  <div className="info-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="info-content">
                    <label>Ubicación</label>
                    <span>{user.location}</span>
                  </div>
                </div>
              )}

              {user.bio && (
                <div className="info-item full-width">
                  <div className="info-icon">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <div className="info-content">
                    <label>Biografía</label>
                    <span className="bio-text">{user.bio}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Vista de edición
          <form onSubmit={handleSubmit(onSubmit)} className="edit-form">
            <div className="card-header">
              <h3>Editar Información</h3>
              <div className="form-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <i className="fas fa-times"></i>
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  <i className="fas fa-save"></i>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i>
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  {...register('firstName', {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-user"></i>
                  Apellido
                </label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  {...register('lastName', {
                    required: 'El apellido es obligatorio',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName.message}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  <i className="fas fa-envelope"></i>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                      message: 'Email no válido'
                    }
                  })}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-birthday-cake"></i>
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  {...register('birthDate')}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="fas fa-phone"></i>
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  {...register('phone', {
                    pattern: {
                      value: /^[+]?[(]?[\d\s\-()]{10,}$/,
                      message: 'Formato de teléfono no válido'
                    }
                  })}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone.message}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  <i className="fas fa-map-marker-alt"></i>
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ciudad, País"
                  {...register('location')}
                />
              </div>

              <div className="form-group full-width">
                <label>
                  <i className="fas fa-quote-left"></i>
                  Biografía
                </label>
                <textarea
                  placeholder="Cuéntanos algo sobre ti (máx. 160 caracteres)"
                  rows="3"
                  {...register('bio', {
                    maxLength: { value: 160, message: 'Máximo 160 caracteres' }
                  })}
                  className={errors.bio ? 'error' : ''}
                />
                {errors.bio && (
                  <span className="error-message">{errors.bio.message}</span>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .user-info-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .section-header h2 i {
          color: #667eea;
        }

        .section-header p {
          color: #6b7280;
          font-size: 1.125rem;
          margin: 0;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #f8faff, #f0f7ff);
        }

        .card-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin: 0;
        }

        .edit-btn,
        .save-btn,
        .cancel-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .edit-btn {
          background: #667eea;
          color: white;
        }

        .edit-btn:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .form-actions {
          display: flex;
          gap: 0.75rem;
        }

        .save-btn {
          background: #10b981;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #6b7280;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .save-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .info-display {
          padding: 2rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8faff;
          border-radius: 12px;
          border: 1px solid #e0e7ff;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: #f0f7ff;
          border-color: #c7d2fe;
          transform: translateY(-2px);
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-icon {
          width: 3rem;
          height: 3rem;
          background: #667eea;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
          min-width: 0;
        }

        .info-content label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-content span {
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
          word-wrap: break-word;
        }

        .bio-text {
          line-height: 1.6;
          font-style: italic;
        }

        .info-content small {
          color: #6b7280;
          font-weight: normal;
        }

        .edit-form {
          padding: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group label i {
          color: #667eea;
          width: 1rem;
          text-align: center;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.975rem;
          background: white;
          color: #374151;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #ef4444;
          background-color: rgba(239, 68, 68, 0.05);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        @media (max-width: 768px) {
          .user-info-section {
            padding: 1rem;
          }

          .card-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .form-actions {
            justify-content: stretch;
          }

          .save-btn,
          .cancel-btn {
            flex: 1;
            justify-content: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .card-header,
          .info-display,
          .edit-form {
            padding: 1.5rem;
          }

          .info-item {
            padding: 1rem;
          }

          .info-icon {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserInfoSection;