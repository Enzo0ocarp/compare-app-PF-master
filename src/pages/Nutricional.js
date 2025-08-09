import React, { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../functions/src/firebaseConfig';
import '../styles/NutricionalStyles.css';
import { 
  Search, Filter, Plus, Check, X, Clock, AlertCircle, TrendingUp, 
  Award, Users, BarChart3, Info, ChevronDown, Eye, Edit2, 
  CheckCircle, XCircle, Upload, Save, Heart, Share2, 
  Bookmark, Settings, Star, ThumbsUp
} from 'lucide-react';

// Importar servicios de Firebase
import {
  getNutritionalProducts,
  searchNutritionalProducts,
  addNutritionalContribution,
  getPendingContributions,
  reviewContribution,
  addProductReview,
  getProductReviews,
  saveComparison,
  getUserPreferences,
  saveUserPreferences,
  getNutritionalStats,
  calculateNutritionalScore
} from '../functions/services/nutritionalService'; // Corregido: sin functions/

// Importar componente para agregar productos
import AddProductModal from '../components/AddProductModal';

const NutritionalScreen = () => {
  // Estado de autenticación
  const [user, loading, error] = useAuthState(auth);
  
  // Estados principales
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  // Estados de modales
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false); // NUEVO
  
  // Estados de funcionalidad
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pendingContributions, setPendingContributions] = useState([]);
  const [userRole, setUserRole] = useState('user');
  const [userPreferences, setUserPreferences] = useState({});
  
  // Estado para el formulario de contribución
  const [contributionForm, setContributionForm] = useState({
    productId: '',
    productName: '',
    nutritionalData: {
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
    },
    source: 'manual',
    notes: '',
    images: []
  });

  // NUEVA FUNCIÓN: Manejar producto agregado
  const handleProductAdded = (newProduct) => {
    // Agregar el nuevo producto a la lista actual
    setProducts(prevProducts => [newProduct, ...prevProducts]);
    
    // Actualizar estadísticas
    setStats(prevStats => ({
      ...prevStats,
      totalProducts: (prevStats.totalProducts || 0) + 1
    }));
    
    console.log('✅ Producto agregado a la lista:', newProduct.nombre);
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Cargar productos y estadísticas en paralelo
      const [productsData, statsData] = await Promise.all([
        getNutritionalProducts(20),
        getNutritionalStats()
      ]);
      
      setProducts(productsData);
      setStats(statsData);

      // Si hay usuario, cargar sus preferencias y contribuciones pendientes
      if (user) {
        const [preferences, pending] = await Promise.all([
          getUserPreferences(user.uid),
          userRole === 'admin' ? getPendingContributions() : Promise.resolve([])
        ]);
        
        setUserPreferences(preferences);
        setPendingContributions(pending);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar productos
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length > 2) {
      setIsLoading(true);
      try {
        const results = await searchNutritionalProducts(term);
        setProducts(results);
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (term.length === 0) {
      loadInitialData();
    }
  };

  // Enviar contribución
  const submitContribution = async () => {
    if (!user) {
      alert('Debes iniciar sesión para contribuir');
      return;
    }

    try {
      setIsLoading(true);
      
      const contributionData = {
        productId: contributionForm.productId,
        productName: contributionForm.productName,
        nutritionalData: {
          ...contributionForm.nutritionalData,
          score: calculateNutritionalScore(contributionForm.nutritionalData)
        },
        source: contributionForm.source,
        notes: contributionForm.notes,
        images: contributionForm.images
      };

      await addNutritionalContribution(contributionData, user.uid);
      
      setShowContributionModal(false);
      resetContributionForm();
      
      // Recargar contribuciones pendientes si es admin
      if (userRole === 'admin') {
        const pending = await getPendingContributions();
        setPendingContributions(pending);
      }
      
      alert('¡Contribución enviada! Será revisada por nuestro equipo.');
    } catch (error) {
      console.error('Error enviando contribución:', error);
      alert('Error al enviar la contribución. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear formulario de contribución
  const resetContributionForm = () => {
    setContributionForm({
      productId: '',
      productName: '',
      nutritionalData: {
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
      },
      source: 'manual',
      notes: '',
      images: []
    });
  };

  // Aprobar/Rechazar contribución (Admin)
  const handleContributionReview = async (contributionId, action) => {
    if (!user || userRole !== 'admin') return;

    try {
      setIsLoading(true);
      await reviewContribution(contributionId, action, user.uid);
      
      // Actualizar lista de contribuciones pendientes
      const updatedPending = pendingContributions.filter(c => c.id !== contributionId);
      setPendingContributions(updatedPending);
      
      // Recargar productos si se aprobó
      if (action === 'approve') {
        await loadInitialData();
      }
      
    } catch (error) {
      console.error('Error revisando contribución:', error);
      alert('Error al procesar la contribución');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar contribución
  const handleContribution = (product) => {
    if (!user) {
      alert('Debes iniciar sesión para contribuir');
      return;
    }
    
    setContributionForm({
      ...contributionForm,
      productId: product.id,
      productName: product.nombre
    });
    setShowContributionModal(true);
  };

  // Comparar productos
  const handleCompare = async () => {
    if (selectedProducts.length >= 2) {
      if (user) {
        await saveComparison(selectedProducts, user.uid);
      }
      setShowComparisonModal(true);
    }
  };

  // Toggle selección de productos
  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else if (selectedProducts.length < 3) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Obtener color según score
  const getScoreColor = (score) => {
    if (score >= 8) return 'nutri-score-high';
    if (score >= 6) return 'nutri-score-medium';
    return 'nutri-score-low';
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.marca?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'todos' || 
                          (filterCategory === 'con-info' && product.hasNutritionalInfo) ||
                          (filterCategory === 'sin-info' && !product.hasNutritionalInfo) ||
                          (filterCategory === 'pendientes' && product.nutritionalData?.status === 'pending');
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="nutritional-page nutritional-container">
        <div className="nutri-loading-screen">
          <div className="nutri-loading-spinner"></div>
          <p>Cargando información nutricional...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nutritional-page nutritional-container">
      {/* Header Estadísticas Mejorado */}
      <div className="nutri-header-enhanced">
        <div className="nutri-header-content">
          <div className="nutri-header-main">
            <h1>Centro Nutricional</h1>
            <p className="nutri-header-subtitle">
              Decisiones inteligentes para una vida más saludable
            </p>
            
            {user && (
              <div className="nutri-user-welcome">
                <span>¡Hola, {user.displayName || 'Usuario'}!</span>
                <div className="nutri-user-points">
                  <Award className="w-4 h-4" />
                  <span>{userPreferences.points || 0} puntos</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="nutri-stats-grid-enhanced">
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <BarChart3 className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">{stats.totalProducts || 0}</div>
                <div className="nutri-stat-label">Productos con info</div>
              </div>
            </div>
            
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <Users className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">{pendingContributions.length}</div>
                <div className="nutri-stat-label">Contribuciones pendientes</div>
              </div>
            </div>
            
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <TrendingUp className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">95%</div>
                <div className="nutri-stat-label">Precisión datos</div>
              </div>
            </div>
            
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <Star className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">{stats.totalReviews || 0}</div>
                <div className="nutri-stat-label">Reseñas totales</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles mejorados */}
      <div className="nutri-controls-enhanced">
        <div className="nutri-controls-content">
          <div className="nutri-controls-flex-modern">
            <div className="nutri-search-container-modern">
              <Search className="nutri-search-icon-modern" />
              <input
                type="text"
                placeholder="Buscar productos por nombre o marca..."
                className="nutri-search-input-modern"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => handleSearch('')}
                  className="nutri-search-clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="nutri-filters-container">
              <select
                className="nutri-filter-select-modern"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="todos">Todos los productos</option>
                <option value="con-info">Con información nutricional</option>
                <option value="sin-info">Sin información nutricional</option>
                <option value="pendientes">Pendiente de aprobación</option>
              </select>
              
              {user && (
                <button
                  onClick={() => setShowPreferencesModal(true)}
                  className="nutri-preferences-btn"
                >
                  <Settings className="w-4 h-4" />
                  Preferencias
                </button>
              )}
            </div>
            
            {/* NUEVO: Botón para agregar productos */}
            {user && (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="nutri-add-product-btn-enhanced"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Producto</span>
                <div className="nutri-btn-glow"></div>
              </button>
            )}
            
            {/* Botón comparar mejorado */}
            {selectedProducts.length >= 2 && (
              <button
                onClick={handleCompare}
                className="nutri-compare-btn-enhanced"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Comparar ({selectedProducts.length})</span>
                <div className="nutri-btn-glow"></div>
              </button>
            )}
            
            {/* Cambiar rol (demo) */}
            {user && (
              <button
                onClick={() => setUserRole(userRole === 'admin' ? 'user' : 'admin')}
                className="nutri-role-toggle-modern"
              >
                <span className="nutri-role-indicator"></span>
                {userRole === 'admin' ? 'Admin' : 'Usuario'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Panel Admin - Contribuciones Pendientes Mejorado */}
      {user && userRole === 'admin' && pendingContributions.length > 0 && (
        <div className="nutri-admin-panel-enhanced">
          <div className="nutri-pending-container-modern">
            <div className="nutri-pending-header-modern">
              <div className="nutri-pending-title">
                <Clock className="w-6 h-6" />
                <h3>Contribuciones Pendientes</h3>
                <span className="nutri-pending-count">{pendingContributions.length}</span>
              </div>
            </div>
            
            <div className="nutri-pending-grid">
              {pendingContributions.map(contribution => (
                <div key={contribution.id} className="nutri-pending-card-modern">
                  <div className="nutri-pending-card-header">
                    <h4 className="nutri-pending-product-name">{contribution.productName}</h4>
                    <span className="nutri-pending-date">
                      {new Date(contribution.createdAt?.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="nutri-pending-contributor">
                    <span>Por: {contribution.userId}</span>
                  </div>
                  
                  <div className="nutri-pending-nutrition-preview">
                    <div className="nutri-mini-grid">
                      <div className="nutri-mini-item">
                        <span className="nutri-mini-label">Cal</span>
                        <span className="nutri-mini-value">{contribution.nutritionalData.calories}</span>
                      </div>
                      <div className="nutri-mini-item">
                        <span className="nutri-mini-label">Prot</span>
                        <span className="nutri-mini-value">{contribution.nutritionalData.proteins}g</span>
                      </div>
                      <div className="nutri-mini-item">
                        <span className="nutri-mini-label">Carb</span>
                        <span className="nutri-mini-value">{contribution.nutritionalData.carbs}g</span>
                      </div>
                      <div className="nutri-mini-item">
                        <span className="nutri-mini-label">Gras</span>
                        <span className="nutri-mini-value">{contribution.nutritionalData.fats}g</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="nutri-pending-actions-modern">
                    <button
                      onClick={() => handleContributionReview(contribution.id, 'approve')}
                      className="nutri-approve-btn-modern"
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleContributionReview(contribution.id, 'reject')}
                      className="nutri-reject-btn-modern"
                      disabled={isLoading}
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid de productos mejorado */}
      <div className="nutri-products-section-enhanced">
        {isLoading && (
          <div className="nutri-loading-overlay">
            <div className="nutri-loading-spinner"></div>
          </div>
        )}
        
        <div className="nutri-products-grid-modern">
          {filteredProducts.map(product => (
            <div key={product.id} className="nutri-product-card-enhanced">
              {/* Header de la tarjeta */}
              <div className="nutri-product-header-modern">
                <label className="nutri-compare-checkbox-modern">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="nutri-checkbox-input"
                  />
                  <span className="nutri-checkbox-custom"></span>
                  <span className="nutri-checkbox-label">Comparar</span>
                </label>
                
                <div className="nutri-product-actions">
                  {user && (
                    <>
                      <button className="nutri-action-btn">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button className="nutri-action-btn">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                
                {product.nutritionalData?.status === 'pending' && (
                  <div className="nutri-status-badge nutri-status-pending">
                    <Clock className="w-3 h-3" />
                    Pendiente
                  </div>
                )}
              </div>
              
              <div className="nutri-product-body-enhanced">
                <div className="nutri-product-image-container">
                  <img
                    src={product.imagen || '/api/placeholder/150/150'}
                    alt={product.nombre}
                    className="nutri-product-image-modern"
                  />
                  {product.averageRating > 0 && (
                    <div className="nutri-rating-overlay">
                      <Star className="w-3 h-3 nutri-star-filled" />
                      <span>{product.averageRating}</span>
                    </div>
                  )}
                </div>
                
                <div className="nutri-product-info">
                  <h3 className="nutri-product-name-modern">{product.nombre}</h3>
                  <p className="nutri-product-meta-modern">
                    {product.marca} • {product.presentacion}
                  </p>
                  <p className="nutri-product-price-modern">${product.precio}</p>
                </div>
                
                {product.hasNutritionalInfo ? (
                  <div className="nutri-info-section-enhanced">
                    {/* Score Nutricional */}
                    <div className={`nutri-score-badge-modern ${getScoreColor(product.nutritionalData?.score || 0)}`}>
                      <div className="nutri-score-icon">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="nutri-score-text">
                        {product.nutritionalData?.score || 0}/10
                      </span>
                    </div>
                    
                    {/* Grid nutricional */}
                    <div className="nutri-data-grid-modern">
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Calorías</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData?.calories}
                        </span>
                      </div>
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Proteínas</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData?.proteins}g
                        </span>
                      </div>
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Carbos</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData?.carbs}g
                        </span>
                      </div>
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Grasas</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData?.fats}g
                        </span>
                      </div>
                    </div>
                    
                    <div className="nutri-product-actions-modern">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="nutri-details-btn-modern"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </button>
                      
                      {user && (
                        <button className="nutri-heart-btn">
                          <Heart className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="nutri-no-info-modern">
                    <div className="nutri-no-info-icon-container">
                      <AlertCircle className="nutri-no-info-icon-modern" />
                    </div>
                    <p className="nutri-no-info-text-modern">
                      Sin información nutricional
                    </p>
                    <button
                      onClick={() => handleContribution(product)}
                      className="nutri-contribute-btn-modern"
                      disabled={!user}
                    >
                      <Plus className="w-4 h-4" />
                      {user ? 'Contribuir datos' : 'Inicia sesión para contribuir'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && !isLoading && (
          <div className="nutri-empty-state">
            <AlertCircle className="nutri-empty-icon" />
            <h3>No se encontraron productos</h3>
            <p>Intenta cambiar los filtros o términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de Agregar Producto NUEVO */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Modal de Contribución Mejorado */}
      {showContributionModal && (
        <div className="nutri-modal-overlay-modern">
          <div className="nutri-modal-modern nutri-modal-contribution">
            <div className="nutri-modal-header-modern">
              <div className="nutri-modal-title-container">
                <h2 className="nutri-modal-title-modern">Contribuir Información</h2>
                <p className="nutri-modal-subtitle-modern">
                  Producto: {contributionForm.productName}
                </p>
              </div>
              <button 
                onClick={() => setShowContributionModal(false)}
                className="nutri-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="nutri-modal-body-modern">
              <div className="nutri-info-banner-modern">
                <Info className="w-5 h-5" />
                <p>
                  Ingresa los valores por cada 100g o 100ml del producto. 
                  Tu contribución será revisada antes de ser publicada.
                </p>
              </div>
              
              <div className="nutri-form-sections">
                <div className="nutri-form-section">
                  <h3 className="nutri-form-section-title">Información Básica</h3>
                  <div className="nutri-form-grid-modern">
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Calorías (kcal)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={contributionForm.nutritionalData.calories}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            calories: e.target.value
                          }
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Proteínas (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={contributionForm.nutritionalData.proteins}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            proteins: e.target.value
                          }
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Carbohidratos (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={contributionForm.nutritionalData.carbs}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            carbs: e.target.value
                          }
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Grasas totales (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={contributionForm.nutritionalData.fats}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            fats: e.target.value
                          }
                        })}
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
                        value={contributionForm.nutritionalData.fiber}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            fiber: e.target.value
                          }
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Sodio (mg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={contributionForm.nutritionalData.sodium}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            sodium: e.target.value
                          }
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Azúcares (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={contributionForm.nutritionalData.sugar}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            sugar: e.target.value
                          }
                        })}
                      />
                    </div>
                    
                    <div className="nutri-form-group-modern">
                      <label className="nutri-form-label-modern">Grasas saturadas (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="nutri-form-input-modern"
                        value={contributionForm.nutritionalData.saturatedFats}
                        onChange={(e) => setContributionForm({
                          ...contributionForm,
                          nutritionalData: {
                            ...contributionForm.nutritionalData,
                            saturatedFats: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="nutri-form-section">
                  <h3 className="nutri-form-section-title">Fuente y Notas</h3>
                  <div className="nutri-form-group-modern nutri-form-full-width">
                    <label className="nutri-form-label-modern">Fuente de información</label>
                    <select
                      className="nutri-form-select-modern"
                      value={contributionForm.source}
                      onChange={(e) => setContributionForm({
                        ...contributionForm,
                        source: e.target.value
                      })}
                    >
                      <option value="manual">Ingreso manual desde etiqueta</option>
                      <option value="photo">Foto de etiqueta nutricional</option>
                      <option value="official">Sitio web oficial del producto</option>
                    </select>
                  </div>
                  
                  <div className="nutri-form-group-modern nutri-form-full-width">
                    <label className="nutri-form-label-modern">Notas adicionales</label>
                    <textarea
                      rows="3"
                      className="nutri-form-textarea-modern"
                      placeholder="Ej: Valores tomados del envase de 500g..."
                      value={contributionForm.notes}
                      onChange={(e) => setContributionForm({
                        ...contributionForm,
                        notes: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="nutri-modal-footer-modern">
              <button
                onClick={() => setShowContributionModal(false)}
                className="nutri-btn-secondary-modern"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={submitContribution}
                className="nutri-btn-primary-modern"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="nutri-loading-spinner-small"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enviar contribución
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comparación (versión simplificada) */}
      {showComparisonModal && (
        <div className="nutri-modal-overlay-modern">
          <div className="nutri-modal-modern nutri-modal-wide">
            <div className="nutri-modal-header-modern">
              <div className="nutri-modal-title-container">
                <h2 className="nutri-modal-title-modern">Comparación Nutricional</h2>
                <p className="nutri-modal-subtitle-modern">
                  Análisis de {selectedProducts.length} productos
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowComparisonModal(false);
                  setSelectedProducts([]);
                }}
                className="nutri-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="nutri-modal-body-modern">
              <div className="nutri-comparison-container">
                <p>Funcionalidad de comparación mejorada próximamente...</p>
                <div className="nutri-comparison-preview">
                  {selectedProducts.map(productId => {
                    const product = products.find(p => p.id === productId);
                    return product ? (
                      <div key={productId} className="nutri-comparison-item">
                        <h4>{product.nombre}</h4>
                        <p>{product.marca}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Producto (versión simplificada) */}
      {selectedProduct && (
        <div className="nutri-modal-overlay-modern">
          <div className="nutri-modal-modern">
            <div className="nutri-modal-header-modern">
              <div className="nutri-modal-title-container">
                <h2 className="nutri-modal-title-modern">{selectedProduct.nombre}</h2>
                <p className="nutri-modal-subtitle-modern">
                  {selectedProduct.marca} • {selectedProduct.presentacion}
                </p>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="nutri-modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="nutri-modal-body-modern">
              {selectedProduct.hasNutritionalInfo ? (
                <div className="nutri-detail-content">
                  <div className="nutri-detail-score-section">
                    <div className={`nutri-score-badge-large ${getScoreColor(selectedProduct.nutritionalData?.score || 0)}`}>
                      <Award className="w-8 h-8" />
                      <span>Score: {selectedProduct.nutritionalData?.score || 0}/10</span>
                    </div>
                  </div>
                  
                  <div className="nutri-detail-grid-modern">
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData?.calories}</span>
                      <span className="nutri-detail-label">Calorías</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData?.proteins}g</span>
                      <span className="nutri-detail-label">Proteínas</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData?.carbs}g</span>
                      <span className="nutri-detail-label">Carbohidratos</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData?.fats}g</span>
                      <span className="nutri-detail-label">Grasas</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="nutri-no-info-detail">
                  <AlertCircle className="nutri-no-info-icon-large" />
                  <p>Este producto aún no tiene información nutricional</p>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      handleContribution(selectedProduct);
                    }}
                    className="nutri-contribute-btn-modern"
                  >
                    Contribuir información
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionalScreen;