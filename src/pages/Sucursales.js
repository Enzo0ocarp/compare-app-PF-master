/**
 * @fileoverview Página de listado y búsqueda de sucursales de Compare Precios Argentina
 * @description Componente Sucursales que permite a los usuarios buscar, filtrar y explorar
 * sucursales disponibles con estadísticas, mapas y información detallada de cada ubicación.
 * @author Compare Team
 * @version 1.0.0
 * @since 2025
 */

// src/pages/Sucursales.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BranchCard from '../components/BranchCard';
import BottomNav from '../components/BottomNav';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { Chip } from 'primereact/chip';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { getBranches, searchProducts } from '../functions/services/api';
import '../styles/SucursalesStyles.css';

/**
 * @typedef {Object} Branch
 * @property {string|number} id - Identificador único de la sucursal
 * @property {string} sucursalNombre - Nombre de la sucursal
 * @property {string} provincia - Provincia donde se ubica
 * @property {string} sucursalTipo - Tipo de sucursal (ej: Supermercado, Farmacia)
 * @property {string} banderaDescripcion - Marca o bandera comercial
 * @property {string} [direccion] - Dirección física de la sucursal
 * @property {string} [telefono] - Número de teléfono
 * @property {string} [horarios] - Horarios de atención
 * @property {number} [latitude] - Latitud para geolocalización
 * @property {number} [longitude] - Longitud para geolocalización
 */

/**
 * @typedef {Object} DropdownOption
 * @property {string} label - Etiqueta visible en el dropdown
 * @property {string|null} value - Valor del dropdown (null para opción "todos")
 */

/**
 * @typedef {Object} BranchStats
 * @property {number} totalBranches - Total de sucursales disponibles
 * @property {Object.<string, number>} byProvince - Conteo por provincia
 * @property {Object.<string, number>} byType - Conteo por tipo de sucursal
 * @property {Object.<string, number>} byBrand - Conteo por marca comercial
 */

/**
 * @typedef {Object} ApiResponse
 * @property {Branch[]} data - Array de sucursales obtenidas
 * @property {number} total - Número total de sucursales disponibles
 * @property {number} [page] - Página actual
 * @property {number} [limit] - Límite de sucursales por página
 */

/**
 * @component Sucursales
 * @description Página principal de sucursales que incluye:
 * - Estadísticas generales de sucursales
 * - Sistema de búsqueda y filtros avanzados
 * - Grid responsive de tarjetas de sucursales
 * - Paginación de resultados
 * - Información contextual y ayuda
 * - Chips de filtros activos
 * 
 * @returns {JSX.Element} Componente de la página de sucursales
 * 
 * @example
 * <Sucursales />
 */
function Sucursales() {
  /** @type {[Branch[], Function]} Lista de sucursales cargadas */
  const [branches, setBranches] = useState([]);
  
  /** @type {[boolean, Function]} Estado de carga de datos */
  const [loading, setLoading] = useState(false);
  
  /** @type {[string, Function]} Término de búsqueda actual */
  const [searchTerm, setSearchTerm] = useState('');
  
  /** @type {[string|null, Function]} Provincia seleccionada en el filtro */
  const [selectedProvince, setSelectedProvince] = useState(null);
  
  /** @type {[string|null, Function]} Tipo de sucursal seleccionado */
  const [selectedType, setSelectedType] = useState(null);
  
  /** @type {[string|null, Function]} Marca comercial seleccionada */
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  /** @type {[DropdownOption[], Function]} Opciones de provincias para el filtro */
  const [provinces, setProvinces] = useState([]);
  
  /** @type {[DropdownOption[], Function]} Opciones de tipos de sucursal */
  const [types, setTypes] = useState([]);
  
  /** @type {[DropdownOption[], Function]} Opciones de marcas comerciales */
  const [brands, setBrands] = useState([]);
  
  // Estados de paginación
  /** @type {[number, Function]} Página actual (1-indexed) */
  const [currentPage, setCurrentPage] = useState(1);
  
  /** @type {[number, Function]} Total de registros disponibles */
  const [totalRecords, setTotalRecords] = useState(0);
  
  /** @type {[number]} Número de elementos por página */
  const [itemsPerPage] = useState(12);

  // Estados de búsqueda
  /** @type {[boolean, Function]} Indica si está en modo búsqueda */
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  /** @type {[Branch[], Function]} Resultados de la búsqueda */
  const [searchResults, setSearchResults] = useState([]);

  /** @type {[BranchStats, Function]} Estadísticas de sucursales */
  const [stats, setStats] = useState({
    totalBranches: 0,
    byProvince: {},
    byType: {},
    byBrand: {}
  });

  /**
   * @description Efecto para cargar sucursales y opciones cuando cambian los filtros
   * @function
   * @since 1.0.0
   */
  useEffect(() => {
    loadBranches();
    loadFilterOptions();
    loadStats();
  }, [currentPage, selectedProvince, selectedType, selectedBrand]);

  /**
   * @description Carga la lista de sucursales desde la API con filtros aplicados
   * @async
   * @function
   * @since 1.0.0
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando las sucursales están cargadas
   * 
   * @throws {Error} Error al cargar sucursales desde la API
   */
  const loadBranches = async () => {
    if (isSearchMode) return;
    
    setLoading(true);
    try {
      const params = {
        type: 'sucursal',
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedProvince) params.provincia = selectedProvince;
      if (selectedBrand) params.marca = selectedBrand;

      const response = await getBranches(params);
      let filteredBranches = response.data || [];

      // Filtrar por tipo si está seleccionado
      if (selectedType) {
        filteredBranches = filteredBranches.filter(branch => 
          branch.sucursalTipo?.toLowerCase() === selectedType.toLowerCase()
        );
      }

      setBranches(filteredBranches);
      setTotalRecords(response.total || 0);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      setBranches([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Carga las opciones disponibles para todos los filtros
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
      // Cargar todas las sucursales para extraer opciones únicas
      const allBranchesResponse = await getBranches({ limit: 1000 });
      const allBranches = allBranchesResponse.data || [];

      // Provincias únicas
      const uniqueProvinces = [...new Set(allBranches.map(b => b.provincia).filter(Boolean))];
      setProvinces([
        { label: 'Todas las provincias', value: null },
        ...uniqueProvinces.map(prov => ({ label: prov, value: prov }))
      ]);

      // Tipos de sucursal únicos
      const uniqueTypes = [...new Set(allBranches.map(b => b.sucursalTipo).filter(Boolean))];
      setTypes([
        { label: 'Todos los tipos', value: null },
        ...uniqueTypes.map(type => ({ label: type, value: type }))
      ]);

      // Marcas/Banderas únicas
      const uniqueBrands = [...new Set(allBranches.map(b => b.banderaDescripcion).filter(Boolean))];
      setBrands([
        { label: 'Todas las marcas', value: null },
        ...uniqueBrands.map(brand => ({ label: brand, value: brand }))
      ]);

    } catch (error) {
      console.error('Error cargando opciones de filtros:', error);
    }
  };

  /**
   * @description Carga las estadísticas generales de sucursales
   * @async
   * @function
   * @since 1.0.0
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando las estadísticas están cargadas
   * 
   * @throws {Error} Error al cargar estadísticas
   */
  const loadStats = async () => {
    try {
      const response = await getBranches({ limit: 1000 });
      const allBranches = response.data || [];
      
      // Calcular estadísticas
      const byProvince = {};
      const byType = {};
      const byBrand = {};

      allBranches.forEach(branch => {
        // Por provincia
        if (branch.provincia) {
          byProvince[branch.provincia] = (byProvince[branch.provincia] || 0) + 1;
        }
        
        // Por tipo
        if (branch.sucursalTipo) {
          byType[branch.sucursalTipo] = (byType[branch.sucursalTipo] || 0) + 1;
        }
        
        // Por marca/bandera
        if (branch.banderaDescripcion) {
          byBrand[branch.banderaDescripcion] = (byBrand[branch.banderaDescripcion] || 0) + 1;
        }
      });

      setStats({
        totalBranches: allBranches.length,
        byProvince,
        byType,
        byBrand
      });

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  /**
   * @description Ejecuta una búsqueda de sucursales basada en el término ingresado
   * @async
   * @function
   * @since 1.0.0
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando la búsqueda está completa
   * 
   * @throws {Error} Error durante la búsqueda
   * 
   * @example
   * await handleSearch(); // Busca sucursales con el término actual
   */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      loadBranches();
      return;
    }

    setLoading(true);
    setIsSearchMode(true);
    try {
      const response = await searchProducts(searchTerm);
      // Filtrar solo sucursales de los resultados
      const branchResults = response.results?.filter(item => item.sucursalNombre) || [];
      setSearchResults(branchResults);
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
   * clearSearch(); // Limpia búsqueda y recarga sucursales
   */
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    setSearchResults([]);
    loadBranches();
  };

  /**
   * @description Maneja el cambio de cualquier filtro y reinicia la paginación
   * @function
   * @since 1.0.0
   * 
   * @param {('province'|'type'|'brand')} filterType - Tipo de filtro a cambiar
   * @param {string|null} value - Nuevo valor del filtro
   * 
   * @example
   * handleFilterChange('province', 'Buenos Aires'); // Filtra por Buenos Aires
   */
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'province':
        setSelectedProvince(value);
        break;
      case 'type':
        setSelectedType(value);
        break;
      case 'brand':
        setSelectedBrand(value);
        break;
      default:
        console.warn('Tipo de filtro no reconocido:', filterType);
        return;
    }
    
    setCurrentPage(1);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  /**
   * @description Limpia todos los filtros activos
   * @function
   * @since 1.0.0
   * 
   * @example
   * clearAllFilters(); // Remueve todos los filtros y búsquedas
   */
  const clearAllFilters = () => {
    setSelectedProvince(null);
    setSelectedType(null);
    setSelectedBrand(null);
    clearSearch();
  };

  /**
   * @description Obtiene las sucursales a mostrar (búsqueda o listado normal)
   * @type {Branch[]}
   */
  const displayBranches = isSearchMode ? searchResults : branches;

  /**
   * @description Cuenta el número total de filtros activos
   * @type {number}
   */
  const activeFiltersCount = [selectedProvince, selectedType, selectedBrand, isSearchMode]
    .filter(Boolean).length;

  return (
    <div className="sucursales-page">
      <div className="sucursales-container">
        
        {/* Sección de estadísticas */}
        <section className="stats-section">
          <div className="stats-header">
            <h2>
              <i className="pi pi-building"></i>
              Red de Sucursales
            </h2>
            <p>Encuentra la sucursal más cercana a tu ubicación</p>
          </div>
          
          <div className="stats-grid">
            <Card className="stat-card primary">
              <div className="stat-content">
                <i className="pi pi-building stat-icon"></i>
                <div className="stat-info">
                  <h3>{stats.totalBranches.toLocaleString()}</h3>
                  <p>Total Sucursales</p>
                  <small>En toda Argentina</small>
                </div>
              </div>
            </Card>
            
            <Card className="stat-card success">
              <div className="stat-content">
                <i className="pi pi-map stat-icon"></i>
                <div className="stat-info">
                  <h3>{Object.keys(stats.byProvince).length}</h3>
                  <p>Provincias</p>
                  <small>Cobertura nacional</small>
                </div>
              </div>
            </Card>
            
            <Card className="stat-card warning">
              <div className="stat-content">
                <i className="pi pi-tag stat-icon"></i>
                <div className="stat-info">
                  <h3>{Object.keys(stats.byBrand).length}</h3>
                  <p>Marcas</p>
                  <small>Diferentes cadenas</small>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Barra de búsqueda y filtros */}
        <section className="filters-section">
          <div className="filters-header">
            <h3>
              <i className="pi pi-filter"></i>
              Buscar y Filtrar Sucursales
            </h3>
            {activeFiltersCount > 0 && (
              <Badge 
                value={`${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} activo${activeFiltersCount > 1 ? 's' : ''}`}
                severity="info"
                className="filters-badge"
              />
            )}
          </div>
          
          <div className="search-container">
            <div className="p-inputgroup">
              <InputText
                placeholder="Buscar sucursales por nombre, ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input"
              />
              <Button 
                icon="pi pi-search" 
                onClick={handleSearch}
                className="p-button-primary search-btn"
                tooltip="Buscar sucursales"
                tooltipOptions={{ position: 'top' }}
              />
              {isSearchMode && (
                <Button 
                  icon="pi pi-times" 
                  onClick={clearSearch}
                  className="p-button-secondary clear-btn"
                  tooltip="Limpiar búsqueda"
                  tooltipOptions={{ position: 'top' }}
                />
              )}
            </div>
          </div>

          <div className="filters-row">
            <Dropdown
              value={selectedProvince}
              options={provinces}
              onChange={(e) => handleFilterChange('province', e.value)}
              placeholder="Filtrar por provincia"
              className="filter-dropdown"
              showClear
              filter
              filterPlaceholder="Buscar provincia..."
            />
            
            <Dropdown
              value={selectedType}
              options={types}
              onChange={(e) => handleFilterChange('type', e.value)}
              placeholder="Tipo de sucursal"
              className="filter-dropdown"
              showClear
              filter
              filterPlaceholder="Buscar tipo..."
            />
            
            <Dropdown
              value={selectedBrand}
              options={brands}
              onChange={(e) => handleFilterChange('brand', e.value)}
              placeholder="Marca comercial"
              className="filter-dropdown"
              showClear
              filter
              filterPlaceholder="Buscar marca..."
            />
            
            {activeFiltersCount > 0 && (
              <Button
                label="Limpiar todo"
                icon="pi pi-filter-slash"
                onClick={clearAllFilters}
                className="p-button-outlined clear-all-btn"
                size="small"
              />
            )}
          </div>
        </section>

        {/* Chips de filtros activos */}
        <div className="active-filters">
          {isSearchMode && (
            <Chip 
              label={`Búsqueda: "${searchTerm}"`} 
              removable 
              onRemove={clearSearch}
              className="filter-chip search-chip"
              icon="pi pi-search"
            />
          )}
          {selectedProvince && (
            <Chip 
              label={`Provincia: ${selectedProvince}`} 
              removable 
              onRemove={() => handleFilterChange('province', null)}
              className="filter-chip province-chip"
              icon="pi pi-map"
            />
          )}
          {selectedType && (
            <Chip 
              label={`Tipo: ${selectedType}`} 
              removable 
              onRemove={() => handleFilterChange('type', null)}
              className="filter-chip type-chip"
              icon="pi pi-tag"
            />
          )}
          {selectedBrand && (
            <Chip 
              label={`Marca: ${selectedBrand}`} 
              removable 
              onRemove={() => handleFilterChange('brand', null)}
              className="filter-chip brand-chip"
              icon="pi pi-building"
            />
          )}
        </div>

        {/* Información de resultados */}
        <div className="results-info">
          {isSearchMode ? (
            <div className="search-results-info">
              <i className="pi pi-search"></i>
              <Badge value={searchResults.length} className="results-badge" />
              <span>resultados encontrados para "<strong>{searchTerm}</strong>"</span>
            </div>
          ) : (
            <div className="total-results-info">
              <i className="pi pi-list"></i>
              <Badge value={displayBranches.length} className="results-badge" />
              <span>de <strong>{totalRecords.toLocaleString()}</strong> sucursales disponibles</span>
            </div>
          )}
        </div>

        {/* Grid de sucursales */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
              <h3>Cargando sucursales...</h3>
              <p>Buscando las mejores opciones cerca de ti</p>
            </div>
          </div>
        ) : displayBranches.length > 0 ? (
          <div className="branches-grid">
            {displayBranches.map((branch, index) => (
              <div key={branch.id || index} className="branch-wrapper">
                <BranchCard branch={branch} />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <i className="pi pi-map-marker no-results-icon"></i>
              <h3>No se encontraron sucursales</h3>
              <p>
                {isSearchMode 
                  ? `No hay sucursales que coincidan con "${searchTerm}"`
                  : 'No hay sucursales disponibles con los filtros seleccionados'
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
                  label="Ver todas las sucursales" 
                  icon="pi pi-refresh"
                  onClick={clearAllFilters}
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
              currentPageReportTemplate="Página {currentPage} de {totalPages} ({totalRecords} sucursales)"
              className="custom-paginator"
            />
          </div>
        )}

        {/* Sección de información adicional */}
        <section className="info-section">
          <div className="info-grid">
            <Card className="info-card">
              <h4>
                <i className="pi pi-info-circle"></i>
                Información sobre Sucursales
              </h4>
              <div className="info-content">
                <div className="info-item">
                  <h5>Tipos más comunes:</h5>
                  <div className="info-badges">
                    {Object.entries(stats.byType)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4)
                      .map(([type, count]) => (
                        <Badge 
                          key={type} 
                          value={`${type} (${count})`} 
                          className="info-badge type-badge"
                        />
                      ))}
                  </div>
                </div>
                
                <div className="info-item">
                  <h5>Principales marcas:</h5>
                  <div className="info-badges">
                    {Object.entries(stats.byBrand)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4)
                      .map(([brand, count]) => (
                        <Badge 
                          key={brand} 
                          value={`${brand} (${count})`} 
                          className="info-badge brand-badge"
                        />
                      ))}
                  </div>
                </div>
                
                <div className="info-item">
                  <h5>Provincias con más sucursales:</h5>
                  <div className="info-badges">
                    {Object.entries(stats.byProvince)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 3)
                      .map(([province, count]) => (
                        <Badge 
                          key={province} 
                          value={`${province} (${count})`} 
                          className="info-badge province-badge"
                        />
                      ))}
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="help-card">
              <h4>
                <i className="pi pi-question-circle"></i>
                ¿Cómo usar esta página?
              </h4>
              <div className="help-content">
                <div className="help-tip">
                  <i className="pi pi-search"></i>
                  <span>Usa el buscador para encontrar sucursales por nombre o ubicación</span>
                </div>
                <div className="help-tip">
                  <i className="pi pi-filter"></i>
                  <span>Combina filtros para resultados más precisos</span>
                </div>
                <div className="help-tip">
                  <i className="pi pi-map"></i>
                  <span>Filtra por provincia para encontrar sucursales cercanas</span>
                </div>
                <div className="help-tip">
                  <i className="pi pi-building"></i>
                  <span>Selecciona tu marca favorita para ver solo esas sucursales</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Sección de contacto y ayuda */}
        <section className="contact-section">
          <Card className="contact-card">
            <div className="contact-content">
              <h4>
                <i className="pi pi-phone"></i>
                ¿No encuentras lo que buscas?
              </h4>
              <p>
                Si no puedes encontrar una sucursal específica o necesitas información adicional,
                no dudes en contactarnos. Estamos aquí para ayudarte.
              </p>
              <div className="contact-actions">
                <Button
                  label="Contactar Soporte"
                  icon="pi pi-envelope"
                  className="p-button-primary"
                  onClick={() => window.location.href = 'mailto:soporte@compare.com.ar'}
                />
                <Button
                  label="Sugerir Sucursal"
                  icon="pi pi-plus"
                  className="p-button-outlined"
                  onClick={() => window.location.href = '/sugerir-sucursal'}
                />
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default Sucursales;