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

function Productos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [brands, setBrands] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage] = useState(20);

  // Estado de búsqueda
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Cargar favoritos del localStorage
  useEffect(() => {
    const storedFavs = localStorage.getItem('favoriteProducts');
    if (storedFavs) {
      setFavoriteProducts(JSON.parse(storedFavs));
    }
  }, []);

  // Cargar productos iniciales y opciones de filtros
  useEffect(() => {
    loadProducts();
    loadFilterOptions();
  }, [currentPage, selectedBrand, selectedProvince]);

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
    } finally {
      setLoading(false);
    }
  };

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

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    setSearchResults([]);
    loadProducts();
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.value);
    setCurrentPage(1);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.value);
    setCurrentPage(1);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

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

  const displayProducts = isSearchMode ? searchResults : products;

  return (
    <div className="productos-page">
      <Header />
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
            />
            <Dropdown
              value={selectedProvince}
              options={provinces}
              onChange={handleProvinceChange}
              placeholder="Filtrar por provincia"
              className="filter-dropdown"
              showClear
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
            />
          )}
          {selectedBrand && (
            <Chip 
              label={`Marca: ${selectedBrand}`} 
              removable 
              onRemove={() => handleBrandChange({ value: null })}
              className="filter-chip"
            />
          )}
          {selectedProvince && (
            <Chip 
              label={`Provincia: ${selectedProvince}`} 
              removable 
              onRemove={() => handleProvinceChange({ value: null })}
              className="filter-chip"
            />
          )}
        </div>

        {/* Información de resultados */}
        <div className="results-info">
          {isSearchMode ? (
            <p>Se encontraron {searchResults.length} resultados para "{searchTerm}"</p>
          ) : (
            <p>Mostrando {displayProducts.length} de {totalRecords.toLocaleString()} productos</p>
          )}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="loading-container">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
            <p>Cargando productos...</p>
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="products-grid">
            {displayProducts.map((product, index) => {
              const formattedProduct = formatProduct(product);
              return (
                <div key={product.id || index} className="product-wrapper">
                  <Button
                    icon={favoriteProducts.includes(product.id) ? "pi pi-heart-fill" : "pi pi-heart"}
                    onClick={() => toggleFavorite(product.id)}
                    className={`favorite-btn p-button-rounded ${
                      favoriteProducts.includes(product.id) ? 'p-button-danger' : 'p-button-outlined'
                    }`}
                    tooltip={favoriteProducts.includes(product.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  />
                  <ProductCard product={formattedProduct} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <i className="pi pi-search" style={{ fontSize: '3rem', color: '#ccc' }}></i>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros o realizar una nueva búsqueda</p>
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
              currentPageReportTemplate="Página {currentPage} de {totalPages}"
            />
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default Productos;