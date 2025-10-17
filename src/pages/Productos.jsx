/**
 * @fileoverview Productos - Compare & Nourish v6.0 - ULTRA OPTIMIZADO
 * @description Infinite scroll + Algolia + Virtualización + Service Worker + Lazy Loading
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../functions/src/firebaseConfig';
import ProductCard from '../components/ProductCard';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

// ✅ IMPORTS CORREGIDOS
import { 
  getProductsPaginated,
  searchProducts,
  getAvailableBrands,
  getProductsByCategory,
  formatProductForDisplay,
  testConnection,
  addReview,
  CATEGORY_CONFIG
} from '../functions/services/firebaseProducts';

import { 
  initAlgolia, 
  searchWithAlgolia, 
  isAlgoliaAvailable 
} from '../functions/services/algoliaSearch';

import '../styles/ProductosStyles.css';

function Productos() {
  const [user] = useAuthState(auth);
  const toastRef = useRef(null);
  const [algoliaEnabled, setAlgoliaEnabled] = useState(false);

  // Estado de productos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Estados de opciones
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Estados de favoritos
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  // Estados para reseñas
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 0, comment: '', title: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Estados para comparación
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedProductForComparison, setSelectedProductForComparison] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Contador total
  const [totalProductsCount] = useState(300000);

  // Service Worker update notification
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  /**
   * INFINITE SCROLL HOOK
   */
  const lastProductRef = useInfiniteScroll(
    useCallback(() => {
      if (!activeSearch) {
        loadMoreProducts();
      }
    }, [activeSearch]),
    hasMore,
    loading
  );

  /**
   * INICIALIZACIÓN
   */
  useEffect(() => {
    // Inicializar Algolia
    const algoliaReady = initAlgolia();
    setAlgoliaEnabled(algoliaReady);

    // Escuchar updates del Service Worker
    window.addEventListener('swUpdate', handleServiceWorkerUpdate);

    return () => {
      window.removeEventListener('swUpdate', handleServiceWorkerUpdate);
    };
  }, []);

  const handleServiceWorkerUpdate = () => {
    setShowUpdateBanner(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  /**
   * CARGA INICIAL
   */
  const loadInitialProducts = useCallback(async () => {
    setLoading(true);
    setInitialLoad(true);
    try {
      console.log('🔄 Cargando primera página de productos...');
      
      const result = await getProductsPaginated({ 
        pageSize: 24,
        filters: {
          marca: selectedBrand,
          categoria: selectedCategory
        }
      });

      setProducts(result.products);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      
      console.log(`✅ Carga inicial: ${result.products.length} productos`);
      
    } catch (error) {
      console.error('❌ Error cargando productos iniciales:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de carga',
        detail: 'No se pudieron cargar los productos',
        life: 5000
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [selectedBrand, selectedCategory]);

  /**
   * CARGAR MÁS PRODUCTOS
   */
  const loadMoreProducts = async () => {
    if (loading || !hasMore || activeSearch) return;
    
    setLoading(true);
    try {
      console.log('📄 Cargando siguiente página...');
      
      const result = await getProductsPaginated({ 
        pageSize: 24,
        lastDoc: lastDoc,
        filters: {
          marca: selectedBrand,
          categoria: selectedCategory
        }
      });

      setProducts(prev => [...prev, ...result.products]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      
      console.log(`✅ ${result.products.length} productos más cargados`);
      
    } catch (error) {
      console.error('❌ Error cargando más productos:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar más productos',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * BÚSQUEDA INTELIGENTE (Algolia o Firestore)
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setActiveSearch('');
      loadInitialProducts();
      return;
    }

    setLoading(true);
    setActiveSearch(searchTerm);
    
    try {
      console.log('🔍 Buscando:', searchTerm);
      
      let result;
      
      // Usar Algolia si está disponible
      if (algoliaEnabled) {
        console.log('🎯 Usando Algolia para búsqueda');
        result = await searchWithAlgolia(searchTerm, {
          marca: selectedBrand,
          categoria: selectedCategory
        });
      } else {
        console.log('📝 Usando búsqueda básica Firestore');
        result = await searchProducts(searchTerm, 50);
      }
      
      setProducts(result.products);
      setLastDoc(null);
      setHasMore(false);
      
      if (result.products.length === 0) {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Sin resultados',
          detail: `No se encontraron productos para "${searchTerm}"`,
          life: 3000
        });
      } else {
        toastRef.current?.show({
          severity: 'success',
          summary: 'Búsqueda completada',
          detail: `${result.totalResults || result.products.length} productos encontrados`,
          life: 3000
        });
      }
      
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al buscar productos',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    loadInitialProducts();
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.value);
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.value);
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
  };

  /**
   * CARGAR MARCAS
   */
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandList = await getAvailableBrands();
        setBrands([
          { label: 'Todas las marcas', value: null },
          ...brandList.map(brand => ({ label: brand, value: brand }))
        ]);
      } catch (error) {
        console.error('Error cargando marcas:', error);
      }
    };

    loadBrands();
  }, []);

  /**
   * CONFIGURAR CATEGORÍAS
   */
  useEffect(() => {
    const categoryOptions = Object.keys(CATEGORY_CONFIG).map(cat => ({
      label: `${CATEGORY_CONFIG[cat]?.icon || '📦'} ${cat}`,
      value: cat
    }));
    
    setCategories([
      { label: 'Todas las categorías', value: null },
      ...categoryOptions
    ]);
  }, []);

  /**
   * CARGA INICIAL
   */
  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  /**
   * RECARGAR cuando cambian filtros
   */
  useEffect(() => {
    if (!initialLoad) {
      loadInitialProducts();
    }
  }, [selectedBrand, selectedCategory]);

  /**
   * RESEÑAS
   */
  const openReviewModal = (product) => {
    if (!user) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Inicia sesión',
        detail: 'Necesitas iniciar sesión para escribir una reseña',
        life: 3000
      });
      return;
    }
    
    setSelectedProductForReview(product);
    setReviewData({ rating: 0, comment: '', title: '' });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.rating || !reviewData.comment.trim()) {
      toastRef.current?.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Por favor completa la calificación y comentario',
        life: 3000
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview({
        productId: selectedProductForReview.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        title: reviewData.title
      }, user);
      
      toastRef.current?.show({
        severity: 'success',
        summary: '¡Reseña enviada!',
        detail: 'Tu reseña ha sido publicada correctamente',
        life: 3000
      });
      
      setShowReviewModal(false);
      setSelectedProductForReview(null);
      setReviewData({ rating: 0, comment: '', title: '' });
      
    } catch (error) {
      console.error('Error enviando reseña:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo enviar la reseña',
        life: 3000
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  /**
   * COMPARACIÓN
   */
  const openComparisonModal = async (product) => {
    setSelectedProductForComparison(product);
    setShowComparisonModal(true);
    setLoadingComparison(true);

    try {
      const sameCategory = await getProductsByCategory(product.categoria, 10);
      const filtered = sameCategory.filter(p => p.id !== product.id);
      
      setCategoryProducts(filtered);
      console.log(`✅ ${filtered.length} productos similares encontrados`);
      
    } catch (error) {
      console.error('❌ Error cargando comparación:', error);
      setCategoryProducts([]);
    } finally {
      setLoadingComparison(false);
    }
  };

  /**
   * FAVORITOS
   */
  const toggleFavorite = (productId) => {
    setFavoriteProducts(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      try {
        localStorage.setItem('compareNourish_favorites', JSON.stringify(updated));
      } catch (error) {
        console.error('Error guardando favoritos:', error);
      }
      
      return updated;
    });
  };

  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('compareNourish_favorites');
      if (storedFavs) {
        setFavoriteProducts(JSON.parse(storedFavs));
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testConnection().then(connected => {
        console.log(connected ? '✅ Firestore conectado' : '❌ Firestore desconectado');
      });
    }
  }, []);

  // ===== RENDER =====
  
  return (
    <div className="global-utilities productos-page">
      <Toast ref={toastRef} />
      
      {/* Banner de actualización */}
      {showUpdateBanner && (
        <div className="update-banner">
          <span>🎉 Nueva versión disponible</span>
          <Button 
            label="Actualizar" 
            size="small" 
            onClick={handleReload}
            className="p-button-sm"
          />
        </div>
      )}
      
      <div className="container">
        
        <div className="products-header">
          <div className="products-title-section">
            <h1>🛍️ Compare & Nourish</h1>
            <p><strong>Decidí mejor, comprá inteligente</strong></p>
            {algoliaEnabled && (
              <small style={{ color: '#4caf50' }}>⚡ Búsqueda potenciada por Algolia</small>
            )}
          </div>
          
          <div className="products-stats">
            <div className="stat-item">
              <i className="pi pi-shopping-cart"></i>
              <span>{totalProductsCount.toLocaleString()}+ productos</span>
            </div>
            <div className="stat-item">
              <i className="pi pi-filter"></i>
              <span>{products.length} mostrados</span>
            </div>
            <div className="stat-item">
              <i className="pi pi-heart"></i>
              <span>{favoriteProducts.length} favoritos</span>
            </div>
          </div>
        </div>

        <Card className="explanation-card">
          <h4>💡 Comparación inteligente de precios</h4>
          <p>
            Selecciona cualquier producto para ver <strong>automáticamente</strong> los mejores precios 
            de productos similares. Scroll infinito activado para navegación fluida.
          </p>
        </Card>

        <Card className="search-filters-card">
          <div className="search-container">
            <div className="p-inputgroup search-group">
              <InputText
                placeholder="Buscar productos... ej: aceite, coca cola, yogur"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input-modern"
              />
              <Button 
                icon="pi pi-search" 
                onClick={handleSearch}
                className="p-button-primary search-btn"
                disabled={!searchTerm.trim()}
              />
              {searchTerm && (
                <Button 
                  icon="pi pi-times" 
                  onClick={clearSearch}
                  className="p-button-secondary clear-btn"
                />
              )}
            </div>
          </div>

          <div className="filters-row-modern">
            <Dropdown
              value={selectedBrand}
              options={brands}
              onChange={handleBrandChange}
              placeholder="🏷️ Filtrar por marca"
              className="filter-dropdown-modern"
              showClear
              filter
            />
            
            <Dropdown
              value={selectedCategory}
              options={categories}
              onChange={handleCategoryChange}
              placeholder="📂 Filtrar por categoría"
              className="filter-dropdown-modern"
              showClear
              filter
            />
          </div>
        </Card>

        {(activeSearch || selectedBrand || selectedCategory) && (
          <div className="active-filters-modern">
            {activeSearch && (
              <Chip label={`🔍 "${activeSearch}" (${products.length})`}
                removable 
                onRemove={clearSearch}
                className="filter-chip-modern search-chip"
              />
            )}
            {selectedBrand && (
              <Chip 
                label={`🏷️ ${selectedBrand}`}
                removable 
                onRemove={() => handleBrandChange({ value: null })}
                className="filter-chip-modern brand-chip"
              />
            )}
            {selectedCategory && (
              <Chip 
                label={`📂 ${selectedCategory}`}
                removable 
                onRemove={() => handleCategoryChange({ value: null })}
                className="filter-chip-modern category-chip"
              />
            )}
          </div>
        )}

        {/* Grid de productos */}
        {initialLoad ? (
          <div className="loading-container-modern">
            <Card className="loading-card">
              <div className="loading-content-modern">
                <ProgressSpinner style={{ width: '60px', height: '60px' }} />
                <h3>🔍 Cargando productos optimizados...</h3>
                <p>Cargando primera página (24 productos)...</p>
              </div>
            </Card>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="products-grid-modern">
              {products.map((product, index) => {
                const formattedProduct = formatProductForDisplay(product);
                const isFavorite = favoriteProducts.includes(product.id);
                const isLastItem = index === products.length - 1;
                
                return (
                  <div 
                    key={product.id || index} 
                    className="product-wrapper-modern"
                    ref={isLastItem ? lastProductRef : null}
                  >
                    
                    <div className="product-actions">
                      <Button
                        icon={isFavorite ? "pi pi-heart-fill" : "pi pi-heart"}
                        onClick={() => toggleFavorite(product.id)}
                        className={`action-btn ${isFavorite ? 'favorite-active' : 'favorite-inactive'}`}
                        tooltip={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      />
                      
                      <Button
                        icon="pi pi-chart-line"
                        onClick={() => openComparisonModal(product)}
                        className="action-btn comparison-btn"
                        tooltip="Comparar precios en categoría"
                      />
                      
                      <Button
                        icon="pi pi-star"
                        onClick={() => openReviewModal(product)}
                        className="action-btn review-btn"
                        tooltip="Escribir reseña"
                      />
                    </div>
                    
                    <div 
                      className="category-badge"
                      style={{ backgroundColor: product.categoryColor }}
                    >
                      {product.categoryIcon} {product.categoria}
                    </div>
                    
                    <div className="store-badge">
                      📍 {product.sucursal}
                    </div>
                    
                    <ProductCard 
                      product={formattedProduct}
                      onCompare={() => openComparisonModal(product)}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Indicador de carga al hacer scroll */}
            {loading && hasMore && !activeSearch && (
              <div className="infinite-scroll-loader">
                <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                <p>Cargando más productos...</p>
              </div>
            )}

            {/* Mensaje de fin */}
            {!hasMore && !activeSearch && products.length > 0 && (
              <div className="end-of-results">
                <i className="pi pi-check-circle"></i>
                <p>Has visto todos los productos disponibles</p>
              </div>
            )}
          </>
        ) : (
          <Card className="no-results-card">
            <div className="no-results-modern">
              <div className="no-results-icon">
                {activeSearch || selectedBrand || selectedCategory ? '🔍' : '📦'}
              </div>
              <h3>No se encontraron productos</h3>
              <p>
                {activeSearch 
                  ? `No encontramos productos que coincidan con "${activeSearch}"`
                  : 'Intenta ajustar los filtros para ver más productos'
                }
              </p>
              
              <div className="no-results-actions">
                <Button
                  label="Limpiar filtros"
                  icon="pi pi-times"
                  onClick={() => {
                    clearSearch();
                    setSelectedBrand(null);
                    setSelectedCategory(null);
                  }}
                  className="p-button-outlined"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Modal de comparación */}
        <Dialog 
          header={
            <div className="flex items-center gap-sm">
              <span style={{ fontSize: '1.5rem' }}>
                {selectedProductForComparison?.categoryIcon}
              </span>
              <span>Mejores precios en {selectedProductForComparison?.categoria}</span>
            </div>
          }
          visible={showComparisonModal} 
          style={{ width: '95vw', maxWidth: '800px' }} 
          onHide={() => setShowComparisonModal(false)}
          className="comparison-modal"
        >
          <div className="comparison-content">
            
            {selectedProductForComparison && (
              <div className="selected-product-info">
                <h4>📍 Producto seleccionado:</h4>
                <div className="product-info-card">
                  <div className="product-details">
                    <h5>{selectedProductForComparison.nombre}</h5>
                    <p><strong>Marca:</strong> {selectedProductForComparison.marca}</p>
                    <p><strong>Precio:</strong> ${selectedProductForComparison.precio.toLocaleString()}</p>
                    <p><strong>Sucursal:</strong> {selectedProductForComparison.sucursal}</p>
                    {selectedProductForComparison.presentacion && (
                      <p><strong>Presentación:</strong> {selectedProductForComparison.presentacion}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="category-comparison">
              <h4>💰 Mejores precios en la categoría:</h4>
              
              {loadingComparison ? (
                <div className="loading-comparison">
                  <ProgressSpinner size="small" />
                  <span>Buscando mejores precios...</span>
                </div>
              ) : categoryProducts.length > 0 ? (
                <div className="comparison-products-list">
                  {categoryProducts.map((product, index) => (
                    <div key={product.id} className="comparison-product-item">
                      <div className="rank-badge">
                        #{index + 1}
                      </div>
                      <div className="product-comparison-info">
                        <div className="product-name">
                          <strong>{product.nombre}</strong>
                          <span className="brand-name">{product.marca}</span>
                          {product.presentacion && (
                            <span className="brand-name">{product.presentacion}</span>
                          )}
                        </div>
                        <div className="price-comparison">
                          <span className="price">${product.precio.toLocaleString()}</span>
                          <span className="store">en {product.sucursal}</span>
                        </div>
                        {index === 0 && (
                          <div className="best-price-badge">
                            🏆 MEJOR PRECIO
                          </div>
                        )}
                        {selectedProductForComparison && product.precio < selectedProductForComparison.precio && (
                          <div className="savings-info">
                            💰 Ahorrás ${(selectedProductForComparison.precio - product.precio).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-comparison-products">
                  <p>No se encontraron otros productos en esta categoría para comparar.</p>
                </div>
              )}
            </div>

            {categoryProducts.length > 0 && selectedProductForComparison && (
              <div className="comparison-summary">
                <h4>📊 Resumen de comparación:</h4>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="label">Productos comparados:</span>
                    <span className="value">{categoryProducts.length + 1}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Mejor precio:</span>
                    <span className="value">${Math.min(...categoryProducts.map(p => p.precio), selectedProductForComparison.precio).toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Precio más alto:</span>
                    <span className="value">${Math.max(...categoryProducts.map(p => p.precio), selectedProductForComparison.precio).toLocaleString()}</span>
                  </div>
                  {categoryProducts.length > 0 && (
                    <div className="stat">
                      <span className="label">Ahorro máximo posible:</span>
                      <span className="value savings">
                        ${(Math.max(...categoryProducts.map(p => p.precio), selectedProductForComparison.precio) - 
                           Math.min(...categoryProducts.map(p => p.precio), selectedProductForComparison.precio)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog>

        {/* Modal de reseña */}
        <Dialog 
          header={
            <div className="flex items-center gap-sm">
              <i className="pi pi-star text-warning"></i>
              <span>Reseñar: {selectedProductForReview?.nombre}</span>
            </div>
          }
          visible={showReviewModal} 
          style={{ width: '90vw', maxWidth: '500px' }} 
          onHide={() => setShowReviewModal(false)}
          footer={
            <div className="review-modal-footer">
              <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                onClick={() => setShowReviewModal(false)} 
                className="p-button-text" 
              />
              <Button 
                label="Enviar reseña" 
                icon="pi pi-check" 
                onClick={submitReview} 
                className="p-button-primary"
                loading={submittingReview}
                disabled={!reviewData.rating || !reviewData.comment.trim()}
              />
            </div>
          }
        >
          <div className="review-form">
            
            {selectedProductForReview && (
              <div className="product-review-info">
                <div className="flex items-center gap-sm mb-md">
                  <span style={{ fontSize: '1.5rem' }}>
                    {selectedProductForReview.categoryIcon}
                  </span>
                  <div>
                    <div className="font-medium">{selectedProductForReview.marca}</div>
                    <div className="text-sm text-muted">{selectedProductForReview.categoria}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="review-field">
              <label>Calificación *</label>
              <Rating 
                value={reviewData.rating} 
                onChange={(e) => setReviewData({...reviewData, rating: e.value})} 
                stars={5}
                cancel={false}
              />
            </div>
            
            <div className="review-field">
              <label>Título de la reseña</label>
              <InputText
                value={reviewData.title}
                onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                placeholder="Ej: Excelente calidad-precio"
              />
            </div>
            
            <div className="review-field">
              <label>Comentario *</label>
              <InputTextarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                rows={4}
                placeholder="Escribe tu experiencia con este producto..."
              />
            </div>
            
            <div className="review-info">
              <i className="pi pi-info-circle"></i>
              <span>Tu reseña ayudará a otros usuarios a tomar mejores decisiones</span>
            </div>
          </div>
        </Dialog>

        {/* Sección de ayuda */}
        <Card className="help-section-modern">
          <div className="help-content-modern">
            <h4>🤔 ¿Cómo usar Compare & Nourish?</h4>
            <div className="help-grid">
              <div className="help-item">
                <i className="pi pi-search help-icon"></i>
                <div>
                  <strong>Buscar Productos</strong>
                  <p>Encuentra productos por nombre o marca con búsqueda instantánea</p>
                </div>
              </div>
              <div className="help-item">
                <i className="pi pi-chart-line help-icon"></i>
                <div>
                  <strong>Comparar Precios</strong>
                  <p>Compara automáticamente precios en la misma categoría</p>
                </div>
              </div>
              <div className="help-item">
                <i className="pi pi-star help-icon"></i>
                <div>
                  <strong>Escribir Reseñas</strong>
                  <p>Comparte tu experiencia para ayudar a otros usuarios</p>
                </div>
              </div>
              <div className="help-item">
                <i className="pi pi-heart help-icon"></i>
                <div>
                  <strong>Guardar Favoritos</strong>
                  <p>Marca productos como favoritos para encontrarlos después</p>
                </div>
              </div>
              <div className="help-item">
                <i className="pi pi-filter help-icon"></i>
                <div>
                  <strong>Filtrar Resultados</strong>
                  <p>Usa filtros de marca y categoría para resultados precisos</p>
                </div>
              </div>
              <div className="help-item">
                <i className="pi pi-arrow-down help-icon"></i>
                <div>
                  <strong>Scroll Infinito</strong>
                  <p>Productos se cargan automáticamente mientras navegas</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Productos;