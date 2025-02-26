// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import AlertList from '../components/AlertList';
import BottomNav from '../components/BottomNav';
import { getAllStoreProducts } from '../functions/services/api';
import { Link } from 'react-router-dom';
import '../styles/HomeStyles.css';

function Home() {
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Secciones estáticas de categorías y alertas
  const categories = [
    { name: 'Ofertas', icon: 'pi pi-tag', updated: 'Renovado' },
    { name: 'Saludables', icon: 'pi pi-heart', updated: 'Renovado' },
    { name: 'Vegetarianos', icon: 'pi pi-apple', updated: 'Renovado' },
    { name: 'Actualizaciones', icon: 'pi pi-refresh', updated: 'Renovado' }
  ];

  const alerts = [
    'Oferta en carnes en Coto - $6500 el kg de asado',
    'Oferta panificados en La Anónima - 25% en toda la compra'
  ];

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        const products = await getAllStoreProducts();
        // Desordenar y seleccionar 5 productos aleatorios
        const shuffled = products.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setRandomProducts(selected);
      } catch (error) {
        console.error('Error obteniendo productos aleatorios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, []);

  return (
    <div className='home-page'>
      <Header />
      <div className="home-container">
        {/* Sección de Productos Destacados */}
        <section className="section random-products-section">
          <div className="section-header">
            <h3>Productos Destacados</h3>
            <Link to="/productos">
              <button className="view-all-btn">Ver Todo</button>
            </Link>
          </div>
          {loading ? (
            <p>Cargando productos...</p>
          ) : (
            <div className="products-grid">
              {randomProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Sección de Categorías */}
        <section className="section categories-section">
          <div className="section-header">
            <h3>Categorías</h3>
            <button className="view-all-btn">Ver Todo</button>
          </div>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <CategoryCard key={index} name={category.name} icon={category.icon} updated={category.updated} />
            ))}
          </div>
        </section>

        {/* Sección de Alertas del Día */}
        <section className="section alerts-section">
          <div className="section-header">
            <h3>Alertas del Día</h3>
          </div>
          <AlertList alerts={alerts} />
        </section>
      </div>
      <BottomNav />
    </div>
  );
}

export default Home;
