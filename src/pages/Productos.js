// src/pages/Productos.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { getAllSupermarketProducts } from '../functions/services/api';
import '../styles/ProductosStyles.css';

function Productos() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllSupermarketProducts();
        setProducts(data);
        setFilteredProducts(data);
        // Extraer categorías únicas de los productos (Open Food Facts retorna categories como string separado por comas)
        const catsSet = new Set();
        data.forEach(product => {
          if (product.categories) {
            product.categories.split(',').forEach(cat => {
              catsSet.add(cat.trim());
            });
          }
        });
        setCategories([{ label: 'Todos', value: null }, ...Array.from(catsSet).map(cat => ({ label: cat, value: cat }))]);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProducts();
  }, []);

  // Filtrar productos según la categoría seleccionada y el término de búsqueda
  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.categories &&
        product.categories.split(',').map(c => c.trim()).includes(selectedCategory)
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.product_name && product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default Productos;
