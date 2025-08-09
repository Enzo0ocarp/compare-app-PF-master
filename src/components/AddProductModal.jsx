// AddProductModal.jsx - Corregido para tu backend
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../functions/src/firebaseConfig';
import { 
  Search, X, Plus, Save, Info, AlertCircle, Check, 
  Package, ShoppingCart, Database, Upload
} from 'lucide-react';

// Importar servicios
import { addNutritionalProduct, calculateNutritionalScore } from '../functions/services/nutritionalService';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [user] = useAuthState(auth);
  
  // Estados para búsqueda de productos
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados del formulario
  const [step, setStep] = useState(1); // 1: buscar, 2: agregar info nutricional
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Datos nutricionales
  const [nutritionalData, setNutritionalData] = useState({
    calories: '',
    proteins: '',
    carbs: '',
    fats: '',
    fiber: '',
    sodium: '',
    sugar: '',
    saturatedFats: '',
    vitamins: '',
    minerals: ''
  });
  
  // Metadatos adicionales
  const [additionalData, setAdditionalData] = useState({
    source: 'manual',
    notes: '',
    verified: false
  });

  // Buscar productos en tu API - CORREGIDO
  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      console.log('🔍 Buscando productos:', term);
      
      // Llamada directa a tu API localhost:5000
      const response = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(term)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Respuesta de búsqueda:', data);
      
      // Tu backend devuelve: { query, count, results }
      // Filtrar solo productos (que tengan marca)
      const productos = (data.results || []).filter(item => item.marca && !item.sucursalNombre);
      
      console.log('✅ Productos encontrados:', productos.length);
      setSearchResults(productos);
      
    } catch (error) {
      console.error('❌ Error buscando productos:', error);
      setSearchResults([]);
      setSubmitError(`Error de búsqueda: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar producto para agregar info nutricional
  const selectProduct = (product) => {
    console.log('📋 Producto seleccionado:', product);
    setSelectedProduct(product);
    setStep(2);
  };

  // Enviar producto con información nutricional
  const submitProduct = async () => {
    if (!user || !selectedProduct) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Calcular score nutricional
      const score = calculateNutritionalScore(nutritionalData);
      
      // Preparar datos del producto
      const productData = {
        // Datos básicos del producto original
        nombre: selectedProduct.nombre,
        marca: selectedProduct.marca,
        precio: selectedProduct.precio || 0,
        presentacion: selectedProduct.presentacion || '',
        categoria: selectedProduct.categoria || determinarCategoria(selectedProduct.nombre, selectedProduct.marca),
        
        // Información nutricional
        nutritionalData: {
          ...nutritionalData,
          score,
          lastUpdated: new Date()
        },
        
        // Metadatos
        hasNutritionalInfo: true,
        source: additionalData.source,
        notes: additionalData.notes,
        verified: additionalData.verified,
        contributedBy: user.uid,
        contributorName: user.displayName || user.email,
        originalId: selectedProduct.id, // ID del producto original
        
        // Campos del sistema
        status: 'active',
        verificationCount: additionalData.verified ? 1 : 0,
        averageRating: 0,
        totalReviews: 0
      };

      console.log('💾 Guardando producto:', productData);

      // Agregar a la base de datos nutricional
      const productId = await addNutritionalProduct(productData);
      
      console.log('✅ Producto agregado con ID:', productId);
      
      // Notificar al componente padre
      if (onProductAdded) {
        onProductAdded(productData);
      }
      
      // Resetear y cerrar
      resetForm();
      onClose();
      
      alert('¡Producto agregado exitosamente al Centro Nutricional!');
      
    } catch (error) {
      console.error('❌ Error agregando producto:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para determinar categoría basada en nombre/marca
  const determinarCategoria = (nombre, marca) => {
    const nombreLower = nombre.toLowerCase();
    
    if (nombreLower.includes('aceite')) return 'Aceites';
    if (nombreLower.includes('leche')) return 'Lacteos';
    if (nombreLower.includes('yogur')) return 'Lacteos';
    if (nombreLower.includes('queso')) return 'Lacteos';
    if (nombreLower.includes('pan')) return 'Panaderia';
    if (nombreLower.includes('cereal')) return 'Cereales';
    if (nombreLower.includes('arroz')) return 'Cereales';
    if (nombreLower.includes('fideos') || nombreLower.includes('pasta')) return 'Pastas';
    if (nombreLower.includes('galleta')) return 'Galletitas';
    if (nombreLower.includes('chocolate')) return 'Dulces';
    if (nombreLower.includes('agua')) return 'Bebidas';
    if (nombreLower.includes('gaseosa') || nombreLower.includes('coca')) return 'Bebidas';
    
    return 'General';
  };

  // Resetear formulario
  const resetForm = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedProduct(null);
    setStep(1);
    setNutritionalData({
      calories: '',
      proteins: '',
      carbs: '',
      fats: '',
      fiber: '',
      sodium: '',
      sugar: '',
      saturatedFats: '',
      vitamins: '',
      minerals: ''
    });
    setAdditionalData({
      source: 'manual',
      notes: '',
      verified: false
    });
    setSubmitError(null);
  };

  // Limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="nutri-modal-overlay-modern">
      <div className="nutri-modal-modern nutri-modal-add-product">
        {/* Header */}
        <div className="nutri-modal-header-modern">
          <div className="nutri-modal-title-container">
            <h2 className="nutri-modal-title-modern">
              {step === 1 ? 'Buscar Producto' : 'Agregar Información Nutricional'}
            </h2>
            <p className="nutri-modal-subtitle-modern">
              {step === 1 ? 
                'Busca un producto para agregar información nutricional' : 
                `Producto: ${selectedProduct?.nombre}`
              }
            </p>
          </div>
          <button onClick={onClose} className="nutri-modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="nutri-modal-body-modern">
          {/* Error general */}
          {submitError && (
            <div className="nutri-error-banner">
              <AlertCircle className="w-5 h-5" />
              <p>{submitError}</p>
              <button 
                onClick={() => setSubmitError(null)}
                className="nutri-error-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 1 ? (
            /* PASO 1: BUSCAR PRODUCTOS */
            <div className="add-product-search-section">
              <div className="nutri-info-banner-modern">
                <Info className="w-5 h-5" />
                <p>
                  Busca un producto de nuestra base de datos (localhost:5000) para agregarle información nutricional.
                </p>
              </div>

              {/* Buscador */}
              <div className="nutri-search-container-modern" style={{ marginBottom: '20px' }}>
                <Search className="nutri-search-icon-modern" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, marca... ej: aceite, leche, coca cola"
                  className="nutri-search-input-modern"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
                {isSearching && (
                  <div className="nutri-search-loading">
                    <div className="nutri-loading-spinner-small"></div>
                  </div>
                )}
              </div>

              {/* Resultados de búsqueda */}
              <div className="search-results-container">
                {searchResults.length > 0 ? (
                  <div className="search-results-grid">
                    <div className="search-results-header">
                      <h4>📦 {searchResults.length} productos encontrados</h4>
                    </div>
                    {searchResults.map((product) => (
                      <div key={product.id} className="search-result-card">
                        <div className="search-result-info">
                          <h4 className="search-result-name">{product.nombre}</h4>
                          <p className="search-result-meta">
                            <strong>{product.marca}</strong> 
                            {product.presentacion && ` • ${product.presentacion}`}
                          </p>
                          {product.precio && (
                            <p className="search-result-price">
                              ${product.precio.toLocaleString()}
                            </p>
                          )}
                          <p className="search-result-id">ID: {product.id}</p>
                        </div>
                        <button
                          onClick={() => selectProduct(product)}
                          className="search-result-select-btn"
                        >
                          <Plus className="w-4 h-4" />
                          Seleccionar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchTerm.length >= 2 && !isSearching ? (
                  <div className="search-no-results">
                    <Package className="w-12 h-12" />
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con otros términos como "aceite", "leche", "coca cola"</p>
                  </div>
                ) : searchTerm.length < 2 ? (
                  <div className="search-placeholder">
                    <Database className="w-12 h-12" />
                    <h3>Busca un producto</h3>
                    <p>Escribe al menos 2 caracteres para buscar en los {" "}
                       <strong>productos de localhost:5000</strong>
                    </p>
                    <div className="search-examples">
                      <p><strong>Ejemplos:</strong> aceite, coca cola, leche, pan</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            /* PASO 2: AGREGAR INFORMACIÓN NUTRICIONAL */
            <div className="add-nutrition-section">
              {/* Información del producto seleccionado */}
              <div className="selected-product-info">
                <div className="selected-product-card">
                  <h4>{selectedProduct.nombre}</h4>
                  <p><strong>{selectedProduct.marca}</strong> {selectedProduct.presentacion && `• ${selectedProduct.presentacion}`}</p>
                  {selectedProduct.precio && (
                    <p className="selected-product-price">${selectedProduct.precio.toLocaleString()}</p>
                  )}
                  <p className="selected-product-id">ID: {selectedProduct.id}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="change-product-btn"
                >
                  Cambiar producto
                </button>
              </div>

              {/* Formulario nutricional */}
              <div className="nutri-form-sections">
                <div className="nutri-form-section">
                  <h3 className="nutri-form-section-title">Información Nutricional Básica</h3>
                  <p className="nutri-form-section-subtitle">Valores por cada 100g o 100ml</p>
                  
                  <div className="nutri-form-grid-modern">
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Calorías (kcal) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.calories}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          calories: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Proteínas (g) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.proteins}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          proteins: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Carbohidratos (g) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.carbs}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          carbs: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Grasas totales (g) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.fats}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          fats: e.target.value
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="nutri-form-section">
                  <h3 className="nutri-form-section-title">Información Adicional</h3>
                  
                  <div className="nutri-form-grid-modern">
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Fibra (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.fiber}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          fiber: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Sodio (mg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.sodium}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          sodium: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Azúcares (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.sugar}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          sugar: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Grasas saturadas (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={nutritionalData.saturatedFats}
                        onChange={(e) => setNutritionalData({
                          ...nutritionalData,
                          saturatedFats: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="nutri-form-section">
                  <h3 className="nutri-form-section-title">Metadatos</h3>
                  
                  <div className="nutri-form-group-modern nutri-form-full-width">
                    <label className="nutri-form-label-modern">Fuente de información</label>
                    <select
                      className="nutri-form-select-modern"
                      value={additionalData.source}
                      onChange={(e) => setAdditionalData({
                        ...additionalData,
                        source: e.target.value
                      })}
                    >
                      <option value="manual">Ingreso manual desde etiqueta</option>
                      <option value="photo">Foto de etiqueta nutricional</option>
                      <option value="official">Sitio web oficial del producto</option>
                      <option value="database">Base de datos nutricional</option>
                    </select>
                  </div>
                  
                  <div className="nutri-form-group-modern nutri-form-full-width">
                    <label className="nutri-form-label-modern">Notas adicionales</label>
                    <textarea
                      rows="3"
                      className="nutri-form-textarea-modern"
                      placeholder="Ej: Valores tomados del envase de 500g..."
                      value={additionalData.notes}
                      onChange={(e) => setAdditionalData({
                        ...additionalData,
                        notes: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="nutri-form-group-modern">
                    <label className="nutri-checkbox-container">
                      <input
                        type="checkbox"
                        checked={additionalData.verified}
                        onChange={(e) => setAdditionalData({
                          ...additionalData,
                          verified: e.target.checked
                        })}
                      />
                      <span className="nutri-checkbox-custom"></span>
                      <span className="nutri-checkbox-label">
                        Confirmo que la información es precisa
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="nutri-modal-footer-modern">
          {step === 1 ? (
            <button
              onClick={onClose}
              className="nutri-btn-secondary-modern"
            >
              Cancelar
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="nutri-btn-secondary-modern"
                disabled={isSubmitting}
              >
                Volver
              </button>
              <button
                onClick={submitProduct}
                className="nutri-btn-primary-modern"
                disabled={isSubmitting || !nutritionalData.calories || !nutritionalData.proteins}
              >
                {isSubmitting ? (
                  <div className="nutri-loading-spinner-small"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Agregar Producto
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Estilos específicos del componente */}
      <style jsx>{`
        .nutri-modal-add-product {
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .search-results-container {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px;
        }
        
        .search-results-header {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          margin-bottom: 10px;
          text-align: center;
        }
        
        .search-results-header h4 {
          margin: 0;
          color: #28a745;
          font-size: 14px;
        }
        
        .search-results-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .search-result-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f9f9f9;
          transition: all 0.2s;
        }
        
        .search-result-card:hover {
          background: #f0f0f0;
          border-color: #007bff;
        }
        
        .search-result-info h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        .search-result-meta {
          margin: 0 0 5px 0;
          color: #666;
          font-size: 14px;
        }
        
        .search-result-price {
          margin: 0 0 3px 0;
          font-weight: 600;
          color: #28a745;
          font-size: 14px;
        }
        
        .search-result-id {
          margin: 0;
          font-size: 12px;
          color: #888;
          font-family: monospace;
        }
        
        .search-result-select-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
        }
        
        .search-result-select-btn:hover {
          background: #0056b3;
        }
        
        .search-no-results,
        .search-placeholder {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }
        
        .search-no-results svg,
        .search-placeholder svg {
          margin: 0 auto 15px auto;
          opacity: 0.5;
        }
        
        .search-examples {
          margin-top: 10px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 13px;
        }
        
        .selected-product-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #28a745;
        }
        
        .selected-product-card h4 {
          margin: 0 0 5px 0;
          color: #28a745;
        }
        
        .selected-product-card p {
          margin: 0 0 3px 0;
          color: #666;
          font-size: 14px;
        }
        
        .selected-product-price {
          font-weight: 600;
          color: #28a745 !important;
        }
        
        .selected-product-id {
          font-family: monospace;
          font-size: 12px;
          color: #888 !important;
        }
        
        .change-product-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .change-product-btn:hover {
          background: #5a6268;
        }
        
        .nutri-checkbox-container {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        
        .nutri-error-banner {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }
        
        .nutri-error-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: #721c24;
          cursor: pointer;
          padding: 4px;
        }
      `}</style>
    </div>
  );
};

export default AddProductModal;