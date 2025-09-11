// src/pages/NutritionalScreen.jsx - VERSIÓN ACTUALIZADA PARA NUEVA ESTRUCTURA FIREBASE
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../functions/src/firebaseConfig';
import '../styles/NutricionalStyles.css';
import '../styles/ComparisonStyles.css';
import { 
  Search, Filter, Plus, Check, X, Clock, AlertCircle, TrendingUp, 
  Award, Users, BarChart3, Info, ChevronDown, Eye, Edit2, 
  CheckCircle, XCircle, Upload, Save, Heart, Share2, 
  Bookmark, Settings, Star, ThumbsUp, Package, AlertTriangle
} from 'lucide-react';

// Importar servicios actualizados
import {
  getNutritionalProducts,
  searchNutritionalProducts,
  addNutritionalProduct,
  getCategories,
  calculateNutritionalScore
} from '../functions/services/nutritionalService';

// Importar componentes
import ProductComparison from '../components/ProductComparison';

const NutritionalScreen = () => {
  // Estado de autenticación
  const [user, loading, error] = useAuthState(auth);
  
  // Estados principales
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    withNutrition: 0,
    categories: 0
  });
  
  // Estados de modales
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  
  // Estados de funcionalidad
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [userRole, setUserRole] = useState('user'); // Simulado para demo

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Cargando datos iniciales...');
      
      // Cargar productos y categorías en paralelo
      const [productsData, categoriesData] = await Promise.all([
        getNutritionalProducts(20, filterCategory !== 'todos' ? filterCategory : null),
        getCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      
      // Calcular estadísticas
      const statsData = {
        totalProducts: productsData.length,
        withNutrition: productsData.filter(p => p.hasNutritionalInfo).length,
        categories: categoriesData.length
      };
      setStats(statsData);
      
      console.log('✅ Datos cargados:', {
        productos: productsData.length,
        categorias: categoriesData.length,
        conInfo: statsData.withNutrition
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
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

  // Filtrar por categoría
  const handleCategoryFilter = async (categoria) => {
    setFilterCategory(categoria);
    setIsLoading(true);
    
    try {
      const results = await getNutritionalProducts(20, categoria !== 'todos' ? categoria : null);
      setProducts(results);
    } catch (error) {
      console.error('Error filtrando por categoría:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar producto agregado desde modal
  const handleProductAdded = (newProduct) => {
    setProducts(prevProducts => [newProduct, ...prevProducts]);
    setStats(prevStats => ({
      ...prevStats,
      totalProducts: prevStats.totalProducts + 1,
      withNutrition: prevStats.withNutrition + 1
    }));
    console.log('✅ Producto agregado a la lista:', newProduct.nombre);
  };

  // Comparar productos
  const handleCompare = () => {
    if (selectedProducts.length >= 2) {
      setShowComparisonModal(true);
    }
  };

  // Toggle selección de productos
  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else if (selectedProducts.length < 4) { // Máximo 4 productos
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      alert('Máximo 4 productos para comparar');
    }
  };

  // Remover producto de comparación
  const removeFromComparison = (productId) => {
    setSelectedProducts(selectedProducts.filter(id => id !== productId));
  };

  // Obtener color según score
  const getScoreColor = (score) => {
    if (score >= 8) return 'nutri-score-high';
    if (score >= 6) return 'nutri-score-medium';
    return 'nutri-score-low';
  };

  // Filtrar productos según criterios
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.marca?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCategory === 'todos' || 
                          product.categoria === filterCategory ||
                          (filterCategory === 'con-info' && product.hasNutritionalInfo) ||
                          (filterCategory === 'sin-info' && !product.hasNutritionalInfo);
    
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
      {/* Header Estadísticas */}
      <div className="nutri-header-enhanced">
        <div className="nutri-header-content">
          <div className="nutri-header-main">
            <h1>Compare & Nourish</h1>
            <p className="nutri-header-subtitle">
              Decisiones inteligentes para una vida más saludable
            </p>
            
            {user && (
              <div className="nutri-user-welcome">
                <span>¡Hola, {user.displayName || 'Usuario'}!</span>
                <div className="nutri-user-points">
                  <Award className="w-4 h-4" />
                  <span>0 puntos</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="nutri-stats-grid-enhanced">
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <Package className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">{stats.totalProducts}</div>
                <div className="nutri-stat-label">Productos totales</div>
              </div>
            </div>
            
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <BarChart3 className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">{stats.withNutrition}</div>
                <div className="nutri-stat-label">Con información nutricional</div>
              </div>
            </div>
            
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <Filter className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">{stats.categories}</div>
                <div className="nutri-stat-label">Categorías</div>
              </div>
            </div>
            
            <div className="nutri-stat-card-modern">
              <div className="nutri-stat-icon-container">
                <Star className="nutri-stat-icon" />
              </div>
              <div className="nutri-stat-content">
                <div className="nutri-stat-value">
                  {Math.round((stats.withNutrition / Math.max(stats.totalProducts, 1)) * 100)}%
                </div>
                <div className="nutri-stat-label">Cobertura nutricional</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
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
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                <option value="todos">Todas las categorías</option>
                <option value="con-info">Con información nutricional</option>
                <option value="sin-info">Sin información nutricional</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Botón Comparar */}
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

      {/* Grid de productos */}
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
              </div>
              
              <div className="nutri-product-body-enhanced">
                <div className="nutri-product-image-container">
                  <img
                    src="/api/placeholder/150/150"
                    alt={product.nombre}
                    className="nutri-product-image-modern"
                  />
                </div>
                
                <div className="nutri-product-info">
                  <h3 className="nutri-product-name-modern">{product.nombre}</h3>
                  <p className="nutri-product-meta-modern">
                    {product.marca} • {product.presentacion}
                  </p>
                  <p className="nutri-product-category">
                    {product.categoria}
                  </p>
                </div>
                
                {product.hasNutritionalInfo && product.nutritionalData ? (
                  <div className="nutri-info-section-enhanced">
                    {/* Score Nutricional */}
                    <div className={`nutri-score-badge-modern ${getScoreColor(product.nutritionalData.score || 0)}`}>
                      <div className="nutri-score-icon">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="nutri-score-text">
                        {(product.nutritionalData.score || 0).toFixed(1)}/10
                      </span>
                    </div>
                    
                    {/* Grid nutricional */}
                    <div className="nutri-data-grid-modern">
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Calorías</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData.calories} kcal
                        </span>
                      </div>
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Proteínas</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData.proteins}g
                        </span>
                      </div>
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Carbos</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData.carbs}g
                        </span>
                      </div>
                      <div className="nutri-data-item-modern">
                        <span className="nutri-data-label-modern">Grasas</span>
                        <span className="nutri-data-value-modern">
                          {product.nutritionalData.fats}g
                        </span>
                      </div>
                    </div>
                    
                    {/* Tags especiales */}
                    <div className="nutri-special-tags">
                      {product.nutritionalData.isVegan && (
                        <span className="nutri-tag nutri-tag-green">Vegano</span>
                      )}
                      {product.nutritionalData.isGlutenFree && (
                        <span className="nutri-tag nutri-tag-blue">Sin Gluten</span>
                      )}
                      {product.nutritionalData.isOrganic && (
                        <span className="nutri-tag nutri-tag-purple">Orgánico</span>
                      )}
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
                      onClick={() => alert('Funcionalidad próximamente')}
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

      {/* Modal de Comparación */}
      {showComparisonModal && selectedProducts.length >= 2 && (
        <div className="nutri-modal-overlay-modern">
          <div className="nutri-modal-modern nutri-modal-wide">
            <ProductComparison
              selectedProducts={selectedProducts}
              products={products}
              onClose={() => setShowComparisonModal(false)}
              onRemoveProduct={removeFromComparison}
            />
          </div>
        </div>
      )}

      {/* Modal de Detalles del Producto */}
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
              {selectedProduct.hasNutritionalInfo && selectedProduct.nutritionalData ? (
                <div className="nutri-detail-content">
                  <div className="nutri-detail-score-section">
                    <div className={`nutri-score-badge-large ${getScoreColor(selectedProduct.nutritionalData.score || 0)}`}>
                      <Award className="w-8 h-8" />
                      <span>Score: {(selectedProduct.nutritionalData.score || 0).toFixed(1)}/10</span>
                    </div>
                  </div>
                  
                  <div className="nutri-detail-grid-modern">
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData.calories}</span>
                      <span className="nutri-detail-label">Calorías (kcal)</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData.proteins}g</span>
                      <span className="nutri-detail-label">Proteínas</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData.carbs}g</span>
                      <span className="nutri-detail-label">Carbohidratos</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData.fats}g</span>
                      <span className="nutri-detail-label">Grasas</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData.fiber || 0}g</span>
                      <span className="nutri-detail-label">Fibra</span>
                    </div>
                    <div className="nutri-detail-card-modern">
                      <span className="nutri-detail-value">{selectedProduct.nutritionalData.sodium || 0}mg</span>
                      <span className="nutri-detail-label">Sodio</span>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {selectedProduct.nutritionalData.ingredients && selectedProduct.nutritionalData.ingredients.length > 0 && (
                    <div className="nutri-ingredients-section">
                      <h3 className="text-lg font-semibold mb-3">Ingredientes</h3>
                      <div className="nutri-ingredients-list">
                        {selectedProduct.nutritionalData.ingredients.slice(0, 10).map((ingredient, index) => (
                          <span key={index} className="nutri-ingredient-tag">
                            {ingredient}
                          </span>
                        ))}
                        {selectedProduct.nutritionalData.ingredients.length > 10 && (
                          <span className="nutri-ingredient-more">
                            +{selectedProduct.nutritionalData.ingredients.length - 10} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alertas y características */}
                  <div className="nutri-alerts-section">
                    {selectedProduct.nutritionalData.allergens && selectedProduct.nutritionalData.allergens.length > 0 && (
                      <div className="nutri-alert nutri-alert-warning">
                        <AlertTriangle className="w-5 h-5" />
                        <div>
                          <strong>Contiene alérgenos:</strong> {selectedProduct.nutritionalData.allergens.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    <div className="nutri-characteristics">
                      {selectedProduct.nutritionalData.isVegan && (
                        <div className="nutri-characteristic nutri-characteristic-positive">
                          <CheckCircle className="w-4 h-4" />
                          <span>Apto para veganos</span>
                        </div>
                      )}
                      {selectedProduct.nutritionalData.isGlutenFree && (
                        <div className="nutri-characteristic nutri-characteristic-positive">
                          <CheckCircle className="w-4 h-4" />
                          <span>Sin gluten</span>
                        </div>
                      )}
                      {selectedProduct.nutritionalData.isOrganic && (
                        <div className="nutri-characteristic nutri-characteristic-positive">
                          <CheckCircle className="w-4 h-4" />
                          <span>Orgánico</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadatos */}
                  <div className="nutri-metadata-section">
                    <div className="nutri-metadata-grid">
                      <div className="nutri-metadata-item">
                        <span className="nutri-metadata-label">Fuente:</span>
                        <span className="nutri-metadata-value">{selectedProduct.nutritionalData.source || 'No especificada'}</span>
                      </div>
                      <div className="nutri-metadata-item">
                        <span className="nutri-metadata-label">Verificado:</span>
                        <span className={`nutri-metadata-value ${selectedProduct.nutritionalData.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {selectedProduct.nutritionalData.verified ? 'Sí' : 'Pendiente'}
                        </span>
                      </div>
                      <div className="nutri-metadata-item">
                        <span className="nutri-metadata-label">Confianza:</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(selectedProduct.nutritionalData.confidence || 0) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">{Math.round((selectedProduct.nutritionalData.confidence || 0) * 100)}%</span>
                        </div>
                      </div>
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
                      alert('Funcionalidad de contribución próximamente');
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