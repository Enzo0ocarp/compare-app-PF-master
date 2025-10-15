// src/components/AdminPanel.jsx - PANEL DE ADMINISTRACIÓN
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Shield, 
  User, Clock, Eye, Image as ImageIcon
} from 'lucide-react';
import { 
  getPendingImageProducts, 
  approveProductImage, 
  rejectProductImage 
} from '../functions/services/adminService';

const AdminPanel = ({ currentUser }) => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPendingProducts();
  }, []);

  const loadPendingProducts = async () => {
    try {
      setIsLoading(true);
      const products = await getPendingImageProducts();
      setPendingProducts(products);
    } catch (error) {
      console.error('Error cargando productos pendientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await approveProductImage(productId, currentUser.uid);
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      alert('✅ Imagen aprobada exitosamente');
    } catch (error) {
      alert('Error aprobando imagen: ' + error.message);
    }
  };

  const handleReject = async (productId) => {
    if (!rejectionReason.trim()) {
      alert('Por favor ingresa una razón para el rechazo');
      return;
    }

    try {
      await rejectProductImage(productId, currentUser.uid, rejectionReason);
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
      setSelectedProduct(null);
      setRejectionReason('');
      alert('❌ Imagen rechazada');
    } catch (error) {
      alert('Error rechazando imagen: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="nutri-admin-panel-loading">
        <div className="nutri-loading-spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="nutri-admin-panel">
      {/* Header */}
      <div className="nutri-admin-header">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Panel de Administración</h2>
        </div>
        <div className="nutri-admin-stats">
          <div className="stat-item">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>{pendingProducts.length} pendientes</span>
          </div>
        </div>
      </div>

      {/* Lista de productos pendientes */}
      {pendingProducts.length === 0 ? (
        <div className="nutri-admin-empty">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3>¡Todo al día!</h3>
          <p>No hay imágenes pendientes de verificación</p>
        </div>
      ) : (
        <div className="nutri-admin-grid">
          {pendingProducts.map(product => (
            <div key={product.id} className="nutri-admin-card">
              {/* Imagen del producto */}
              <div className="nutri-admin-image-container">
                <img 
                  src={product.imageUrl} 
                  alt={product.nombre}
                  className="nutri-admin-image"
                  onError={(e) => e.target.src = '/api/placeholder/300/300'}
                />
                <div className="nutri-admin-image-overlay">
                  <button 
                    onClick={() => window.open(product.imageUrl, '_blank')}
                    className="nutri-view-full-btn"
                  >
                    <Eye className="w-4 h-4" />
                    Ver completa
                  </button>
                </div>
              </div>

              {/* Información del producto */}
              <div className="nutri-admin-card-body">
                <h3 className="text-lg font-bold mb-1">{product.nombre}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.marca}</p>
                
                {/* Metadata */}
                <div className="nutri-admin-metadata">
                  <div className="metadata-item">
                    <User className="w-4 h-4" />
                    <span className="text-xs">
                      {product.imageUploadedBy || 'Usuario anónimo'}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">
                      {product.imageUploadedAt?.toDate?.()?.toLocaleDateString?.() || 'Fecha desconocida'}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs">
                      {product.imageType || 'image/jpeg'}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="nutri-admin-actions">
                  <button
                    onClick={() => handleApprove(product.id)}
                    className="nutri-approve-btn"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="nutri-reject-btn"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {selectedProduct && (
        <div className="nutri-modal-overlay-modern" onClick={() => setSelectedProduct(null)}>
          <div className="nutri-modal-modern" onClick={(e) => e.stopPropagation()}>
            <div className="nutri-modal-header-modern">
              <h3>Rechazar imagen</h3>
              <button onClick={() => setSelectedProduct(null)} className="nutri-modal-close">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="nutri-modal-body-modern">
              <p className="mb-4">¿Por qué rechazas esta imagen?</p>
              <textarea
                className="nutri-form-textarea-modern"
                rows="4"
                placeholder="Ej: Imagen borrosa, producto incorrecto, contenido inapropiado..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="nutri-modal-footer-modern">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="nutri-btn-secondary-modern"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleReject(selectedProduct.id)}
                className="nutri-btn-primary-modern"
                style={{background: 'linear-gradient(135deg, #e74c3c, #c0392b)'}}
              >
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;