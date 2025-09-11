import React, { useState } from 'react';
import { Filter, X, ChevronDown, AlertCircle, CheckCircle, Clock, Search } from 'lucide-react';

const DataFilter = ({ 
  onFilterChange, 
  categories = [], 
  totalProducts = 0, 
  productsWithData = 0, 
  productsWithoutData = 0 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    dataStatus: 'all', // all, with-data, without-data, pending-approval
    category: 'all',
    searchTerm: '',
    sortBy: 'name' // name, date-added, data-completeness
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      dataStatus: 'all',
      category: 'all',
      searchTerm: '',
      sortBy: 'name'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dataStatus !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.searchTerm.trim()) count++;
    if (filters.sortBy !== 'name') count++;
    return count;
  };

  const dataStatusOptions = [
    { value: 'all', label: 'Todos los productos', icon: null, count: totalProducts },
    { value: 'with-data', label: 'Con información nutricional', icon: CheckCircle, count: productsWithData },
    { value: 'without-data', label: 'Sin información nutricional', icon: AlertCircle, count: productsWithoutData },
    { value: 'pending-approval', label: 'Pendientes de aprobación', icon: Clock, count: 0 }
  ];

  const sortOptions = [
    { value: 'name', label: 'Nombre (A-Z)' },
    { value: 'name-desc', label: 'Nombre (Z-A)' },
    { value: 'date-added', label: 'Más recientes' },
    { value: 'date-added-desc', label: 'Más antiguos' },
    { value: 'data-completeness', label: 'Más completos' },
    { value: 'price-asc', label: 'Precio menor' },
    { value: 'price-desc', label: 'Precio mayor' }
  ];

  return (
    <div className="data-filter-container">
      {/* Header del filtro */}
      <div className="filter-header">
        <button 
          className="filter-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
          {getActiveFiltersCount() > 0 && (
            <span className="filter-badge">{getActiveFiltersCount()}</span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {getActiveFiltersCount() > 0 && (
          <button 
            className="filter-clear"
            onClick={clearFilters}
          >
            <X className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Panel de filtros colapsible */}
      {isOpen && (
        <div className="filter-panel">
          {/* Búsqueda */}
          <div className="filter-group">
            <label className="filter-label">
              <Search className="w-4 h-4" />
              Buscar productos
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Estado de datos */}
          <div className="filter-group">
            <label className="filter-label">Estado de información nutricional</label>
            <div className="filter-options">
              {dataStatusOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <label 
                    key={option.value} 
                    className={`filter-option ${filters.dataStatus === option.value ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="dataStatus"
                      value={option.value}
                      checked={filters.dataStatus === option.value}
                      onChange={(e) => handleFilterChange('dataStatus', e.target.value)}
                      className="filter-radio"
                    />
                    <span className="filter-option-content">
                      {IconComponent && <IconComponent className="w-4 h-4" />}
                      <span className="filter-option-text">{option.label}</span>
                      <span className="filter-option-count">({option.count})</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Categorías */}
          <div className="filter-group">
            <label className="filter-label">Categoría</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="filter-group">
            <label className="filter-label">Ordenar por</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Resumen de filtros activos */}
      {getActiveFiltersCount() > 0 && (
        <div className="filter-summary">
          <span className="filter-summary-text">
            Filtros activos:
          </span>
          <div className="filter-tags">
            {filters.dataStatus !== 'all' && (
              <span className="filter-tag">
                {dataStatusOptions.find(opt => opt.value === filters.dataStatus)?.label}
                <button onClick={() => handleFilterChange('dataStatus', 'all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="filter-tag">
                {categories.find(cat => cat.id === filters.category)?.nombre || filters.category}
                <button onClick={() => handleFilterChange('category', 'all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.searchTerm.trim() && (
              <span className="filter-tag">
                "{filters.searchTerm}"
                <button onClick={() => handleFilterChange('searchTerm', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .data-filter-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }

        .filter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          font-size: 0.975rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .filter-toggle:hover {
          color: #667eea;
        }

        .filter-badge {
          background: #667eea;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          min-width: 1.5rem;
          text-align: center;
        }

        .filter-clear {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-clear:hover {
          border-color: #f87171;
          color: #ef4444;
          background: #fef2f2;
        }

        .filter-panel {
          padding: 1.5rem;
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          border-bottom: 1px solid #f3f4f6;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-input,
        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
          background: white;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-option:hover {
          border-color: #667eea;
          background: #f8faff;
        }

        .filter-option.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .filter-radio {
          display: none;
        }

        .filter-option-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }

        .filter-option-text {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .filter-option-count {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .filter-summary {
          padding: 1rem 1.5rem;
          background: #f8faff;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-summary-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .filter-tag button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .filter-tag button:hover {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .filter-panel {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 1rem;
          }

          .filter-header {
            padding: 1rem;
          }

          .filter-summary {
            padding: 1rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .filter-toggle span {
            display: none;
          }

          .filter-clear span {
            display: none;
          }

          .filter-tags {
            width: 100%;
          }

          .filter-tag {
            font-size: 0.7rem;
            padding: 0.2rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DataFilter;