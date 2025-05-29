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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage] = useState(12);

  // Estado de búsqueda
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Estadísticas
  const [stats, setStats] = useState({
    totalBranches: 0,
    byProvince: {},
    byType: {},
    byBrand: {}
  });

  useEffect(() => {
    loadBranches();
    loadFilterOptions();
    loadStats();
  }, [currentPage, selectedProvince, selectedType, selectedBrand]);

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
    } finally {
      setLoading(false);
    }
  };

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
    }
    setCurrentPage(1);
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  const displayBranches = isSearchMode ? searchResults : branches;

  return (
    <div className="sucursales-page">
      <Header />
      <div className="sucursales-container">
        
        {/* Sección de estadísticas */}
        <section className="stats-section">
          <div className="stats-grid">
            <Card className="stat-card">
              <div className="stat-content">
                <i className="pi pi-building stat-icon primary"></i>
                <div className="stat-info">
                  <h3>{stats.totalBranches.toLocaleString()}</h3>
                  <p>Total Sucursales</p>
                </div>
              </div>
            </Card>
            
            <Card className="stat-card">
              <div className="stat-content">
                <i className="pi pi-map stat-icon success"></i>
                <div className="stat-info">
                  <h3>{Object.keys(stats.byProvince).length}</h3>
                  <p>Provincias</p>
                </div>
              </div>
            </Card>
            
            <Card className="stat-card">
              <div className="stat-content">
                <i className="pi pi-tag stat-icon warning"></i>
                <div className="stat-info">
                  <h3>{Object.keys(stats.byBrand).length}</h3>
                  <p>Marcas</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Barra de búsqueda y filtros */}
        <div className="filters-section">
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
              />
              {isSearchMode && (
                <Button 
                  icon="pi pi-times" 
                  onClick={clearSearch}
                  className="p-button-secondary clear-btn"
                  tooltip="Limpiar búsqueda"
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
            />
            
            <Dropdown
              value={selectedType}
              options={types}
              onChange={(e) => handleFilterChange('type', e.value)}
              placeholder="Tipo de sucursal"
              className="filter-dropdown"
              showClear
            />
            
            <Dropdown
              value={selectedBrand}
              options={brands}
              onChange={(e) => handleFilterChange('brand', e.value)}
              placeholder="Marca comercial"
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
              <Badge value={searchResults.length} className="results-badge" />
              <span>resultados encontrados para "{searchTerm}"</span>
            </div>
          ) : (
            <div className="total-results-info">
              <Badge value={displayBranches.length} className="results-badge" />
              <span>de {totalRecords.toLocaleString()} sucursales</span>
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
              <p>Intenta ajustar los filtros o realizar una nueva búsqueda</p>
              <Button 
                label="Limpiar filtros" 
                icon="pi pi-refresh"
                onClick={() => {
                  setSelectedProvince(null);
                  setSelectedType(null);
                  setSelectedBrand(null);
                  clearSearch();
                }}
                className="p-button-outlined clear-filters-btn"
              />
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
              currentPageReportTemplate="Página {currentPage} de {totalPages}"
              className="custom-paginator"
            />
          </div>
        )}

        {/* Sección de información adicional */}
        <section className="info-section">
          <Card className="info-card">
            <h4>
              <i className="pi pi-info-circle"></i>
              Información sobre Sucursales
            </h4>
            <div className="info-grid">
              <div className="info-item">
                <h5>Tipos disponibles:</h5>
                <div className="info-badges">
                  {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => (
                    <Badge 
                      key={type} 
                      value={`${type} (${count})`} 
                      className="info-badge"
                    />
                  ))}
                </div>
              </div>
              
              <div className="info-item">
                <h5>Principales marcas:</h5>
                <div className="info-badges">
                  {Object.entries(stats.byBrand)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([brand, count]) => (
                      <Badge 
                        key={brand} 
                        value={`${brand} (${count})`} 
                        className="info-badge brand-badge"
                      />
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

export default Sucursales;