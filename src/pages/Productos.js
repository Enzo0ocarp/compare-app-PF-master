// src/pages/Productos.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { getAllStoreProducts } from '../functions/services/api';
import '../styles/ProductosStyles.css';

function Productos() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllStoreProducts();
        setProducts(data);
        setFilteredProducts(data);
        // Extraer categorías únicas de los productos
        const catsSet = new Set();
        data.forEach(product => {
          if (product.category) {
            catsSet.add(product.category);
          }
        });
        setCategories([{ label: 'Todos', value: null }, ...Array.from(catsSet).map(cat => ({ label: cat, value: cat }))]);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category && product.category === selectedCategory
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title && product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  // Función para marcar/desmarcar productos como favoritos (almacenados en localStorage)
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

  useEffect(() => {
    // Cargar favoritos de localStorage
    const storedFavs = localStorage.getItem('favoriteProducts');
    if (storedFavs) {
      setFavoriteProducts(JSON.parse(storedFavs));
    }
  }, []);

  return (
    <div className="productos-page">
      <Header />
      <div className="products-container">
        <div className="filters">
          <InputText
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Dropdown
            value={selectedCategory}
            options={categories}
            onChange={(e) => setSelectedCategory(e.value)}
            placeholder="Filtrar por categoría"
            className="category-dropdown"
          />
        </div>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-wrapper">
              <Button
                icon={favoriteProducts.includes(product.id) ? "pi pi-heart" : "pi pi-heart-o"}
                onClick={() => toggleFavorite(product.id)}
                className="favorite-btn p-button-rounded"
                style={{color: 'black'}}
              />
              <ProductCard product={product} />
              
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default Productos;
