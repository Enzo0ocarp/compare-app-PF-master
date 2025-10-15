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
  Bookmark, Settings, Star, ThumbsUp, Package, AlertTriangle, Shield
} from 'lucide-react';

// Importar servicios actualizados
import {
  getNutritionalProductsPaginated,
  searchNutritionalProducts,
  addNutritionalProduct,
  getCategories,
  calculateNutritionalScore
} from '../functions/services/nutritionalService';

import { isUserAdmin } from '../functions/services/adminService';
import { uploadProductImage, validateImageFile } from '../functions/services/imageService';
import AdminPanel from '../components/AdminPanel';
import ContributeNutritionalData from '../components/ContributeNutritionalData';
// Importar componentes
import ProductComparison from '../components/ProductComparison';

const NutritionalScreen = () => {
  // Estado de autenticación
  const [user, loading, error] = useAuthState(auth);

  // Estados principales
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [productToContribute, setProductToContribute] = useState(null);
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

  // Dentro del componente NutritionalScreen, después de los estados existentes:

  // Estados de administración
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Estados de paginación
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Estados de carga de imagen
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedProductForImage, setSelectedProductForImage] = useState(null);
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

      // Cargar productos con paginación
      const { products: productsData, lastVisible, hasMore: moreAvailable } = await getNutritionalProductsPaginated(
        20,
        null,
        filterCategory !== 'todos' ? filterCategory : null
      );

      const categoriesData = await getCategories();

      setProducts(productsData);
      setLastDoc(lastVisible);
      setHasMore(moreAvailable);
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
        hayMas: moreAvailable
      });

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const { products: newProducts, lastVisible, hasMore: moreAvailable } = await getNutritionalProductsPaginated(
        20,
        lastDoc,
        filterCategory !== 'todos' ? filterCategory : null
      );

      setProducts(prev => [...prev, ...newProducts]);
      setLastDoc(lastVisible);
      setHasMore(moreAvailable);

      console.log(`✅ Cargados ${newProducts.length} productos más`);

    } catch (error) {
      console.error('Error cargando más productos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // useEffect para verificar si el usuario es admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
        console.log(`👤 Usuario es admin: ${adminStatus}`);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleImageUpload = async (productId, file) => {
    if (!user) {
      alert('Debes iniciar sesión para subir imágenes');
      return;
    }

    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await uploadProductImage(file, productId, user.uid);

      // Actualizar producto en el estado local
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, imageUrl, imageStatus: 'pending' }
          : p
      ));

      alert('✅ Imagen subida exitosamente. Pendiente de aprobación por administrador.');
      setSelectedProductForImage(null);

    } catch (error) {
      alert('Error subiendo imagen: ' + error.message);
    } finally {
      setUploadingImage(false);
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
      const { products: results } = await getNutritionalProductsPaginated(
        20,
        null,
        categoria !== 'todos' ? categoria : null
      );
      setProducts(results);
      setLastDoc(null); // Resetear paginación
      setHasMore(true);  // Resetear estado hasMore
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
      {/* Panel de Admin */}
      {isAdmin && showAdminPanel && (
        <AdminPanel currentUser={user} />
      )}

      {/* Botón flotante para mostrar panel de admin */}
      {/* Botón flotante para mostrar panel de admin */}
      {isAdmin && (
        <button
          onClick={() => {
            console.log('Click en botón admin, estado actual:', showAdminPanel);
            setShowAdminPanel(prev => !prev);
          }}
          className="nutri-admin-toggle-btn"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #f39c12, #e67e22)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: showAdminPanel
              ? '0 8px 30px rgba(243, 156, 18, 0.6)'
              : '0 4px 20px rgba(243, 156, 18, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: showAdminPanel ? 'scale(1.1)' : 'scale(1)'
          }}
          title={showAdminPanel ? "Ocultar panel admin" : "Mostrar panel admin"}
        >
          <Shield
            className="w-6 h-6"
            style={{
              filter: showAdminPanel ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none'
            }}
          />
        </button>
      )}

      {/* Header Estadísticas */}
      <div className="nutri-header-enhanced">
        <div className="nutri-header-content">
          <div className="nutri-header-main">
            <h1>Compare & Nourish</h1>
            <p className="nutri-header-subtitle">
              Decisiones inteligentes para una vida más saludable
            </p>
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

            {/* Cambiar rol (demo) - REMOVER EN PRODUCCIÓN */}
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
                      onClick={() => {
                        if (user) {
                          setProductToContribute(product);
                          setShowContributeModal(true);
                        } else {
                          alert('Debes iniciar sesión para contribuir datos');
                        }
                      }}
                      className="nutri-contribute-btn-modern"
                      disabled={!user}
                    >
                      <Plus className="w-4 h-4" />
                      {user ? 'Contribuir datos' : 'Inicia sesión para contribuir'}
                    </button>
                  </div>
                )}

                {/* Botón para cargar imagen */}
                {user && !product.imageUrl && (
                  <div className="nutri-upload-image-section" style={{ marginTop: '1rem' }}>
                    <label className="nutri-upload-btn">
                      <Upload className="w-4 h-4" />
                      <span>Subir imagen</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(product.id, e.target.files[0]);
                          }
                        }}
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                )}

                {/* Estado de imagen pendiente */}
                {product.imageStatus === 'pending' && (
                  <div className="nutri-image-status-badge" style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#fff3cd',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#856404',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Clock className="w-4 h-4" />
                    <span>Imagen pendiente de aprobación</span>
                  </div>
                )}

                {/* Estado de imagen rechazada */}
                {product.imageStatus === 'rejected' && (
                  <div className="nutri-image-status-badge" style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    background: '#f8d7da',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: '#721c24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <XCircle className="w-4 h-4" />
                    <span>Imagen rechazada: {product.imageRejectionReason}</span>
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

      {/* Botón Cargar Más */}
      {hasMore && !isLoading && filteredProducts.length > 0 && (
        <div className="nutri-load-more-container" style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '2rem 0',
          marginTop: '2rem'
        }}>
          <button
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className="nutri-load-more-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              background: loadingMore
                ? 'linear-gradient(135deg, #95a5a6, #7f8c8d)'
                : 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!loadingMore) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
            }}
          >
            {loadingMore ? (
              <>
                <div className="nutri-loading-spinner-small"></div>
                <span>Cargando más productos...</span>
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                <span>Cargar más productos</span>
                <ChevronDown className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Mensaje de fin de productos */}
      {!hasMore && products.length > 0 && !isLoading && (
        <div className="nutri-end-message" style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#7f8c8d',
          fontSize: '0.95rem'
        }}>
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" style={{ color: '#27ae60' }} />
          <p className="font-semibold" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            ¡Has visto todos los productos disponibles!
          </p>
          <p className="text-sm mt-2" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Total de productos cargados: {products.length}
          </p>
        </div>
      )}

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
                          <div className="flex-1 bg-gray-200 rounded-full h-2" style={{ flex: 1, background: '#e5e7eb', borderRadius: '9999px', height: '0.5rem' }}>
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(selectedProduct.nutritionalData.confidence || 0) * 100}%`,
                                background: '#3b82f6',
                                height: '0.5rem',
                                borderRadius: '9999px'
                              }}
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

      {/* Modal de Contribución de Datos */}
      {showContributeModal && productToContribute && (
        <ContributeNutritionalData
          product={productToContribute}
          currentUser={user}
          onClose={() => {
            setShowContributeModal(false);
            setProductToContribute(null);
          }}
          onSuccess={() => {
            loadInitialData(); // Recargar productos
          }}
        />
      )}
    </div>
  );
};

export default NutritionalScreen;