// src/components/UserProductsSection.js
import React, { useState, useEffect } from 'react';

const UserProductsSection = ({ userId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUserProducts();
  }, [userId]);

  const loadUserProducts = async () => {
    setLoading(true);
    try {
      // Simular carga de productos del usuario
      // En producción, esto vendría de Firestore
      const mockProducts = [
        {
          id: 1,
          nombre: 'Yogurt Griego Natural',
          marca: 'La Serenísima',
          categoria: 'Lácteos',
          hasNutritionalInfo: true,
          isFavorite: true,
          addedDate: new Date('2025-01-10')
        },
        {
          id: 2,
          nombre: 'Granola Integral',
          marca: 'Natura',
          categoria: 'Cereales',
          hasNutritionalInfo: false,
          isFavorite: false,
          addedDate: new Date('2025-01-08')
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    switch (filter) {
      case 'favorites':
        return product.isFavorite;
      case 'with-data':
        return product.hasNutritionalInfo;
      case 'without-data':
        return !product.hasNutritionalInfo;
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="user-products-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-shopping-basket"></i>
          Mis Productos
        </h2>
        <p>Productos que has agregado o marcado como favoritos</p>
      </div>

      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Todos ({products.length})
        </button>
        <button 
          className={filter === 'favorites' ? 'active' : ''}
          onClick={() => setFilter('favorites')}
        >
          Favoritos ({products.filter(p => p.isFavorite).length})
        </button>
        <button 
          className={filter === 'with-data' ? 'active' : ''}
          onClick={() => setFilter('with-data')}
        >
          Con datos ({products.filter(p => p.hasNutritionalInfo).length})
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-header">
              <h4>{product.nombre}</h4>
              <button className="favorite-btn">
                <i className={product.isFavorite ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
            </div>
            <div className="product-info">
              <span className="brand">{product.marca}</span>
              <span className="category">{product.categoria}</span>
            </div>
            <div className="product-status">
              <span className={`status ${product.hasNutritionalInfo ? 'complete' : 'incomplete'}`}>
                {product.hasNutritionalInfo ? 'Datos completos' : 'Sin datos nutricionales'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-box-open"></i>
          <h3>No tienes productos</h3>
          <p>Comienza a explorar y agregar productos a tu lista</p>
        </div>
      )}
    </div>
  );
};

export default UserProductsSection;