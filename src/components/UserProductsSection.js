// src/components/UserProductsSection.js - COMPATIBLE CON TU FIREBASE
import React, { useState, useEffect } from 'react';
import { db } from '../functions/src/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc,
  updateDoc,      // Para actualizar documentos
  addDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { useNotification } from './Notification';

const UserProductsSection = ({ userId, onStatUpdate }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const { showNotification } = useNotification();

  useEffect(() => {
    if (userId) {
      loadUserProducts();
    }
  }, [userId, sortBy]);

  const loadUserProducts = async () => {
    setLoading(true);
    try {
      // Buscar productos favoritos del usuario
      // Nota: Ajusta 'user_favorites' si usas otro nombre de colección
      const favoritesRef = collection(db, 'user_favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', userId),
        orderBy('addedDate', sortBy === 'recent' ? 'desc' : 'asc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      
      const productsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productId: data.productId || '',
          nombre: data.productName || data.nombre || 'Producto sin nombre',
          marca: data.brand || data.marca || 'Marca desconocida',
          categoria: data.category || data.categoria || 'Sin categoría',
          precio: data.price || data.precio || 0,
          hasNutritionalInfo: data.hasNutritionalInfo || false,
          isFavorite: data.isFavorite !== undefined ? data.isFavorite : true,
          addedDate: data.addedDate?.toDate() || data.createdAt?.toDate() || new Date(),
          imageUrl: data.imageUrl || data.photoURL || null,
          store: data.store || data.sucursal || 'Varios',
          nutritionalScore: data.nutritionalScore || null
        };
      });

      setProducts(productsData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      
      // Si falla por índice faltante, intentar sin orderBy
      if (error.code === 'failed-precondition') {
        console.log('Intentando carga sin ordenamiento...');
        try {
          const simpleQuery = query(
            collection(db, 'user_favorites'),
            where('userId', '==', userId)
          );
          const snapshot = await getDocs(simpleQuery);
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            addedDate: doc.data().addedDate?.toDate() || new Date()
          }));
          setProducts(productsData);
          showNotification('Productos cargados (sin ordenar)', 'info');
        } catch (retryError) {
          showNotification('Error al cargar productos', 'error');
        }
      } else {
        showNotification('Error al cargar tus productos', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productDocId) => {
    if (!window.confirm('¿Eliminar este producto de tus favoritos?')) return;

    try {
      await deleteDoc(doc(db, 'user_favorites', productDocId));
      
      setProducts(prev => prev.filter(p => p.id !== productDocId));
      showNotification('Producto eliminado correctamente', 'success');
      
      if (onStatUpdate) {
        onStatUpdate('favoritesCount', -1);
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
      showNotification('Error al eliminar el producto', 'error');
    }
  };

  const handleToggleFavorite = async (product) => {
    try {
      const productRef = doc(db, 'user_favorites', product.id);
      await updateDoc(productRef, {
        isFavorite: !product.isFavorite
      });

      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, isFavorite: !p.isFavorite } : p
      ));

      showNotification(
        product.isFavorite ? 'Quitado de favoritos' : 'Agregado a favoritos',
        'success'
      );
    } catch (error) {
      console.error('Error actualizando favorito:', error);
      showNotification('Error al actualizar', 'error');
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    switch (filter) {
      case 'favorites':
        filtered = filtered.filter(p => p.isFavorite);
        break;
      case 'with-data':
        filtered = filtered.filter(p => p.hasNutritionalInfo);
        break;
      case 'without-data':
        filtered = filtered.filter(p => !p.hasNutritionalInfo);
        break;
      default:
        // 'all' - no filter
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'Fecha desconocida';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="user-products-section">
        <div className="loading-state">
          <div className="spinner-container">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Cargando tus productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-products-section">
      <div className="section-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-shopping-basket"></i>
            Mis Productos Guardados
          </h2>
          <p>Productos que has agregado o marcado como favoritos</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <i className="fas fa-box"></i>
            <span>{products.length} productos</span>
          </div>
        </div>
      </div>

      {/* Controles de filtrado y ordenamiento */}
      <div className="controls-container">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <i className="fas fa-th"></i>
            <span>Todos</span>
            <span className="count">{products.length}</span>
          </button>
          <button 
            className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
            onClick={() => setFilter('favorites')}
          >
            <i className="fas fa-heart"></i>
            <span>Favoritos</span>
            <span className="count">{products.filter(p => p.isFavorite).length}</span>
          </button>
          <button 
            className={`filter-btn ${filter === 'with-data' ? 'active' : ''}`}
            onClick={() => setFilter('with-data')}
          >
            <i className="fas fa-check-circle"></i>
            <span>Con datos</span>
            <span className="count">{products.filter(p => p.hasNutritionalInfo).length}</span>
          </button>
          <button 
            className={`filter-btn ${filter === 'without-data' ? 'active' : ''}`}
            onClick={() => setFilter('without-data')}
          >
            <i className="fas fa-exclamation-circle"></i>
            <span>Sin datos</span>
            <span className="count">{products.filter(p => !p.hasNutritionalInfo).length}</span>
          </button>
        </div>

        <div className="sort-controls">
          <label>
            <i className="fas fa-sort"></i>
            Ordenar:
          </label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="name">Nombre A-Z</option>
            <option value="price-low">Precio: menor a mayor</option>
            <option value="price-high">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Grid de productos */}
      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-box-open"></i>
          <h3>
            {filter === 'all' 
              ? 'No tienes productos guardados' 
              : `No hay productos en "${filter === 'favorites' ? 'Favoritos' : filter === 'with-data' ? 'Con datos' : 'Sin datos'}"`
            }
          </h3>
          <p>
            {filter === 'all'
              ? 'Explora productos y agrégalos a tus favoritos para verlos aquí'
              : 'Intenta con otro filtro para ver más productos'
            }
          </p>
          <button 
            className="explore-btn"
            onClick={() => window.location.href = '/productos'}
          >
            <i className="fas fa-compass"></i>
            Explorar Productos
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              {/* Imagen del producto */}
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.nombre} />
                ) : (
                  <div className="product-placeholder">
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                )}
                {product.nutritionalScore && (
                  <div className="nutrition-badge">
                    <span className="score">{product.nutritionalScore}</span>
                    <span className="label">/10</span>
                  </div>
                )}
              </div>

              {/* Contenido del producto */}
              <div className="product-content">
                <div className="product-header">
                  <h4 className="product-name">{product.nombre}</h4>
                  <button 
                    className={`favorite-btn ${product.isFavorite ? 'active' : ''}`}
                    onClick={() => handleToggleFavorite(product)}
                    title={product.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <i className={product.isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                </div>

                <div className="product-meta">
                  <span className="product-brand">
                    <i className="fas fa-tag"></i>
                    {product.marca}
                  </span>
                  <span className="product-category">
                    <i className="fas fa-folder"></i>
                    {product.categoria}
                  </span>
                </div>

                <div className="product-info">
                  <div className="price-container">
                    <span className="price-label">Precio:</span>
                    <span className="price-value">{formatPrice(product.precio)}</span>
                  </div>
                  <div className="store-info">
                    <i className="fas fa-store"></i>
                    <span>{product.store}</span>
                  </div>
                </div>

                <div className="product-status">
                  <span className={`status-badge ${product.hasNutritionalInfo ? 'complete' : 'incomplete'}`}>
                    <i className={`fas ${product.hasNutritionalInfo ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    {product.hasNutritionalInfo ? 'Datos completos' : 'Sin datos nutricionales'}
                  </span>
                </div>

                <div className="product-footer">
                  <span className="added-date">
                    <i className="fas fa-calendar"></i>
                    Agregado: {formatDate(product.addedDate)}
                  </span>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveProduct(product.id)}
                    title="Eliminar producto"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .user-products-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          background: #f8faff;
          min-height: 60vh;
        }

        /* HEADER */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .header-content h2 i {
          color: #667eea;
          font-size: 1.75rem;
        }

        .header-content p {
          color: #6b7280;
          font-size: 1rem;
          margin: 0;
        }

        .header-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* CONTROLES */
        .controls-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .filter-btn:hover {
          border-color: #667eea;
          background: #f8faff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .filter-btn .count {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.15rem 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .filter-btn.active .count {
          background: rgba(255, 255, 255, 0.2);
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sort-controls label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .sort-controls i {
          color: #667eea;
        }

        .sort-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: #374151;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 180px;
        }

        .sort-select:hover {
          border-color: #667eea;
        }

        .sort-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* GRID DE PRODUCTOS */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .product-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          border-color: #667eea;
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #f8faff, #e5e7eb);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8faff, #e0e7ff);
        }

        .product-placeholder i {
          font-size: 3rem;
          color: #9ca3af;
        }

        .nutrition-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(16, 185, 129, 0.95);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .nutrition-badge .score {
          font-size: 1.25rem;
        }

        .nutrition-badge .label {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .product-content {
          padding: 1.25rem;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .product-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
          flex: 1;
        }

        .favorite-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          font-size: 1.25rem;
          padding: 0.25rem;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .favorite-btn:hover {
          color: #ef4444;
          transform: scale(1.2);
        }

        .favorite-btn.active {
          color: #ef4444;
        }

        .product-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .product-brand,
        .product-category {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #6b7280;
          font-weight: 500;
        }

        .product-brand i,
        .product-category i {
          color: #667eea;
          font-size: 0.75rem;
        }

        .product-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8faff;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .price-container {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .price-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
        }

        .store-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .store-info i {
          color: #667eea;
        }

        .product-status {
          margin-bottom: 1rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.complete {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-badge.incomplete {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .added-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .added-date i {
          color: #667eea;
        }

        .remove-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* ESTADO VACÍO */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 2px dashed #e5e7eb;
        }

        .empty-state i {
          font-size: 4rem;
          color: #d1d5db;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .explore-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        /* ESTADO DE CARGA */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .spinner-container {
          font-size: 3rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .spinner-container i {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #6b7280;
          font-weight: 500;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.25rem;
          }
        }

        @media (max-width: 768px) {
          .user-products-section {
            padding: 1rem;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-content h2 {
            font-size: 1.5rem;
          }

          .controls-container {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }

          .sort-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .sort-select {
            width: 100%;
          }

          .products-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .filter-btn span:not(.count) {
            display: none;
          }

          .filter-btn {
            justify-content: center;
            padding: 0.75rem 1rem;
          }

          .product-info {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .header-content h2 {
            font-size: 1.25rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .product-image {
            height: 180px;
          }

          .product-content {
            padding: 1rem;
          }

          .price-value {
            font-size: 1.25rem;
          }

          .filter-buttons {
            grid-template-columns: 1fr;
          }
        }

        /* ANIMACIONES */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .product-card {
          animation: fadeIn 0.4s ease-out;
          animation-fill-mode: both;
        }

        .product-card:nth-child(1) { animation-delay: 0.05s; }
        .product-card:.product-card:nth-child(2) { animation-delay: 0.1s; }
        .product-card:nth-child(3) { animation-delay: 0.15s; }
        .product-card:nth-child(4) { animation-delay: 0.2s; }
        .product-card:nth-child(5) { animation-delay: 0.25s; }
        .product-card:nth-child(6) { animation-delay: 0.3s; }

        /* ACCESIBILIDAD */
        @media (prefers-reduced-motion: reduce) {
          .product-card {
            animation: none;
          }

          .product-card:hover {
            transform: none;
          }

          .filter-btn:hover {
            transform: none;
          }

          .spinner-container i {
            animation: none;
          }
        }

        /* MODO IMPRESIÓN */
        @media print {
          .controls-container,
          .favorite-btn,
          .remove-btn,
          .explore-btn {
            display: none;
          }

          .product-card {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProductsSection;
