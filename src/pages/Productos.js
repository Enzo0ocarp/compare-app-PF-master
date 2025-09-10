/**
 * @fileoverview Componente Productos - Compare & Nourish v3.2 - VERSIÓN CORREGIDA
 * @description Sistema de comparación de precios por categoría - Compatible con backend real
 * @author Compare & Nourish Team
 * @version 3.2.1
 * @since 2025
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../functions/src/firebaseConfig';
import ProductCard from '../components/ProductCard';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { Chip } from 'primereact/chip';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Rating } from 'primereact/rating';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { FileUpload } from 'primereact/fileupload';

// IMPORTACIONES CORREGIDAS - Usar las funciones actualizadas de la API
import { 
  getProducts, 
  searchProducts, 
  getUniqueBrands,
  formatProductForDisplay,
  testConnection 
} from '../functions/services/api';

import '../styles/ProductosStyles.css';

/**
 * Configuración de categorías según objetivos del proyecto
 */
const CATEGORY_CONFIG = {
  'Bebidas': { 
    icon: '🥤', 
    color: '#2196f3',
    keywords: ['coca', 'pepsi', 'agua', 'jugo', 'gaseosa', 'bebida']
  },
  'Lácteos': { 
    icon: '🥛', 
    color: '#4caf50',
    keywords: ['leche', 'yogur', 'queso', 'manteca', 'crema']
  },
  'Aceites y Condimentos': { 
    icon: '🫒', 
    color: '#ff9800',
    keywords: ['aceite', 'vinagre', 'sal', 'condimento']
  },
  'Cereales y Legumbres': { 
    icon: '🌾', 
    color: '#8bc34a',
    keywords: ['arroz', 'fideos', 'pasta', 'avena', 'cereal']
  },
  'Snacks y Dulces': { 
    icon: '🍪', 
    color: '#e91e63',
    keywords: ['galletas', 'chocolate', 'alfajor', 'dulce']
  },
  'Carnes': {
    icon: '🥩',
    color: '#795548',
    keywords: ['carne', 'pollo', 'pescado', 'jamón', 'chorizo']
  },
  'Frutas y Verduras': {
    icon: '🍎',
    color: '#4caf50',
    keywords: ['banana', 'manzana', 'tomate', 'lechuga', 'papa']
  },
  'Limpieza': {
    icon: '🧽',
    color: '#00bcd4',
    keywords: ['detergente', 'lavandina', 'jabón', 'papel']
  },
  'Otros': { 
    icon: '📦', 
    color: '#9e9e9e',
    keywords: []
  }
};

/**
 * Componente principal de productos con comparación por categoría
 */
function Productos() {
  const [user] = useAuthState(auth);
  const toastRef = React.useRef(null);

  // Estados principales
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Estados de opciones para filtros
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Estados de favoritos con persistencia local
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage] = useState(24);
  
  // Estados de búsqueda
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Estados para reseñas integradas
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: '',
    title: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Estados para carga de imágenes
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductForImage, setSelectedProductForImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estados para comparación por categoría
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedProductForComparison, setSelectedProductForComparison] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingComparison, setLoadingComparison] = useState(false);

  /**
   * Determina categoría según objetivos del PDF
   */
  const determineCategory = useCallback((nombre, marca) => {
    const nombreLower = (nombre || '').toLowerCase().trim();
    const marcaLower = (marca || '').toLowerCase().trim();
    
    for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
      if (config.keywords.some(keyword => 
        nombreLower.includes(keyword) || marcaLower.includes(keyword)
      )) {
        return category;
      }
    }
    
    return 'Otros';
  }, []);

  /**
   * Procesa productos desde tu backend
   * Estructura esperada: { marca, nombre, presentacion, precio, id, etc. }
   */
  const processProducts = useCallback((rawProducts) => {
    console.log('🔄 Procesando productos del backend...', rawProducts.length);
    
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      console.warn('⚠️ Lista de productos vacía o inválida');
      return [];
    }
    
    // Filtrar solo productos válidos de tu backend
    const validProducts = rawProducts.filter(item => {
      const hasValidBrand = item.marca && item.marca.trim().length > 0;
      const hasValidName = item.nombre && item.nombre.trim().length > 0;
      const hasPrice = item.precio !== undefined && item.precio !== null;
      
      return hasValidBrand && hasValidName && hasPrice;
    });
    
    console.log('📦 Productos válidos:', validProducts.length);
    
    // Procesar cada producto individualmente
    const processedProducts = validProducts.map(item => {
      const category = determineCategory(item.nombre, item.marca);
      
      return {
        // IDs
        id: item.id || item.producto_id || `${item.marca}-${item.nombre}-${Date.now()}`,
        productoId: item.producto_id,
        sucursalId: item.sucursal_id,
        
        // Información básica
        nombre: item.nombre,
        marca: item.marca,
        presentacion: item.presentacion || '',
        precio: parseFloat(item.precio) || 0,
        precioMax: item.precio_max ? parseFloat(item.precio_max) : null,
        precioMin: item.precio_min ? parseFloat(item.precio_min) : null,
        
        // Categorización
        categoria: category,
        categoryIcon: CATEGORY_CONFIG[category]?.icon || '📦',
        categoryColor: CATEGORY_CONFIG[category]?.color || '#9e9e9e',
        
        // Metadatos
        sucursal: item.sucursal || 'No especificada',
        fechaRelevamiento: item.fecha_relevamiento,
        lastUpdated: new Date().toISOString(),
        
        // Datos para UI
        image: item.image || null,
        hasImage: Boolean(item.image),
        
        // Cálculos adicionales
        hasDiscount: item.precio_max && item.precio_max > item.precio,
        discount: item.precio_max && item.precio_max > item.precio 
          ? Math.round(((item.precio_max - item.precio) / item.precio_max) * 100)
          : 0
      };
    });
    
    // Ordenar por categoría y luego por precio
    processedProducts.sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.precio - b.precio;
    });
    
    console.log('✅ Productos procesados exitosamente:', processedProducts.length);
    return processedProducts;
  }, [determineCategory]);

  /**
   * Carga productos principales - FUNCIÓN CORREGIDA
   */
  const loadProducts = useCallback(async () => {
    if (isSearchMode) return;
    
    setLoading(true);
    try {
      console.log('🔍 Cargando productos...', { currentPage, itemsPerPage, selectedBrand, selectedCategory });
      
      const params = {
        type: 'producto',
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedBrand) {
        params.marca = selectedBrand;
      }
      
      const response = await getProducts(params);
      console.log('✅ Respuesta del backend:', response);
      
      if (response && response.data) {
        const processedProducts = processProducts(response.data);
        
        // Filtrar por categoría si está seleccionada
        const filteredProducts = selectedCategory 
          ? processedProducts.filter(p => p.categoria === selectedCategory)
          : processedProducts;
        
        setProducts(filteredProducts);
        setTotalRecords(response.total || 0);
        
        console.log('✅ Productos cargados:', filteredProducts.length);
      } else {
        console.warn('⚠️ Respuesta inválida del backend');
        setProducts([]);
        setTotalRecords(0);
      }
      
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      setProducts([]);
      setTotalRecords(0);
      
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de carga',
        detail: 'No se pudieron cargar los productos. Verifica la conexión.',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  }, [isSearchMode, currentPage, itemsPerPage, selectedBrand, selectedCategory, processProducts]);

  /**
   * Carga opciones para filtros - FUNCIÓN CORREGIDA
   */
  const loadFilterOptions = useCallback(async () => {
    try {
      console.log('🔍 Cargando opciones de filtros...');
      
      // Obtener marcas únicas desde tu backend
      const uniqueBrands = await getUniqueBrands(50);
      setBrands([
        { label: 'Todas las marcas', value: null },
        ...uniqueBrands.map(brand => ({ label: brand, value: brand }))
      ]);
      
      // Las categorías son fijas según tu configuración
      const categoryOptions = Object.keys(CATEGORY_CONFIG).map(cat => ({
        label: `${CATEGORY_CONFIG[cat]?.icon || '📦'} ${cat}`,
        value: cat
      }));
      
      setCategories([
        { label: 'Todas las categorías', value: null },
        ...categoryOptions
      ]);
      
      console.log('✅ Filtros cargados:', { brands: uniqueBrands.length, categories: categoryOptions.length });
      
    } catch (error) {
      console.error('❌ Error cargando opciones de filtros:', error);
      
      // Fallback con categorías básicas
      setCategories([
        { label: 'Todas las categorías', value: null },
        ...Object.keys(CATEGORY_CONFIG).map(cat => ({
          label: `${CATEGORY_CONFIG[cat]?.icon || '📦'} ${cat}`,
          value: cat
        }))
      ]);
    }
  }, []);

  /**
   * Búsqueda de productos - FUNCIÓN COMPLETAMENTE CORREGIDA
   */
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      clearSearch();
      return;
    }
    
    setLoading(true);
    setIsSearchMode(true);
    
    try {
      console.log('🔍 Iniciando búsqueda:', searchTerm.trim());
      
      const searchResponse = await searchProducts(searchTerm.trim());
      console.log('✅ Respuesta de búsqueda:', searchResponse);
      
      if (searchResponse && searchResponse.results) {
        const processedResults = processProducts(searchResponse.results);
        
        // Aplicar filtros adicionales a los resultados de búsqueda
        let filteredResults = processedResults;
        
        if (selectedBrand) {
          filteredResults = filteredResults.filter(p => p.marca === selectedBrand);
        }
        
        if (selectedCategory) {
          filteredResults = filteredResults.filter(p => p.categoria === selectedCategory);
        }
        
        setSearchResults(filteredResults);
        
        console.log('✅ Búsqueda completada:', {
          termino: searchTerm,
          resultadosOriginales: searchResponse.results.length,
          resultadosFiltrados: filteredResults.length
        });
        
        toastRef.current?.show({
          severity: 'success',
          summary: 'Búsqueda completada',
          detail: `Se encontraron ${filteredResults.length} productos`,
          life: 3000
        });
      } else {
        console.warn('⚠️ Sin resultados de búsqueda');
        setSearchResults([]);
        
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Sin resultados',
          detail: `No se encontraron productos para "${searchTerm}"`,
          life: 3000
        });
      }
      
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      setSearchResults([]);
      
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de búsqueda',
        detail: 'Ocurrió un error al buscar productos',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBrand, selectedCategory, processProducts]);

  /**
   * Limpia búsqueda
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchMode(false);
    setSearchResults([]);
    setCurrentPage(1);
  }, []);

  /**
   * Manejadores de filtros
   */
  const handleBrandChange = useCallback((e) => {
    setSelectedBrand(e.value);
    setCurrentPage(1);
    if (isSearchMode) {
      handleSearch();
    }
  }, [isSearchMode, handleSearch]);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.value);
    setCurrentPage(1);
    if (isSearchMode) {
      handleSearch();
    }
  }, [isSearchMode, handleSearch]);

  /**
   * Sistema de reseñas
   */
  const openReviewModal = useCallback((product) => {
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
  }, [user]);

  const submitReview = useCallback(async () => {
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
      const response = await fetch('https://us-central1-compareapp-43d31.cloudfunctions.net/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user ? `Bearer ${await user.getIdToken()}` : ''
        },
        body: JSON.stringify({
          productId: selectedProductForReview.id,
          userId: user.uid,
          rating: reviewData.rating,
          comment: reviewData.comment,
          title: reviewData.title || ''
        })
      });
      
      if (response.ok) {
        toastRef.current?.show({
          severity: 'success',
          summary: '¡Reseña enviada!',
          detail: 'Tu reseña ha sido publicada correctamente',
          life: 3000
        });
        
        setShowReviewModal(false);
        setSelectedProductForReview(null);
        setReviewData({ rating: 0, comment: '', title: '' });
      } else {
        throw new Error('Error al enviar reseña');
      }
      
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
  }, [reviewData, selectedProductForReview, user]);

  /**
   * Sistema de carga de imágenes
   */
  const openImageModal = useCallback((product) => {
    setSelectedProductForImage(product);
    setShowImageModal(true);
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productId', selectedProductForImage.id);

      const response = await fetch('http://localhost:5000/upload-product-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        toastRef.current?.show({
          severity: 'success',
          summary: 'Imagen cargada',
          detail: 'La imagen del producto se ha guardado correctamente',
          life: 3000
        });

        // Actualizar el producto en la lista local
        setProducts(prev => prev.map(p => 
          p.id === selectedProductForImage.id 
            ? { ...p, image: result.imageUrl, hasImage: true }
            : p
        ));

        setShowImageModal(false);
        setSelectedProductForImage(null);
      } else {
        throw new Error('Error al subir imagen');
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la imagen',
        life: 3000
      });
    } finally {
      setUploadingImage(false);
    }
  }, [selectedProductForImage]);

  /**
   * Sistema de comparación por categoría (OBJETIVO PRINCIPAL DEL PDF)
   */
  const openComparisonModal = useCallback(async (product) => {
    setSelectedProductForComparison(product);
    setShowComparisonModal(true);
    setLoadingComparison(true);

    try {
      console.log('🔍 Buscando productos de la misma categoría:', product.categoria);
      
      // Buscar productos de la misma categoría usando tu backend
      const response = await getProducts({
        type: 'producto',
        limit: 100 // Obtener más productos para mejor comparación
      });

      if (response && response.data) {
        const allProducts = processProducts(response.data);
        
        // Filtrar productos de la misma categoría
        const sameCategory = allProducts.filter(p => 
          p.categoria === product.categoria && p.id !== product.id
        );

        // Ordenar por precio (mejor precio primero)
        sameCategory.sort((a, b) => a.precio - b.precio);

        setCategoryProducts(sameCategory.slice(0, 10)); // Mostrar top 10
        
        console.log('✅ Productos de comparación encontrados:', sameCategory.length);
      } else {
        setCategoryProducts([]);
      }
      
    } catch (error) {
      console.error('❌ Error cargando comparación:', error);
      setCategoryProducts([]);
      
      toastRef.current?.show({
        severity: 'error',
        summary: 'Error de comparación',
        detail: 'No se pudieron cargar productos para comparar',
        life: 3000
      });
    } finally {
      setLoadingComparison(false);
    }
  }, [processProducts]);

  /**
   * Formatea producto para ProductCard
   */
  const formatProduct = useCallback((product) => {
    return formatProductForDisplay({
      // Mapear desde tu estructura de backend
      id: product.id,
      nombre: product.nombre,
      marca: product.marca,
      presentacion: product.presentacion,
      precio: product.precio,
      precio_max: product.precioMax,
      sucursal: product.sucursal,
      image: product.image,
      
      // Datos adicionales que ya tienes procesados
      categoria: product.categoria,
      categoryIcon: product.categoryIcon,
      categoryColor: product.categoryColor,
      hasImage: product.hasImage,
      discount: product.discount,
      hasDiscount: product.hasDiscount
    });
  }, []);

  /**
   * Sistema de favoritos
   */
  const toggleFavorite = useCallback((productId) => {
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
  }, []);

  // === EFECTOS ===
  
  // Cargar favoritos desde localStorage
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

  // Cargar productos cuando cambien las dependencias
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Cargar opciones de filtros al montar el componente
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Test de conexión en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testConnection().then(connected => {
        console.log(connected ? '✅ Backend conectado' : '❌ Backend desconectado');
      });
    }
  }, []);

  // Productos a mostrar
  const displayProducts = isSearchMode ? searchResults : products;

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
              <span>{displayProducts.length} productos</span>
            </div>
            <div className="stat-item">
              <i className="pi pi-heart"></i>
              <span>{favoriteProducts.length} favoritos</span>
            </div>
            <div className="stat-item">
              <i className="pi pi-tags"></i>
              <span>{categories.length - 1} categorías</span>
            </div>
          </div>
        </div>

        {/* Explicación del sistema */}
        <Card className="explanation-card">
          <h4>💡 Comparación inteligente de precios</h4>
          <p>
            Selecciona cualquier producto para ver <strong>automáticamente</strong> los mejores precios 
            de productos similares en la misma categoría. ¡Encuentra el mejor precio antes de comprar!
          </p>
        </Card>

        {/* Controles de búsqueda y filtros */}
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
                loading={loading && isSearchMode}
                disabled={!searchTerm.trim()}
              />
              {isSearchMode && (
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
        {(isSearchMode || selectedBrand || selectedCategory) && (
          <div className="active-filters-modern">
            {isSearchMode && (
              <Chip 
                label={`🔍 "${searchTerm}" (${searchResults.length})`}
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
                <h3>🔍 Cargando productos...</h3>
                <p>Organizando productos para comparación de precios</p>
                {isSearchMode && (
                  <p>Buscando: "{searchTerm}"</p>
                )}
              </div>
            </Card>
          </div>
        ) : displayProducts.length > 0 ? (
          <>
            <div className="products-grid-modern">
              {displayProducts.map((product, index) => {
                const formattedProduct = formatProduct(product);
                const isFavorite = favoriteProducts.includes(product.id);
                
                return (
                  <div key={product.id || index} className="product-wrapper-modern">
                    
                    {/* Botones de acción en la card */}
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
                      
                      {!product.hasImage && (
                        <Button
                          icon="pi pi-camera"
                          onClick={() => openImageModal(product)}
                          className="action-btn image-btn"
                          tooltip="Agregar imagen del producto"
                        />
                      )}
                      
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
                      onAddImage={() => openImageModal(product)}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Paginación */}
            {!isSearchMode && totalRecords > itemsPerPage && (
              <div className="pagination-container-modern">
                <Paginator
                  first={(currentPage - 1) * itemsPerPage}
                  rows={itemsPerPage}
                  totalRecords={totalRecords}
                  onPageChange={(e) => setCurrentPage(e.page + 1)}
                  template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                  currentPageReportTemplate="Página {currentPage} de {totalPages}"
                  className="custom-paginator-modern"
                />
              </div>
            )}
          </>
        ) : (
          <Card className="no-results-card">
            <div className="no-results-modern">
              <div className="no-results-icon">
                {isSearchMode ? '🔍' : '📦'}
              </div>
              <h3>
                {isSearchMode 
                  ? 'No se encontraron productos'
                  : 'No hay productos disponibles'
                }
              </h3>
              <p>
                {isSearchMode 
                  ? `No encontramos productos que coincidan con "${searchTerm}"`
                  : 'Intenta ajustar los filtros para ver más productos'
                }
              </p>
              
              <div className="no-results-actions">
                {isSearchMode && (
                  <Button
                    label="Limpiar búsqueda"
                    icon="pi pi-times"
                    onClick={clearSearch}
                    className="p-button-outlined"
                  />
                )}
                <Button
                  label="Ver todos los productos"
                  icon="pi pi-list"
                  onClick={() => {
                    clearSearch();
                    setSelectedBrand(null);
                    setSelectedCategory(null);
                  }}
                  className="p-button-primary"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Modal de comparación por categoría - FUNCIÓN PRINCIPAL */}
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
            
            {/* Información del producto */}
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

        {/* Modal de carga de imagen */}
        <Dialog 
          header={
            <div className="flex items-center gap-sm">
              <i className="pi pi-camera text-primary"></i>
              <span>Agregar imagen: {selectedProductForImage?.nombre}</span>
            </div>
          }
          visible={showImageModal} 
          style={{ width: '90vw', maxWidth: '400px' }} 
          onHide={() => setShowImageModal(false)}
        >
          <div className="image-upload-content">
            
            {selectedProductForImage && (
              <div className="product-image-info">
                <p><strong>Producto:</strong> {selectedProductForImage.nombre}</p>
                <p><strong>Marca:</strong> {selectedProductForImage.marca}</p>
                <p className="text-muted">
                  Ayuda a otros usuarios agregando una imagen real del producto
                </p>
              </div>
            )}

            <div className="upload-section">
              <FileUpload
                mode="basic"
                name="productImage"
                accept="image/*"
                maxFileSize={5000000} // 5MB
                onUpload={handleImageUpload}
                auto={false}
                chooseLabel="Seleccionar imagen"
                className="custom-file-upload"
                disabled={uploadingImage}
              />
              
              {uploadingImage && (
                <div className="uploading-indicator">
                  <ProgressSpinner size="small" />
                  <span>Subiendo imagen...</span>
                </div>
              )}
            </div>

            <div className="upload-guidelines">
              <h5>📋 Recomendaciones:</h5>
              <ul>
                <li>Usa una imagen clara del producto</li>
                <li>Incluye el envase completo si es posible</li>
                <li>Máximo 5MB de tamaño</li>
                <li>Formatos: JPG, PNG, GIF</li>
              </ul>
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
                  <p>Encuentra productos por nombre, marca o categoría</p>
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
                <i className="pi pi-camera help-icon"></i>
                <div>
                  <strong>Agregar Imágenes</strong>
                  <p>Ayuda a la comunidad subiendo fotos reales de productos</p>
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
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Productos;