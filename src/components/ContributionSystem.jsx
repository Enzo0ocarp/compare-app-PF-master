// src/components/ContributionSystem.js - SISTEMA DE CONTRIBUCIONES COMPLETO
import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, X, Upload, Camera, Star, Clock, 
  CheckCircle, XCircle, AlertTriangle, User, Calendar,
  Edit2, Eye, ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react';

const ContributionSystem = ({ userRole = 'user', userId, onContributionSubmit, onContributionApprove }) => {
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [pendingContributions, setPendingContributions] = useState([]);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    category: '',
    presentation: '',
    nutritionalData: {
      calories: '',
      proteins: '',
      carbs: '',
      fats: '',
      fiber: '',
      sodium: '',
      sugar: '',
      saturatedFats: ''
    },
    ingredients: '',
    allergens: '',
    isVegan: false,
    isGlutenFree: false,
    isOrganic: false,
    images: [],
    source: '',
    notes: ''
  });

  // Simular datos de contribuciones pendientes
  useEffect(() => {
    if (userRole === 'admin') {
      setPendingContributions([
        {
          id: 1,
          productName: 'Yogurt Griego Natural La Serenísima',
          brand: 'La Serenísima',
          contributorName: 'María González',
          contributorId: 'user123',
          submissionDate: new Date('2025-01-10'),
          status: 'pending',
          nutritionalData: {
            calories: 150,
            proteins: 15,
            carbs: 8,
            fats: 8,
            fiber: 0,
            sodium: 50,
            sugar: 8,
            saturatedFats: 5
          },
          confidence: 0.9,
          source: 'Etiqueta del producto',
          notes: 'Producto verificado en supermercado Carrefour'
        },
        {
          id: 2,
          productName: 'Granola Integral con Miel',
          brand: 'Natura',
          contributorName: 'Carlos Pérez',
          contributorId: 'user456',
          submissionDate: new Date('2025-01-09'),
          status: 'pending',
          nutritionalData: {
            calories: 430,
            proteins: 12,
            carbs: 65,
            fats: 14,
            fiber: 8,
            sodium: 25,
            sugar: 18,
            saturatedFats: 3
          },
          confidence: 0.85,
          source: 'Sitio web del fabricante'
        }
      ]);
    }
  }, [userRole]);

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

  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    
    const contribution = {
      ...formData,
      contributorId: userId,
      submissionDate: new Date(),
      status: 'pending',
      confidence: 0.8
    };

    try {
      await onContributionSubmit(contribution);
      setShowContributionForm(false);
      setFormData({
        productName: '',
        brand: '',
        category: '',
        presentation: '',
        nutritionalData: {
          calories: '', proteins: '', carbs: '', fats: '',
          fiber: '', sodium: '', sugar: '', saturatedFats: ''
        },
        ingredients: '',
        allergens: '',
        isVegan: false,
        isGlutenFree: false,
        isOrganic: false,
        images: [],
        source: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error al enviar contribución:', error);
    }
  };

  const handleApproveContribution = async (contributionId, approved, adminNotes = '') => {
    try {
      await onContributionApprove(contributionId, approved, adminNotes);
      setPendingContributions(prev => 
        prev.map(contrib => 
          contrib.id === contributionId 
            ? { ...contrib, status: approved ? 'approved' : 'rejected', adminNotes }
            : contrib
        )
      );
    } catch (error) {
      console.error('Error al procesar contribución:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Aprobada' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Rechazada' }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const calculateNutritionalScore = (nutritionalData) => {
    if (!nutritionalData) return 0;
    
    let score = 5; // Base score
    
    // Factores positivos
    if (nutritionalData.proteins > 10) score += 1;
    if (nutritionalData.fiber > 3) score += 1;
    
    // Factores negativos
    if (nutritionalData.sugar > 15) score -= 1.5;
    if (nutritionalData.saturatedFats > 5) score -= 1;
    if (nutritionalData.sodium > 400) score -= 1;
    
    return Math.max(0, Math.min(10, score));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="contribution-system">
      {/* Header */}
      <div className="contribution-header">
        <h3>Sistema de Contribuciones</h3>
        {userRole === 'user' && (
          <button 
            onClick={() => setShowContributionForm(true)}
            className="btn-contribute"
          >
            <Plus className="w-4 h-4" />
            Agregar Producto
          </button>
        )}
      </div>

      {/* Formulario de contribución */}
      {showContributionForm && (
        <div className="contribution-form-overlay">
          <div className="contribution-form">
            <div className="form-header">
              <h4>Agregar Nuevo Producto</h4>
              <button onClick={() => setShowContributionForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitContribution}>
              {/* Información básica del producto */}
              <div className="form-section">
                <h5>Información del Producto</h5>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Marca"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Categoría"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Presentación (ej: 500g)"
                    value={formData.presentation}
                    onChange={(e) => handleInputChange('presentation', e.target.value)}
                  />
                </div>
              </div>

              {/* Información nutricional */}
              <div className="form-section">
                <h5>Información Nutricional (por 100g)</h5>
                <div className="nutrition-grid">
                  <input
                    type="number"
                    placeholder="Calorías"
                    value={formData.nutritionalData.calories}
                    onChange={(e) => handleInputChange('nutritionalData.calories', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Proteínas (g)"
                    value={formData.nutritionalData.proteins}
                    onChange={(e) => handleInputChange('nutritionalData.proteins', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Carbohidratos (g)"
                    value={formData.nutritionalData.carbs}
                    onChange={(e) => handleInputChange('nutritionalData.carbs', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Grasas (g)"
                    value={formData.nutritionalData.fats}
                    onChange={(e) => handleInputChange('nutritionalData.fats', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Fibra (g)"
                    value={formData.nutritionalData.fiber}
                    onChange={(e) => handleInputChange('nutritionalData.fiber', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Sodio (mg)"
                    value={formData.nutritionalData.sodium}
                    onChange={(e) => handleInputChange('nutritionalData.sodium', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Azúcares (g)"
                    value={formData.nutritionalData.sugar}
                    onChange={(e) => handleInputChange('nutritionalData.sugar', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Grasas saturadas (g)"
                    value={formData.nutritionalData.saturatedFats}
                    onChange={(e) => handleInputChange('nutritionalData.saturatedFats', e.target.value)}
                  />
                </div>
              </div>

              {/* Características especiales */}
              <div className="form-section">
                <h5>Características</h5>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isVegan}
                      onChange={(e) => handleInputChange('isVegan', e.target.checked)}
                    />
                    Vegano
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isGlutenFree}
                      onChange={(e) => handleInputChange('isGlutenFree', e.target.checked)}
                    />
                    Sin Gluten
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isOrganic}
                      onChange={(e) => handleInputChange('isOrganic', e.target.checked)}
                    />
                    Orgánico
                  </label>
                </div>
              </div>

              {/* Imágenes */}
              <div className="form-section">
                <h5>Imágenes del Producto</h5>
                <div className="image-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="image-upload"
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="upload-button">
                    <Camera className="w-5 h-5" />
                    Subir Imágenes
                  </label>
                </div>
                {formData.images.length > 0 && (
                  <div className="image-preview">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-item">
                        <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
                        <button onClick={() => removeImage(index)}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fuente y notas */}
              <div className="form-section">
                <h5>Información Adicional</h5>
                <input
                  type="text"
                  placeholder="Fuente de la información"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                />
                <textarea
                  placeholder="Notas adicionales"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowContributionForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="w-4 h-4" />
                  Enviar Contribución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Panel de administración */}
      {userRole === 'admin' && (
        <div className="admin-panel">
          <h4>Contribuciones Pendientes</h4>
          {pendingContributions.length === 0 ? (
            <p>No hay contribuciones pendientes</p>
          ) : (
            <div className="contributions-list">
              {pendingContributions.map(contribution => (
                <div key={contribution.id} className="contribution-item">
                  <div className="contribution-header">
                    <div>
                      <h5>{contribution.productName}</h5>
                      <p>{contribution.brand}</p>
                    </div>
                    {getStatusBadge(contribution.status)}
                  </div>
                  
                  <div className="contribution-details">
                    <p><strong>Contribuidor:</strong> {contribution.contributorName}</p>
                    <p><strong>Fecha:</strong> {contribution.submissionDate.toLocaleDateString()}</p>
                    <p><strong>Confianza:</strong> {Math.round(contribution.confidence * 100)}%</p>
                    {contribution.source && <p><strong>Fuente:</strong> {contribution.source}</p>}
                  </div>

                  {contribution.status === 'pending' && (
                    <div className="contribution-actions">
                      <button 
                        onClick={() => handleApproveContribution(contribution.id, true)}
                        className="btn-approve"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button 
                        onClick={() => handleApproveContribution(contribution.id, false)}
                        className="btn-reject"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .contribution-system {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .contribution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .btn-contribute {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-contribute:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .contribution-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .contribution-form {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-section {
          margin-bottom: 24px;
        }

        .form-section h5 {
          margin-bottom: 16px;
          font-weight: 600;
          color: #374151;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .form-row input,
        .nutrition-grid input,
        .form-section input,
        .form-section textarea {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-row input:focus,
        .nutrition-grid input:focus,
        .form-section input:focus,
        .form-section textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .checkbox-group {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-button:hover {
          border-color: #667eea;
          background: #f8faff;
        }

        .image-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .image-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-item img {
          width: 100%;
          height: 80px;
          object-fit: cover;
        }

        .image-item button {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .form-actions button {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .form-actions button:first-child {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          color: #374151;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #667eea;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #5a67d8;
        }

        .admin-panel {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .contributions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contribution-item {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f8f9fa;
        }

        .contribution-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .contribution-details {
          margin-bottom: 16px;
        }

        .contribution-details p {
          margin-bottom: 4px;
          font-size: 14px;
          color: #6b7280;
        }

        .contribution-actions {
          display: flex;
          gap: 12px;
        }

        .btn-approve,
        .btn-reject {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-approve {
          background: #10b981;
          color: white;
          border: none;
        }

        .btn-approve:hover {
          background: #059669;
        }

        .btn-reject {
          background: #ef4444;
          color: white;
          border: none;
        }

        .btn-reject:hover {
          background: #dc2626;
        }

        .hidden {
          display: none;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .nutrition-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .checkbox-group {
            flex-direction: column;
          }
          
          .contribution-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default ContributionSystem;