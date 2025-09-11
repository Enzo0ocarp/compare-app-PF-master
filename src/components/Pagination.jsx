import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  showPageNumbers = true,
  showFirstLast = true,
  maxVisiblePages = 5 
}) => {
  const generatePageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Ajustar si estamos cerca del inicio o final
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // Agregar primera página y ellipsis si es necesario
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
    }
    
    // Agregar páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Agregar ellipsis y última página si es necesario
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span className="pagination-text">
          Página {currentPage} de {totalPages}
        </span>
      </div>
      
      <nav className="pagination-nav" aria-label="Navegación de páginas">
        <div className="pagination-controls">
          {/* Botón Primera */}
          {showFirstLast && currentPage > 1 && (
            <button
              className="pagination-btn pagination-btn-first"
              onClick={() => handlePageChange(1)}
              aria-label="Primera página"
            >
              Primera
            </button>
          )}
          
          {/* Botón Anterior */}
          <button
            className={`pagination-btn pagination-btn-prev ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="pagination-btn-text">Anterior</span>
          </button>
          
          {/* Números de página */}
          {showPageNumbers && (
            <div className="pagination-numbers">
              {generatePageNumbers().map((page, index) => {
                if (typeof page === 'string') {
                  return (
                    <span key={page} className="pagination-ellipsis">
                      <MoreHorizontal className="w-4 h-4" />
                    </span>
                  );
                }
                
                return (
                  <button
                    key={page}
                    className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    aria-label={`Ir a página ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Botón Siguiente */}
          <button
            className={`pagination-btn pagination-btn-next ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
          >
            <span className="pagination-btn-text">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {/* Botón Última */}
          {showFirstLast && currentPage < totalPages && (
            <button
              className="pagination-btn pagination-btn-last"
              onClick={() => handlePageChange(totalPages)}
              aria-label="Última página"
            >
              Última
            </button>
          )}
        </div>
      </nav>
      
      <style jsx>{`
        .pagination-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }
        
        .pagination-info {
          text-align: center;
        }
        
        .pagination-text {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .pagination-nav {
          width: 100%;
        }
        
        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #374151;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 40px;
        }
        
        .pagination-btn:hover:not(.disabled) {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
        
        .pagination-btn:active:not(.disabled) {
          transform: translateY(0);
        }
        
        .pagination-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #9ca3af;
        }
        
        .pagination-btn-first,
        .pagination-btn-last {
          font-weight: 600;
        }
        
        .pagination-numbers {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin: 0 0.5rem;
        }
        
        .pagination-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 2px solid #e5e7eb;
          background: white;
          color: #374151;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .pagination-number:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
        }
        
        .pagination-number.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .pagination-ellipsis {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          color: #9ca3af;
        }
        
        @media (max-width: 640px) {
          .pagination-container {
            padding: 0.75rem;
          }
          
          .pagination-btn-text {
            display: none;
          }
          
          .pagination-btn {
            padding: 0.5rem;
            min-width: 40px;
            justify-content: center;
          }
          
          .pagination-btn-first,
          .pagination-btn-last {
            display: none;
          }
          
          .pagination-numbers {
            margin: 0 0.25rem;
          }
          
          .pagination-number {
            width: 36px;
            height: 36px;
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .pagination-controls {
            gap: 0.25rem;
          }
          
          .pagination-numbers {
            display: none;
          }
          
          .pagination-info {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;