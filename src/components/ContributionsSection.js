// src/components/ContributionsSection.js - CON FUNCIONALIDADES REALES
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../functions/src/firebaseConfig';
import { useNotification } from './Notification';

const ContributionsSection = ({ userId, userRole }) => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // Estados del formulario
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    category: '',
    nutritionalInfo: {
      calories: '',
      proteins: '',
      carbs: '',
      fats: '',
      fiber: '',
      sodium: '',
      sugar: ''
    },
    additionalInfo: ''
  });

  useEffect(() => {
    loadContributions();
  }, [userId]);

  // Cargar contribuciones reales desde Firebase
  const loadContributions = async () => {
    setLoading(true);
    try {
      const contributionsQuery = query(
        collection(db, 'nutritional_contributions'),
        where('userId', '==', userId),
        orderBy('submissionDate', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(contributionsQuery);
      const contributionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submissionDate: doc.data().submissionDate?.toDate() || new Date()
      }));

      setContributions(contributionsData);
    } catch (error) {
      console.error('Error cargando contribuciones:', error);
      showNotification('Error al cargar las contribuciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enviar nueva contribución
  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const contributionData = {
        userId,
        productName: formData.productName.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        nutritionalInfo: {
          calories: parseFloat(formData.nutritionalInfo.calories) || 0,
          proteins: parseFloat(formData.nutritionalInfo.proteins) || 0,
          carbs: parseFloat(formData.nutritionalInfo.carbs) || 0,
          fats: parseFloat(formData.nutritionalInfo.fats) || 0,
          fiber: parseFloat(formData.nutritionalInfo.fiber) || 0,
          sodium: parseFloat(formData.nutritionalInfo.sodium) || 0,
          sugar: parseFloat(formData.nutritionalInfo.sugar) || 0
        },
        additionalInfo: formData.additionalInfo.trim(),
        status: 'pending',
        submissionDate: new Date(),
        reviewedBy: null,
        reviewDate: null
      };

      await addDoc(collection(db, 'nutritional_contributions'), contributionData);
      
      showNotification('Contribución enviada correctamente. Será revisada pronto.', 'success');
      
      // Limpiar formulario y cerrar modal
      setFormData({
        productName: '',
        brand: '',
        category: '',
        nutritionalInfo: {
          calories: '',
          proteins: '',
          carbs: '',
          fats: '',
          fiber: '',
          sodium: '',
          sugar: ''
        },
        additionalInfo: ''
      });
      setShowForm(false);
      
      // Recargar contribuciones
      loadContributions();

    } catch (error) {
      console.error('Error enviando contribución:', error);
      showNotification('Error al enviar la contribución. Intenta nuevamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'Pendiente', 
        class: 'pending', 
        icon: 'fas fa-clock',
        color: '#f59e0b'
      },
      approved: { 
        label: 'Aprobada', 
        class: 'approved', 
        icon: 'fas fa-check',
        color: '#10b981'
      },
      rejected: { 
        label: 'Rechazada', 
        class: 'rejected', 
        icon: 'fas fa-times',
        color: '#ef4444'
      }
    };
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span 
        className={`status-badge ${config.class}`}
        style={{ color: config.color, borderColor: config.color }}
      >
        <i className={config.icon}></i>
        {config.label}
      </span>
    );
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="contributions-section">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Cargando contribuciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contributions-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-plus-circle"></i>
          Mis Contribuciones
        </h2>
        <p>Ayuda a mejorar la base de datos agregando información nutricional</p>
      </div>

      {/* Estadísticas */}
      <div className="contribution-stats">
        <div className="stat-item">
          <span className="stat-number">{contributions.length}</span>
          <span className="stat-label">Total enviadas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {contributions.filter(c => c.status === 'approved').length}
          </span>
          <span className="stat-label">Aprobadas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {contributions.filter(c => c.status === 'pending').length}
          </span>
          <span className="stat-label">Pendientes</span>
        </div>
      </div>

      {/* Botón para nueva contribución */}
      <div className="contribution-actions">
        <button 
          className="add-contribution-btn"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i>
          Nueva Contribución
        </button>
      </div>

      {/* Lista de contribuciones */}
      <div className="contributions-list">
        {contributions.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-clipboard-list"></i>
            <h3>No tienes contribuciones</h3>
            <p>Comienza a agregar información nutricional para ayudar a la comunidad</p>
          </div>
        ) : (
          contributions.map(contribution => (
            <div key={contribution.id} className="contribution-item">
              <div className="contribution-main">
                <div className="contribution-info">
                  <h4>{contribution.productName}</h4>
                  <div className="contribution-details">
                    <span className="brand">
                      <i className="fas fa-tag"></i>
                      {contribution.brand}
                    </span>
                    <span className="category">
                      <i className="fas fa-folder"></i>
                      {contribution.category}
                    </span>
                    <span className="submission-date">
                      <i className="fas fa-calendar"></i>
                      {contribution.submissionDate.toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <div className="contribution-status">
                  {getStatusBadge(contribution.status)}
                </div>
              </div>
              
              {/* Información nutricional resumida */}
              {contribution.nutritionalInfo && (
                <div className="nutrition-summary">
                  <div className="nutrition-item">
                    <span>Calorías: {contribution.nutritionalInfo.calories}</span>
                  </div>
                  <div className="nutrition-item">
                    <span>Proteínas: {contribution.nutritionalInfo.proteins}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span>Carbohidratos: {contribution.nutritionalInfo.carbs}g</span>
                  </div>
                  <div className="nutrition-item">
                    <span>Grasas: {contribution.nutritionalInfo.fats}g</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="contribution-form-modal">
          <div className="modal-backdrop" onClick={() => !submitting && setShowForm(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nueva Contribución Nutricional</h3>
              <button 
                className="close-btn"
                onClick={() => !submitting && setShowForm(false)}
                disabled={submitting}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitContribution} className="contribution-form">
              {/* Información básica del producto */}
              <div className="form-section">
                <h4>Información del Producto</h4>
                
                <div className="form-group">
                  <label>Nombre del producto *</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="Ej: Yogurt Griego Natural"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Marca *</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Ej: La Serenísima"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoría *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="lacteos">Lácteos</option>
                      <option value="carnes">Carnes</option>
                      <option value="frutas">Frutas</option>
                      <option value="verduras">Verduras</option>
                      <option value="cereales">Cereales</option>
                      <option value="bebidas">Bebidas</option>
                      <option value="snacks">Snacks</option>
                      <option value="congelados">Congelados</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Información nutricional */}
              <div className="form-section">
                <h4>Información Nutricional (por 100g)</h4>
                
                <div className="nutrition-grid">
                  <div className="form-group">
                    <label>Calorías (kcal)</label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.calories}
                      onChange={(e) => handleInputChange('nutritionalInfo.calories', e.target.value)}
                      placeholder="250"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Proteínas (g)</label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.proteins}
                      onChange={(e) => handleInputChange('nutritionalInfo.proteins', e.target.value)}
                      placeholder="10.5"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Carbohidratos (g)</label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.carbs}
                      onChange={(e) => handleInputChange('nutritionalInfo.carbs', e.target.value)}
                      placeholder="25.0"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Grasas (g)</label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.fats}
                      onChange={(e) => handleInputChange('nutritionalInfo.fats', e.target.value)}
                      placeholder="5.5"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Fibra (g)</label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.fiber}
                      onChange={(e) => handleInputChange('nutritionalInfo.fiber', e.target.value)}
                      placeholder="2.0"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Sodio (mg)</label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.sodium}
                      onChange={(e) => handleInputChange('nutritionalInfo.sodium', e.target.value)}
                      placeholder="150"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Azúcar (g)</label>
                    <input
                      type="number"
                      value={formData.nutritionalInfo.sugar}
                      onChange={(e) => handleInputChange('nutritionalInfo.sugar', e.target.value)}
                      placeholder="3.5"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="form-section">
                <h4>Información Adicional</h4>
                <div className="form-group">
                  <label>Notas o comentarios (opcional)</label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Información adicional sobre el producto..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Botones del formulario */}
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Enviar Contribución
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .contributions-section {
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

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .loading-state i {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #667eea;
        }

        .contribution-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .contribution-actions {
          margin-bottom: 2rem;
        }

        .add-contribution-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 auto;
        }

        .add-contribution-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
        }

        .contributions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .empty-state i {
          font-size: 3rem;
          color: #d1d5db;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        .contribution-item {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .contribution-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .contribution-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
        }

        .contribution-info h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .contribution-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .contribution-details span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .contribution-details i {
          color: #667eea;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 2px solid;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .nutrition-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          padding: 1rem 1.5rem 1.5rem;
          background: #f8faff;
          border-top: 1px solid #e5e7eb;
        }

        .nutrition-item {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .contribution-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin: 0;
        }

        .close-btn {
          width: 2.5rem;
          height: 2.5rem;
          border: none;
          background: #f3f4f6;
          border-radius: 50%;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .contribution-form {
          padding: 2rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-btn,
        .submit-btn {
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

        .cancel-btn {
          background: #f3f4f6;
          color: #6b7280;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e5e7eb;
          color: #374151;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        .submit-btn:disabled,
        .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .contributions-section {
            padding: 1rem;
          }

          .contribution-main {
            flex-direction: column;
            gap: 1rem;
          }

          .contribution-details {
            flex-direction: column;
            gap: 0.5rem;
          }

          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .modal-header,
          .contribution-form {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .nutrition-grid {
            grid-template-columns: 1fr 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .section-header h2 {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .nutrition-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ContributionsSection;