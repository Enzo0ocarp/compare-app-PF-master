// src/pages/Sucursales.js - REEMPLAZAR COMPLETAMENTE

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
import { TabView, TabPanel } from 'primereact/tabview';
import { getBranches, searchProducts, getUniqueProvinces, getProvinceName } from '../functions/services/api';
import { auth } from '../functions/src/firebaseConfig';
import { getUserFavoriteBranches } from '../functions/src/firebaseConfig';
import { useNotification } from '../components/Notification';
import '../styles/SucursalesStyles.css';

function Sucursales() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage] = useState(12);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [stats, setStats] = useState({
    totalBranches: 0,
    byProvince: {},
    byType: {},
    byBrand: {}
  });
  const [activeTab, setActiveTab] = useState(0);
  const [favoriteBranchIds, setFavoriteBranchIds] = useState([]);
  const [favoriteBranches, setFavoriteBranches] = useState([]);
  const { showNotification } = useNotification();
  const user = auth.currentUser;

  useEffect(() => {
    loadBranches();
    loadFilterOptions();
    loadStats();
  }, [currentPage, selectedProvince, selectedType, selectedBrand]);

  useEffect(() => {
    if (user) {
      loadUserFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 1 && user) {
      loadFavoriteBranches();
    }
  }, [activeTab, favoriteBranchIds, user]);

  const loadUserFavorites = async () => {
    if (!user) return;
    
    try {
      const favorites = await getUserFavoriteBranches(user.uid);
      setFavoriteBranchIds(favorites || []);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    }
  };

  const loadFavoriteBranches = async () => {
    if (!user || favoriteBranchIds.length === 0) {
      setFavoriteBranches([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getBranches({ limit: 1000 });
      const allBranches = response.data || [];
      
      const favorites = allBranches.filter(branch => 
        favoriteBranchIds.includes(branch.id)
      );
      
      setFavoriteBranches(favorites);
    } catch (error) {
      console.error('Error cargando sucursales favoritas:', error);
      showNotification('error', 'Error al cargar tus sucursales favoritas');
    } finally {
      setLoading(false);
    }
  };

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

      if (selectedType) {
        filteredBranches = filteredBranches.filter(branch => 
          branch.sucursalTipo?.toLowerCase() === selectedType.toLowerCase()
        );
      }

      setBranches(filteredBranches);
      setTotalRecords(response.total || 0);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      showNotification('error', 'Error al cargar sucursales');
      setBranches([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const allBranchesResponse = await getBranches({ limit: 1000 });
      const allBranches = allBranchesResponse.data || [];

      // Provincias usando el helper
      const provincesData = await getUniqueProvinces();
      setProvinces([
        { label: 'Todas las provincias', value: null },
        ...provincesData.map(prov => ({ 
          label: prov.name, 
          value: prov.code 
        }))
      ]);

      // Tipos
      const uniqueTypes = [...new Set(allBranches.map(b => b.sucursalTipo).filter(Boolean))];
      setTypes([
        { label: 'Todos los tipos', value: null },
        ...uniqueTypes.map(type => ({ label: type, value: type }))
      ]);

      // Marcas
      const uniqueBrands = [...new Set(allBranches.map(b => b.banderaDescripcion).filter(Boolean))];
      setBrands([
        { label: 'Todas las marcas', value: null },
        ...uniqueBrands.map(brand => ({ label: brand, value: brand }))
      ]);

    } catch (error) {
      console.error('Error cargando opciones de filtros:', error);
    }
  };

const loadStats = async () => {
  try {
    const response = await getBranches({ limit: 1000 });
    const allBranches = response.data || [];
    
    const byProvince = {};
    const byType = {};
    const byBrand = {};

    allBranches.forEach(branch => {
      // Contar por provincia usando el código original
      if (branch.provincia) {
        const code = branch.provincia;
        const name = getProvinceName(code);
        
        // Usar el nombre como key para agrupar correctamente
        byProvince[name] = (byProvince[name] || 0) + 1;
      }
      
      if (branch.sucursalTipo) {
        byType[branch.sucursalTipo] = (byType[branch.sucursalTipo] || 0) + 1;
      }
      
      if (branch.banderaDescripcion) {
        byBrand[branch.banderaDescripcion] = (byBrand[branch.banderaDescripcion] || 0) + 1;
      }
    });

    // Debug logging
    console.log('📊 Estadísticas calculadas:');
    console.log(`  - Total sucursales: ${allBranches.length}`);
    console.log(`  - Provincias únicas: ${Object.keys(byProvince).length}`);
    console.log(`  - Tipos únicos: ${Object.keys(byType).length}`);
    console.log(`  - Marcas únicas: ${Object.keys(byBrand).length}`);
    console.log('  - Provincias encontradas:', Object.keys(byProvince));

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
      const branchResults = response.results?.filter(item => item.sucursalNombre) || [];
      setSearchResults(branchResults);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      showNotification('error', 'Error en la búsqueda');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    setSearchResults([]);
    loadBranches();
  };

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
        break;
    }
    
    setCurrentPage(1);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  const clearAllFilters = () => {
    setSelectedProvince(null);
    setSelectedType(null);
    setSelectedBrand(null);
    clearSearch();
  };

  const handleFavoriteToggle = (branchId, isFavorite) => {
    if (isFavorite) {
      setFavoriteBranchIds(prev => [...prev, branchId]);
    } else {
      setFavoriteBranchIds(prev => prev.filter(id => id !== branchId));
    }
  };

  const displayBranches = activeTab === 1 ? favoriteBranches : (isSearchMode ? searchResults : branches);
  const activeFiltersCount = [selectedProvince, selectedType, selectedBrand, isSearchMode].filter(Boolean).length;

  return (
    <div className="sucursales-page">
      <div className="sucursales-container">
        
        {/* Estadísticas */}
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

        {/* Tabs */}
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)} className="sucursales-tabs">
          <TabPanel header="Todas las Sucursales" leftIcon="pi pi-list">
            {/* Filtros */}
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

            {/* Chips filtros activos */}
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
                  label={`Provincia: ${getProvinceName(selectedProvince)}`} 
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

            {/* Info resultados */}
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

            {/* Grid sucursales */}
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
                    <BranchCard 
                      branch={branch}
                      isFavorite={favoriteBranchIds.includes(branch.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
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
          </TabPanel>

          <TabPanel 
            header="Mis Favoritos" 
            leftIcon="pi pi-heart"
            disabled={!user}
          >
            {user ? (
              <>
                <div className="favorites-header">
                  <h3>
                    <i className="pi pi-heart-fill"></i>
                    Tus Sucursales Favoritas
                  </h3>
                  <p>Accede rápidamente a tus sucursales guardadas</p>
                </div>

                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner">
                      <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
                      <h3>Cargando tus favoritos...</h3>
                    </div>
                  </div>
                ) : favoriteBranches.length > 0 ? (
                  <div className="branches-grid">
                    {favoriteBranches.map((branch, index) => (
                      <div key={branch.id || index} className="branch-wrapper">
                        <BranchCard 
                          branch={branch}
                          isFavorite={true}
                          onFavoriteToggle={handleFavoriteToggle}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <div className="no-results-content">
                      <i className="pi pi-heart no-results-icon"></i>
                      <h3>No tienes sucursales favoritas</h3>
                      <p>
                        Empieza a guardar tus sucursales preferidas haciendo clic en el ícono del corazón
                      </p>
                      <Button 
                        label="Ver todas las sucursales" 
                        icon="pi pi-list"
                        onClick={() => setActiveTab(0)}
                        className="p-button-primary"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <div className="no-results-content">
                  <i className="pi pi-lock no-results-icon"></i>
                  <h3>Inicia sesión para ver favoritos</h3>
                  <p>
                    Debes iniciar sesión para poder guardar y ver tus sucursales favoritas
                  </p>
                </div>
              </div>
            )}
          </TabPanel>
        </TabView>

        {/* Información adicional */}
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
                  <i className="pi pi-heart"></i>
                  <span>Guarda tus sucursales favoritas para acceso rápido</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Contacto */}
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