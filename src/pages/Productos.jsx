/**
 * @fileoverview Productos - Compare & Nourish v4.1 - OPTIMIZADO
 * @description Carga única + Paginación frontend - Sin bucles infinitos
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
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

import { 
  getAllProducts,
  extractUniqueBrands,
  searchInProducts,
  filterByBrand,
  filterByCategory,
  formatProductForDisplay,
  testConnection,
  addReview,
  CATEGORY_CONFIG
} from '../functions/services/firebaseProducts';

import '../styles/ProductosStyles.css';

function Productos() {
  const [user] = useAuthState(auth);
  const toastRef = useRef(null);

  // Estado principal: TODOS LOS PRODUCTOS (cargados una sola vez)
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Estados de opciones para filtros
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Estados de favoritos
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  
  // Estados de paginación FRONTEND
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(24);

  // Estados para reseñas
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: '',
    title: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Estados para comparación
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedProductForComparison, setSelectedProductForComparison] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

  /**
   * CARGA INICIAL - UNA SOLA VEZ
   */
  useEffect(() => {
    const loadAllProducts = async () => {
      if (initialLoadDone) return; // Evitar múltiples cargas
      
      setLoading(true);
      try {
        console.log('🔄 Iniciando carga única de productos...');
        
        const products = await getAllProducts();
        setAllProducts(products);
        
        // Extraer marcas únicas
        const uniqueBrands = extractUniqueBrands(products);
        setBrands([
          { label: 'Todas las marcas', value: null },
          ...uniqueBrands.map(brand => ({ label: brand, value: brand }))
        ]);
        
        // Categorías fijas
        const categoryOptions = Object.keys(CATEGORY_CONFIG).map(cat => ({
          label: `${CATEGORY_CONFIG[cat]?.icon || '📦'} ${cat}`,
          value: cat
        }));
        
        setCategories([
          { label: 'Todas las categorías', value: null },
          ...categoryOptions
        ]);
        
        setInitialLoadDone(true);
        console.log(`✅ Carga completa: ${products.length} productos`);
        
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
        toastRef.current?.show({
          severity: 'error',
          summary: 'Error de carga',
          detail: 'No se pudieron cargar los productos',
          life: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllProducts();
  }, []); // Sin dependencias - solo se ejecuta al montar

  /**
   * PRODUCTOS FILTRADOS (memoizado para evitar recalcular)
   */
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];
    
    // Filtro por búsqueda
    if (searchTerm.trim()) {
      products = searchInProducts(products, searchTerm);
    }
    
    // Filtro por marca
    if (selectedBrand) {
      products = filterByBrand(products, selectedBrand);
    }
    
    // Filtro por categoría
    if (selectedCategory) {
      products = filterByCategory(products, selectedCategory);
    }
    
    return products;
  }, [allProducts, searchTerm, selectedBrand, selectedCategory]);

  /**
   * PRODUCTOS PAGINADOS (solo frontend)
   */
  const paginatedProducts = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  /**
   * Total de páginas
   */
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  /**
   * Manejadores de filtros
   */
  const handleSearch = () => {
    setCurrentPage(0); // Reset a primera página
    if (filteredProducts.length === 0) {
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
        detail: `Se encontraron ${filteredProducts.length} productos`,
        life: 3000
      });
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.value);
    setCurrentPage(0);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.value);
    setCurrentPage(0);
  };

  /**
   * Sistema de reseñas
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
   * Sistema de comparación por categoría
   */
  const openComparisonModal = (product) => {
    setSelectedProductForComparison(product);
    setShowComparisonModal(true);
    setLoadingComparison(true);

    try {
      const sameCategory = allProducts
        .filter(p => p.categoria === product.categoria && p.id !== product.id)
        .sort((a, b) => a.precio - b.precio)
        .slice(0, 10);

      setCategoryProducts(sameCategory);
      console.log(`✅ ${sameCategory.length} productos similares encontrados`);
      
    } catch (error) {
      console.error('❌ Error cargando comparación:', error);
      setCategoryProducts([]);
    } finally {
      setLoadingComparison(false);
    }
  };

  /**
   * Sistema de favoritos
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

  /**
   * Cargar favoritos desde localStorage
   */
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

  /**
   * Test de conexión en desarrollo
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testConnection().then(connected => {
        console.log(connected ? '✅ Firestore conectado' : '❌ Firestore desconectado');
      });
    }
  }, []);

  /**
   * Navegar entre páginas
   */
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ===== RENDER =====
  
  return (
    <div className="global-utilities productos-page">
      <Toast ref={toastRef} />
      
      <div className="container">
        
        {/* Header principal */}
        <div className="products-header">
          <div className="products-title-section">
            <h1>🛍️ Compare & Nourish</h1>
            <p><strong>Decidí mejor, comprá inteligente</strong></p>
          </div>
          
          <div className="products-stats">
            <div className="stat-item">
              <i className="pi pi-shopping-cart"></i>
              <span>{allProducts.length} productos totales</span>
            </div>
            <div className="stat-item">
              <i className="pi pi-filter"></i>
              <span>{filteredProducts.length} mostrados</span>
            </div>
            <div className="stat-item">
              <i className="pi pi-heart"></i>
              <span>{favoriteProducts.length} favoritos</span>
            </div>
          </div>
        </div>

        {/* Explicación */}
        <Card className="explanation-card">
          <h4>💡 Comparación inteligente de precios</h4>
          <p>
            Selecciona cualquier producto para ver <strong>automáticamente</strong> los mejores precios 
            de productos similares en la misma categoría. ¡Encuentra el mejor precio antes de comprar!
          </p>
        </Card>

        {/* Búsqueda y filtros */}
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

        {/* Chips de filtros activos */}
        {(searchTerm || selectedBrand || selectedCategory) && (
          <div className="active-filters-modern">
            {searchTerm && (
              <Chip 
                label={`🔍 "${searchTerm}" (${filteredProducts.length})`}
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
        {loading ? (
          <div className="loading-container-modern">
            <Card className="loading-card">
              <div className="loading-content-modern">
                <ProgressSpinner style={{ width: '60px', height: '60px' }} />
                <h3>🔍 Cargando productos desde Firestore...</h3>
                <p>Esto solo sucede una vez al cargar la página</p>
              </div>
            </Card>
          </div>
        ) : paginatedProducts.length > 0 ? (
          <>
            <div className="products-grid-modern">
              {paginatedProducts.map((product, index) => {
                const formattedProduct = formatProductForDisplay(product);
                const isFavorite = favoriteProducts.includes(product.id);
                
                return (
                  <div key={product.id || index} className="product-wrapper-modern">
                    
                    {/* Botones de acción */}
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
                    
                    {/* Badge de categoría */}
                    <div 
                      className="category-badge"
                      style={{ backgroundColor: product.categoryColor }}
                    >
                      {product.categoryIcon} {product.categoria}
                    </div>
                    
                    {/* Badge de sucursal */}
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
            
            {/* Paginación */}
            {filteredProducts.length > itemsPerPage && (
              <div className="pagination-container-modern">
                <div className="pagination-controls">
                  <Button
                    icon="pi pi-chevron-left"
                    label="Anterior"
                    onClick={goToPrevPage}
                    disabled={currentPage === 0}
                    className="p-button-outlined"
                  />
                  
                  <span className="pagination-info">
                    Página {currentPage + 1} de {totalPages} 
                    <span className="pagination-count">
                      ({filteredProducts.length} productos)
                    </span>
                  </span>
                  
                  <Button
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    label="Siguiente"
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages - 1}
                    className="p-button-outlined"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="no-results-card">
            <div className="no-results-modern">
              <div className="no-results-icon">
                {searchTerm || selectedBrand || selectedCategory ? '🔍' : '📦'}
              </div>
              <h3>No se encontraron productos</h3>
              <p>
                {searchTerm 
                  ? `No encontramos productos que coincidan con "${searchTerm}"`
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
            
            {/* Producto seleccionado */}
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

            {/* Productos de la misma categoría */}
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

            {/* Resumen de comparación */}
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
                  <p>Encuentra productos por nombre o marca</p>
                </div>
              </div>
              <div className="help-item">
                <i className="pi pi-chart-line help-icon"></i>
                <div>
                  <strong>Comparar Precios</strong>
                  <p>Haz clic en "Comparar" para ver mejores precios en la categoría</p>
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
                <i className="pi pi-tags help-icon"></i>
                <div>
                  <strong>Explorar Categorías</strong>
                  <p>Navega por categorías para descubrir nuevos productos</p>
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