/**
 * @fileoverview Página de listado y búsqueda de productos de Compare Precios Argentina
 * @description Componente Productos que permite a los usuarios buscar, filtrar y explorar
 * productos disponibles con funcionalidades avanzadas de paginación y gestión de favoritos.
 * @author Compare Team
 * @version 1.0.0
 * @since 2025
 */

// src/pages/Productos.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { Chip } from 'primereact/chip';
import { getProducts, searchProducts } from '../functions/services/api';
import '../styles/ProductosStyles.css';

/**
 * @typedef {Object} Product
 * @property {string|number} id - Identificador único del producto
 * @property {string} nombre - Nombre original del producto desde la API
 * @property {number} precio - Precio del producto
 * @property {string} marca - Marca del producto
 * @property {string} presentacion - Presentación o descripción del producto
 * @property {string} provincia - Provincia donde está disponible
 */

/**
 * @typedef {Object} FormattedProduct
 * @property {string|number} id - Identificador único del producto
 * @property {string} title - Título formateado para mostrar
 * @property {number} price - Precio del producto
 * @property {string} description - Descripción formateada (marca + presentación)
 * @property {string} category - Categoría basada en la marca
 * @property {string} image - URL de la imagen (placeholder)
 * @property {string} brand - Marca del producto
 * @property {string} presentation - Presentación del producto
 */

/**
 * @typedef {Object} DropdownOption
 * @property {string} label - Etiqueta visible en el dropdown
 * @property {string|null} value - Valor del dropdown (null para "todos")
 */

/**
 * @typedef {Object} ApiResponse
 * @property {Product[]} data - Array de productos obtenidos
 * @property {number} total - Número total de productos disponibles
 * @property {number} [page] - Página actual
 * @property {number} [limit] - Límite de productos por página
 */

/**
 * @typedef {Object} SearchResponse
 * @property {Product[]} results - Array de productos encontrados
 * @property {number} [total] - Total de resultados encontrados
 * @property {string} [query] - Término de búsqueda utilizado
 */

/**
 * @component Productos
 * @description Página principal de productos que incluye:
 * - Sistema de búsqueda avanzada
 * - Filtros por marca y provincia
 * - Paginación de resultados
 * - Gestión de productos favoritos
 * - Chips de filtros activos
 * - Vista responsive de productos
 * 
 * @returns {JSX.Element} Componente de la página de productos
 * 
 * @example
 * <Productos />
 */
function Productos() {
  /** @type {[Product[], Function]} Lista de productos cargados */
  const [products, setProducts] = useState([]);
  
  /** @type {[boolean, Function]} Estado de carga de datos */
  const [loading, setLoading] = useState(false);
  
  /** @type {[string, Function]} Término de búsqueda actual */
  const [searchTerm, setSearchTerm] = useState('');
  
  /** @type {[string|null, Function]} Marca seleccionada en el filtro */
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  /** @type {[string|null, Function]} Provincia seleccionada en el filtro */
  const [selectedProvince, setSelectedProvince] = useState(null);
  
  /** @type {[DropdownOption[], Function]} Opciones disponibles de marcas */
  const [brands, setBrands] = useState([]);
  
  /** @type {[DropdownOption[], Function]} Opciones disponibles de provincias */
  const [provinces, setProvinces] = useState([]);
  
  /** @type {[string[], Function]} Lista de IDs de productos favoritos */
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  
  // Estados de paginación
  /** @type {[number, Function]} Página actual (1-indexed) */
  const [currentPage, setCurrentPage] = useState(1);
  
  /** @type {[number, Function]} Total de registros disponibles */
  const [totalRecords, setTotalRecords] = useState(0);
  
  /** @type {[number]} Número de elementos por página */
  const [itemsPerPage] = useState(20);

  // Estados de búsqueda
  /** @type {[boolean, Function]} Indica si está en modo búsqueda */
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  /** @type {[Product[], Function]} Resultados de la búsqueda */
  const [searchResults, setSearchResults] = useState([]);

  /**
   * @description Carga los productos favoritos desde localStorage al montar el componente
   * @function
   * @since 1.0.0
   */
  useEffect(() => {
    const storedFavs = localStorage.getItem('favoriteProducts');
    if (storedFavs) {
      try {
        setFavoriteProducts(JSON.parse(storedFavs));
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
        setFavoriteProducts([]);
      }
    }
  }, []);

  /**
   * @description Efecto para cargar productos y opciones de filtros cuando cambian los parámetros
   * @function
   * @since 1.0.0
   */
  useEffect(() => {
    loadProducts();
    loadFilterOptions();
  }, [currentPage, selectedBrand, selectedProvince]);

  /**
   * @description Carga la lista de productos desde la API con los filtros aplicados
   * @async
   * @function
   * @since 1.0.0
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando los productos están cargados
   * 
   * @throws {Error} Error al cargar productos desde la API
   */
  const loadProducts = async () => {
    if (isSearchMode) return; // No cargar si estamos en modo búsqueda
    
    setLoading(true);
    try {
      const params = {
        type: 'producto',
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedBrand) params.marca = selectedBrand;
      if (selectedProvince) params.provincia = selectedProvince;

      const response = await getProducts(params);
      setProducts(response.data || []);
      setTotalRecords(response.total || 0);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProducts([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Carga las opciones disponibles para los filtros (marcas y provincias)
   * @async
   * @function
   * @since 1.0.0
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando las opciones están cargadas
   * 
   * @throws {Error} Error al cargar opciones de filtros
   */
  const loadFilterOptions = async () => {
    try {
      // Cargar todas las marcas disponibles
      const brandsResponse = await getProducts({ type: 'producto', limit: 1000 });
      const uniqueBrands = [...new Set(brandsResponse.data.map(p => p.marca).filter(Boolean))];
      setBrands([
        { label: 'Todas las marcas', value: null },
        ...uniqueBrands.map(brand => ({ label: brand, value: brand }))
      ]);

      // Cargar provincias disponibles
      const provincesResponse = await getProducts({ limit: 1000 });
      const uniqueProvinces = [...new Set(provincesResponse.data.map(p => p.provincia).filter(Boolean))];
      setProvinces([
        { label: 'Todas las provincias', value: null },
        ...uniqueProvinces.map(prov => ({ label: prov, value: prov }))
      ]);
    } catch (error) {
      console.error('Error cargando opciones de filtros:', error);
    }
  };

  /**
   * @description Ejecuta una búsqueda de productos basada en el término ingresado
   * @async
   * @function
   * @since 1.0.0
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando la búsqueda está completa
   * 
   * @throws {Error} Error durante la búsqueda
   * 
   * @example
   * // Buscar productos que contengan el término actual
   * await handleSearch();
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      loadProducts();
      return;
    }

    setLoading(true);
    setIsSearchMode(true);
    try {
      const response = await searchProducts(searchTerm);
      setSearchResults(response.results || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Limpia la búsqueda actual y vuelve al listado normal
   * @function
   * @since 1.0.0
   * 
   * @example
   * clearSearch(); // Limpia búsqueda y recarga productos
   */
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    setSearchResults([]);
    loadProducts();
  };

  /**
   * @description Maneja el cambio de marca en el filtro
   * @function
   * @since 1.0.0
   * 
   * @param {Object} e - Evento del dropdown
   * @param {string|null} e.value - Valor seleccionado (null para "todas")
   * 
   * @example
   * handleBrandChange({ value: 'Coca Cola' }); // Filtra por marca Coca Cola
   */
  const handleBrandChange = (e) => {
    setSelectedBrand(e.value);
    setCurrentPage(1);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  /**
   * @description Maneja el cambio de provincia en el filtro
   * @function
   * @since 1.0.0
   * 
   * @param {Object} e - Evento del dropdown
   * @param {string|null} e.value - Valor seleccionado (null para "todas")
   * 
   * @example
   * handleProvinceChange({ value: 'Buenos Aires' }); // Filtra por Buenos Aires
   */
  const handleProvinceChange = (e) => {
    setSelectedProvince(e.value);
    setCurrentPage(1);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  /**
   * @description Alterna el estado de favorito de un producto
   * @function
   * @since 1.0.0
   * 
   * @param {string|number} productId - ID del producto a alternar
   * 
   * @example
   * toggleFavorite('123'); // Agrega o quita el producto 123 de favoritos
   */
  const toggleFavorite = (productId) => {
    let updatedFavorites;
    if (favoriteProducts.includes(productId)) {
      updatedFavorites = favoriteProducts.filter(id => id !== productId);
    } else {
      updatedFavorites = [...favoriteProducts, productId];
    }
    setFavoriteProducts(updatedFavorites);
    localStorage.setItem('favoriteProducts', JSON.stringify(updatedFavorites));
  };

  /**
   * @description Formatea un producto de la API para su visualización
   * @function
   * @since 1.0.0
   * 
   * @param {Product} product - Producto original de la API
   * @returns {FormattedProduct} Producto formateado para mostrar
   * 
   * @example
   * const formatted = formatProduct(apiProduct);
   * // { id: '123', title: 'Coca Cola 500ml', price: 150, ... }
   */
  const formatProduct = (product) => ({
    id: product.id,
    title: product.nombre || 'Producto sin nombre',
    price: product.precio || 0,
    description: `${product.marca || ''} - ${product.presentacion || ''}`.trim(),
    category: product.marca || 'Sin categoría',
    image: '/placeholder-product.png',
    brand: product.marca,
    presentation: product.presentacion
  });

  // Determinar qué productos mostrar (búsqueda o listado normal)
  const displayProducts = isSearchMode ? searchResults : products;

  return (
    <div className="productos-page">
      <div className="products-container">
        
        {/* Barra de búsqueda y filtros */}
        <div className="filters-section">
          <div className="search-container">
            <div className="p-inputgroup">
              <InputText
                placeholder="Buscar productos, marcas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <Button 
                icon="pi pi-search" 
                onClick={handleSearch}
                className="p-button-primary"
                tooltip="Buscar productos"
              />
              {isSearchMode && (
                <Button 
                  icon="pi pi-times" 
                  onClick={clearSearch}
                  className="p-button-secondary"
                  tooltip="Limpiar búsqueda"
                />
              )}
            </div>
          </div>

          <div className="filters-row">
            <Dropdown
              value={selectedBrand}
              options={brands}
              onChange={handleBrandChange}
              placeholder="Filtrar por marca"
              className="filter-dropdown"
              showClear
              filter
              filterPlaceholder="Buscar marca..."
            />
            <Dropdown
              value={selectedProvince}
              options={provinces}
              onChange={handleProvinceChange}
              placeholder="Filtrar por provincia"
              className="filter-dropdown"
              showClear
              filter
              filterPlaceholder="Buscar provincia..."
            />
          </div>
        </div>

        {/* Chips de filtros activos */}
        <div className="active-filters">
          {isSearchMode && (
            <Chip 
              label={`Búsqueda: "${searchTerm}"`} 
              removable 
              onRemove={clearSearch}
              className="filter-chip"
              icon="pi pi-search"
            />
          )}
          {selectedBrand && (
            <Chip 
              label={`Marca: ${selectedBrand}`} 
              removable 
              onRemove={() => handleBrandChange({ value: null })}
              className="filter-chip"
              icon="pi pi-tag"
            />
          )}
          {selectedProvince && (
            <Chip 
              label={`Provincia: ${selectedProvince}`} 
              removable 
              onRemove={() => handleProvinceChange({ value: null })}
              className="filter-chip"
              icon="pi pi-map"
            />
          )}
        </div>

        {/* Información de resultados */}
        <div className="results-info">
          {isSearchMode ? (
            <div className="search-info">
              <i className="pi pi-search"></i>
              <span>Se encontraron <strong>{searchResults.length}</strong> resultados para "<strong>{searchTerm}</strong>"</span>
            </div>
          ) : (
            <div className="total-info">
              <i className="pi pi-list"></i>
              <span>Mostrando <strong>{displayProducts.length}</strong> de <strong>{totalRecords.toLocaleString()}</strong> productos</span>
            </div>
          )}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-content">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
              <h3>Cargando productos...</h3>
              <p>Buscando las mejores ofertas para ti</p>
            </div>
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="products-grid">
            {displayProducts.map((product, index) => {
              const formattedProduct = formatProduct(product);
              const isFavorite = favoriteProducts.includes(product.id);
              
              return (
                <div key={product.id || index} className="product-wrapper">
                  <Button
                    icon={isFavorite ? "pi pi-heart-fill" : "pi pi-heart"}
                    onClick={() => toggleFavorite(product.id)}
                    className={`favorite-btn p-button-rounded ${
                      isFavorite ? 'p-button-danger' : 'p-button-outlined'
                    }`}
                    tooltip={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    tooltipOptions={{ position: 'top' }}
                  />
                  <ProductCard product={formattedProduct} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <i className="pi pi-search no-results-icon"></i>
              <h3>No se encontraron productos</h3>
              <p>
                {isSearchMode 
                  ? `No hay productos que coincidan con "${searchTerm}"`
                  : 'No hay productos disponibles con los filtros seleccionados'
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
                    setSelectedProvince(null);
                  }}
                  className="p-button-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Paginación */}
        {!isSearchMode && totalRecords > itemsPerPage && (
          <div className="pagination-container">
            <Paginator
              first={(currentPage - 1) * itemsPerPage}
              rows={itemsPerPage}
              totalRecords={totalRecords}
              onPageChange={(e) => setCurrentPage(e.page + 1)}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
              currentPageReportTemplate="Página {currentPage} de {totalPages} ({totalRecords} productos)"
              className="custom-paginator"
            />
          </div>
        )}
        
        {/* Sección de ayuda */}
        <div className="help-section">
          <div className="help-content">
            <h4>
              <i className="pi pi-question-circle"></i>
              ¿Necesitas ayuda?
            </h4>
            <div className="help-tips">
              <div className="tip">
                <i className="pi pi-lightbulb"></i>
                <span>Usa el buscador para encontrar productos específicos</span>
              </div>
              <div className="tip">
                <i className="pi pi-heart"></i>
                <span>Marca tus productos favoritos para encontrarlos fácilmente</span>
              </div>
              <div className="tip">
                <i className="pi pi-filter"></i>
                <span>Combina filtros para resultados más precisos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productos;