/**
 * @fileoverview Página principal de la aplicación Compare Precios Argentina
 * @description Componente Home optimizado adaptado al nuevo layout
 * @author Compare Team
 * @version 3.0.0 - Adaptado para PageLayout
 * @since 2025
 */

// src/pages/Home.js - Versión Adaptada al Nuevo Layout
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';

// REMOVIDO: Header y BottomNav ya están en App.js
// import Header from '../components/Header';
// import BottomNav from '../components/BottomNav';

import ProductCard from '../components/ProductCard';
import BranchCard from '../components/BranchCard';
import { getFeaturedProducts, getBranches, getStats } from '../functions/services/api';
import { useLayout } from '../hooks/useLayout'; // Opcional: hook para funciones avanzadas
import '../styles/HomeStyles.css';

/**
 * @component Home
 * @description Componente principal de la página de inicio adaptado al nuevo layout
 * @returns {JSX.Element} Componente de la página principal
 */
function Home() {
  const navigate = useNavigate();
  
  // Hook opcional para layout avanzado
  const { getFabStyle, scrollToElement } = useLayout();
  
  // Estados principales simplificados
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [nearbyBranches, setNearbyBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [componentLoading, setComponentLoading] = useState({
    products: true,
    branches: true
  });

  // Estados dinámicos reducidos
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleCards, setVisibleCards] = useState({});
  const [userLocation] = useState('Buenos Aires, Argentina');
  const [currentHero, setCurrentHero] = useState(0);

  // Estadísticas simplificadas para el hero
  const [heroStats] = useState({
    totalProducts: 18500,
    totalBranches: 850,
    totalUsers: 35000,
    todayComparisons: 8750
  });

  // Datos en tiempo real más estables (actualización cada 30 segundos en lugar de 8)
  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 1247,
    todayComparisons: 8750,
    liveOffers: 156,
    avgSavings: 23.5,
    priceUpdates: 'Hace 2 min'
  });

  /**
   * @description Categorías dinámicas
   */
  const categories = useMemo(() => [
    {
      id: 'ofertas',
      name: 'Ofertas Flash',
      icon: 'pi pi-bolt',
      color: '#e74c3c',
      bgGradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      description: 'Descuentos especiales por tiempo limitado',
      count: '250+ ofertas',
      badge: 'Nuevo',
      link: '/productos?filter=ofertas'
    },
    {
      id: 'supermercados',
      name: 'Supermercados',
      icon: 'pi pi-shopping-cart',
      color: '#3498db',
      bgGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      description: 'Las mejores cadenas cerca tuyo',
      count: '50+ cadenas',
      badge: 'Popular',
      link: '/sucursales'
    },
    {
      id: 'marcas',
      name: 'Marcas Premium',
      icon: 'pi pi-star-fill',
      color: '#9b59b6',
      bgGradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
      description: 'Las marcas más reconocidas',
      count: '100+ marcas',
      badge: 'Trending',
      link: '/productos?filter=premium'
    },
    {
      id: 'precios',
      name: 'Mejores Precios',
      icon: 'pi pi-dollar',
      color: '#27ae60',
      bgGradient: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
      description: 'Los precios más competitivos',
      count: 'Actualizados cada hora',
      badge: 'Hot',
      link: '/productos?filter=baratos'
    },
    {
      id: 'organicos',
      name: 'Productos Orgánicos',
      icon: 'pi pi-sun',
      color: '#f39c12',
      bgGradient: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      description: 'Alimentación saludable y natural',
      count: '80+ productos',
      badge: 'Eco',
      link: '/productos?filter=organicos'
    },
    {
      id: 'comparador',
      name: 'Comparador IA',
      icon: 'pi pi-eye',
      color: '#e91e63',
      bgGradient: 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)',
      description: 'Comparación inteligente con IA',
      count: 'Nuevo algoritmo',
      badge: 'Beta',
      link: '/comparador'
    }
  ], []);

  /**
   * @description Testimonios de usuarios
   */
  const testimonials = useMemo(() => [
    {
      id: 1,
      name: "María González",
      location: "Buenos Aires",
      text: "Compare me ayudó a ahorrar más de $50,000 en mis compras mensuales. La app es increíblemente útil y fácil de usar.",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=1",
      savings: 50000,
      timeUsing: "6 meses"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      location: "Córdoba",
      text: "La mejor app para comparar precios. Muy intuitiva y siempre encuentro las mejores ofertas cerca de casa.",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=2",
      savings: 35000,
      timeUsing: "1 año"
    },
    {
      id: 3,
      name: "Ana Martínez",
      location: "Rosario",
      text: "Revolucionó mi forma de hacer compras. El sistema de notificaciones es excelente, nunca me pierdo una oferta.",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=3",
      savings: 42000,
      timeUsing: "8 meses"
    },
    {
      id: 4,
      name: "Luis Fernández",
      location: "Mendoza",
      text: "Increíble poder ver todos los precios de un vistazo. Me ahorro tiempo y dinero en cada compra.",
      rating: 5,
      avatar: "https://i.pravatar.cc/100?img=4",
      savings: 28000,
      timeUsing: "4 meses"
    }
  ], []);

  /**
   * @description Slides del hero carousel
   */
  const heroSlides = useMemo(() => [
    {
      title: "Compare Precios",
      subtitle: "Ahorra Inteligente",
      description: "Encuentra los mejores precios en miles de productos de supermercados argentinos. Compara, ahorra y toma decisiones inteligentes.",
      primaryAction: { text: "Buscar Productos", link: "/productos", icon: "pi pi-search" },
      secondaryAction: { text: "Ver Sucursales", link: "/sucursales", icon: "pi pi-map" },
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Supermercados",
      subtitle: "En Toda Argentina",
      description: "Comparamos precios de DIA, Coto, Carrefour, La Anónima y muchos más. Siempre encontrás el mejor precio cerca tuyo.",
      primaryAction: { text: "Ver Sucursales", link: "/sucursales", icon: "pi pi-building" },
      secondaryAction: { text: "Explorar Marcas", link: "/productos?filter=marcas", icon: "pi pi-star" },
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      title: "Ahorro Garantizado",
      subtitle: "Más del 20% en Promedio",
      description: "Nuestros usuarios ahorran en promedio $25,000 pesos mensuales. Únete a miles de argentinos que ya compran inteligente.",
      primaryAction: { text: "Crear Cuenta", link: "/register", icon: "pi pi-user-plus" },
      secondaryAction: { text: "Ver Ofertas", link: "/productos?filter=ofertas", icon: "pi pi-tag" },
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ], []);

  /**
   * @description Intersection Observer para animaciones
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-animate-id');
            if (id) {
              setVisibleCards(prev => ({ ...prev, [id]: true }));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const animatedElements = document.querySelectorAll('[data-animate-id]');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  /**
   * @description Timer para actualizar hora actual (cada 5 minutos en lugar de 1)
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 300000); // 5 minutos

    return () => clearInterval(timer);
  }, []);

  /**
   * @description Datos en tiempo real más estables (cada 30 segundos)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 6) - 3,
        todayComparisons: prev.todayComparisons + Math.floor(Math.random() * 8),
        liveOffers: Math.max(100, prev.liveOffers + Math.floor(Math.random() * 4) - 2),
        avgSavings: Math.max(15, prev.avgSavings + (Math.random() - 0.5) * 1),
        priceUpdates: 'Hace ' + Math.floor(Math.random() * 10 + 1) + ' min'
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /**
   * @description Carousel automático más lento (cada 12 segundos)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % heroSlides.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  /**
   * @description Carga datos una sola vez al montar el componente
   */
  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar productos trending
      setComponentLoading(prev => ({ ...prev, products: true }));
      try {
        const products = await getFeaturedProducts(4);
        const processedProducts = products.map(product => ({
          id: product.id,
          title: product.nombre || 'Producto sin nombre',
          price: product.precio || 0,
          originalPrice: product.precio ? product.precio * (1 + Math.random() * 0.3) : 0,
          description: `${product.marca || 'Sin marca'} - ${product.presentacion || 'Presentación estándar'}`,
          category: product.marca || 'General',
          image: '/placeholder-product.png',
          discount: Math.floor(Math.random() * 30) + 5,
          rating: {
            rate: (4 + Math.random()).toFixed(1),
            count: Math.floor(Math.random() * 200) + 50
          },
          inStock: Math.random() > 0.1,
          trending: true,
          brand: product.marca,
          presentation: product.presentacion
        }));
        
        setTrendingProducts(processedProducts);
        
      } catch (error) {
        console.error('Error cargando productos:', error);
        setTrendingProducts([]);
      } finally {
        setComponentLoading(prev => ({ ...prev, products: false }));
      }

      // Cargar sucursales cercanas
      setComponentLoading(prev => ({ ...prev, branches: true }));
      try {
        const branchesResponse = await getBranches({ limit: 6 });
        
        // Verificar que la respuesta tenga la estructura esperada
        let branchesData = [];
        if (branchesResponse && branchesResponse.data && Array.isArray(branchesResponse.data)) {
          branchesData = branchesResponse.data;
        } else if (branchesResponse && Array.isArray(branchesResponse)) {
          branchesData = branchesResponse;
        } else if (branchesResponse) {
          branchesData = branchesResponse.sucursales || branchesResponse.branches || [];
        }

        const processedBranches = branchesData
          .filter(branch => branch && (branch.id || branch._id))
          .map(branch => ({
            id: branch.id || branch._id,
            sucursalNombre: branch.nombre || branch.sucursalNombre || branch.name || 'Sucursal sin nombre',
            direccion: branch.direccion || branch.address || 'Dirección no disponible',
            telefono: branch.telefono || branch.phone || '',
            horarios: branch.horarios || branch.hours || 'Horarios no disponibles',
            banderaDescripcion: branch.cadena || branch.banderaDescripcion || branch.chain || 'Cadena no especificada',
            localidad: branch.localidad || branch.locality || '',
            provincia: branch.provincia || branch.province || '',
            sucursalTipo: branch.sucursalTipo || branch.type || 'Supermercado',
            comercioRazonSocial: branch.comercioRazonSocial || branch.business || '',
            lat: branch.lat || branch.latitude,
            lng: branch.lng || branch.longitude,
            email: branch.email,
            website: branch.website,
            imagen: branch.imagen || branch.image || '/placeholder-store.png',
            rating: branch.rating ? parseFloat(branch.rating) : (4 + Math.random()).toFixed(1),
            distance: branch.distance || `${(Math.random() * 10 + 0.5).toFixed(1)} km`,
            status: branch.status || (Math.random() > 0.2 ? 'Abierto' : 'Cerrado'),
            specialOffers: branch.specialOffers || Math.floor(Math.random() * 20) + 5,
            openUntil: branch.openUntil || (Math.random() > 0.5 ? '22:00' : '20:00'),
            ...branch
          }));
        
        setNearbyBranches(processedBranches);
        console.log('Sucursales cargadas:', processedBranches.length);
        
      } catch (error) {
        console.error('Error cargando sucursales:', error);
        
        // Datos de fallback si hay error
        const fallbackBranches = [
          {
            id: 'fallback-1',
            sucursalNombre: 'Coto CABALLITO',
            direccion: 'Av. Rivadavia 4502, CABA',
            telefono: '(011) 4958-7000',
            banderaDescripcion: 'Coto',
            localidad: 'Buenos Aires',
            provincia: 'Buenos Aires',
            sucursalTipo: 'Supermercado',
            lat: -34.6037,
            lng: -58.3816,
            rating: '4.2',
            distance: '1.2 km',
            status: 'Abierto',
            specialOffers: 15,
            openUntil: '22:00',
            imagen: '/placeholder-store.png'
          },
          {
            id: 'fallback-2',
            sucursalNombre: 'Carrefour EXPRESS',
            direccion: 'Av. Corrientes 3247, CABA',
            telefono: '(011) 4862-3456',
            banderaDescripcion: 'Carrefour',
            localidad: 'Buenos Aires',
            provincia: 'Buenos Aires',
            sucursalTipo: 'Express',
            lat: -34.6037,
            lng: -58.3816,
            rating: '4.1',
            distance: '0.8 km',
            status: 'Abierto',
            specialOffers: 12,
            openUntil: '23:00',
            imagen: '/placeholder-store.png'
          },
          {
            id: 'fallback-3',
            sucursalNombre: 'DIA % Villa Crespo',
            direccion: 'Av. Corrientes 4832, CABA',
            telefono: '(011) 4857-9876',
            banderaDescripcion: 'DIA',
            localidad: 'Buenos Aires',
            provincia: 'Buenos Aires',
            sucursalTipo: 'Autoservicio',
            lat: -34.6037,
            lng: -58.3816,
            rating: '3.9',
            distance: '2.1 km',
            status: 'Abierto',
            specialOffers: 8,
            openUntil: '21:00',
            imagen: '/placeholder-store.png'
          }
        ];
        
        setNearbyBranches(fallbackBranches);
      } finally {
        setComponentLoading(prev => ({ ...prev, branches: false }));
      }

    } catch (error) {
      console.error('Error general cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos solo una vez
  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  /**
   * @description Formatear números
   */
  const formatNumber = useCallback((num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  }, []);

  /**
   * @description Obtener saludo apropiado
   */
  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }, [currentTime]);

  /**
   * @description Búsqueda rápida
   */
  const handleQuickSearch = useCallback((term) => {
    navigate(`/productos?search=${encodeURIComponent(term)}`);
  }, [navigate]);

  // NOTA: NO devolvemos más Header ni BottomNav, solo el contenido
  return (
    <>
      {/* CONTENIDO PRINCIPAL - SIN PADDING EXTRA PORQUE PAGELAYOUT LO MANEJA */}
      <div className="home-page">
        <div className="home-container">

          {/* Hero Carousel Section */}
          <section className="hero-carousel-section">
            <div className="hero-carousel-container">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`hero-slide ${index === currentHero ? 'active' : ''}`}
                  style={{ background: slide.bgGradient }}
                >
                  <div className="hero-content">
                    <div className="hero-text">
                      <div className="greeting-badge">
                        <i className="pi pi-clock"></i>
                        <span>{getGreeting()}</span>
                      </div>
                      
                      <h1 className="hero-title">
                        <span className="title-main">{slide.title}</span>
                        <span className="title-sub">{slide.subtitle}</span>
                      </h1>
                      
                      <p className="hero-description">{slide.description}</p>
                      
                      <div className="hero-stats">
                        <div className="stat-item">
                          <span className="stat-number">{formatNumber(heroStats.totalProducts)}</span>
                          <span className="stat-label">Productos</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">{heroStats.totalBranches}</span>
                          <span className="stat-label">Sucursales</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-number">{formatNumber(heroStats.totalUsers)}</span>
                          <span className="stat-label">Usuarios</span>
                        </div>
                      </div>
                      
                      <div className="hero-actions">
                        <Link to={slide.primaryAction.link} className="hero-btn primary">
                          <i className={slide.primaryAction.icon}></i>
                          {slide.primaryAction.text}
                        </Link>
                        <Link to={slide.secondaryAction.link} className="hero-btn secondary">
                          <i className={slide.secondaryAction.icon}></i>
                          {slide.secondaryAction.text}
                        </Link>
                      </div>
                    </div>
                    
                    <div className="hero-visual">
                      <div className="floating-widget">
                        <div className="widget-header">
                          <i className="pi pi-chart-line"></i>
                          <span>En tiempo real</span>
                        </div>
                        <div className="widget-content">
                          <div className="realtime-stat">
                            <span className="stat-value">{realtimeData.activeUsers.toLocaleString()}</span>
                            <span className="stat-desc">usuarios activos</span>
                          </div>
                          <div className="realtime-stat">
                            <span className="stat-value">{realtimeData.todayComparisons.toLocaleString()}</span>
                            <span className="stat-desc">comparaciones hoy</span>
                          </div>
                          <div className="update-indicator">
                            <div className="pulse-dot"></div>
                            <span>Precios actualizados {realtimeData.priceUpdates}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel indicators */}
            <div className="carousel-indicators">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentHero ? 'active' : ''}`}
                  onClick={() => setCurrentHero(index)}
                />
              ))}
            </div>
          </section>

          {/* Quick Actions Bar */}
          <section className="quick-actions-section">
            <div className="quick-actions-container">
              <h3>Búsquedas populares</h3>
              <div className="quick-actions-grid">
                <button className="quick-action" onClick={() => handleQuickSearch('leche')}>
                  <i className="pi pi-search"></i>
                  <span>Leche</span>
                </button>
                <button className="quick-action" onClick={() => handleQuickSearch('pan')}>
                  <i className="pi pi-search"></i>
                  <span>Pan</span>
                </button>
                <button className="quick-action" onClick={() => handleQuickSearch('aceite')}>
                  <i className="pi pi-search"></i>
                  <span>Aceite</span>
                </button>
                <button className="quick-action" onClick={() => handleQuickSearch('arroz')}>
                  <i className="pi pi-search"></i>
                  <span>Arroz</span>
                </button>
                <button className="quick-action" onClick={() => handleQuickSearch('fideos')}>
                  <i className="pi pi-search"></i>
                  <span>Fideos</span>
                </button>
                <Link to="/productos" className="quick-action view-all">
                  <i className="pi pi-arrow-right"></i>
                  <span>Ver todos</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Live Stats Banner */}
          <section className="live-stats-banner">
            <div className="live-stats-container">
              <div className="live-indicator">
                <div className="pulse-dot live"></div>
                <span>EN VIVO</span>
              </div>
              <div className="live-stats-content">
                <div className="live-stat">
                  <i className="pi pi-users"></i>
                  <span>{realtimeData.activeUsers.toLocaleString()} usuarios conectados</span>
                </div>
                <div className="live-stat">
                  <i className="pi pi-chart-line"></i>
                  <span>{realtimeData.todayComparisons.toLocaleString()} comparaciones hoy</span>
                </div>
                <div className="live-stat">
                  <i className="pi pi-tag"></i>
                  <span>{realtimeData.liveOffers} ofertas activas</span>
                </div>
                <div className="live-stat">
                  <i className="pi pi-percentage"></i>
                  <span>{realtimeData.avgSavings.toFixed(1)}% ahorro promedio</span>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="categories-section">
            <div className="section-header">
              <h2>Explora por Categorías</h2>
              <p>Encuentra exactamente lo que necesitas de manera rápida y eficiente</p>
            </div>
            
            <div className="categories-grid">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`category-card ${visibleCards[`category-${index}`] ? 'visible' : ''}`}
                  data-animate-id={`category-${index}`}
                  style={{ '--category-color': category.color }}
                >
                  <Link to={category.link} className="category-link">
                    <div className="category-background" style={{ background: category.bgGradient }}>
                      <div className="category-icon">
                        <i className={category.icon}></i>
                      </div>
                      <Badge value={category.badge} className={`category-badge ${category.badge.toLowerCase()}`} />
                    </div>
                    <div className="category-content">
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                      <div className="category-meta">
                        <span className="category-count">{category.count}</span>
                        <i className="pi pi-arrow-right"></i>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Trending Products Carousel */}
          <section className="trending-section">
            <div className="section-header">
              <h2>Productos en Tendencia</h2>
              <p>Los más populares esta semana</p>
            </div>
            
            {componentLoading.products ? (
              <div className="trending-skeleton">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="product-skeleton">
                    <Skeleton width="100%" height="200px" />
                    <div style={{ padding: '1rem' }}>
                      <Skeleton width="100%" height="1.5rem" />
                      <Skeleton width="60%" height="1rem" />
                      <Skeleton width="40%" height="1.5rem" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="trending-carousel">
                {trendingProducts.map((product, index) => (
                  <div key={product.id} className="trending-product">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Nearby Branches Section */}
          <section className="branches-section">
            <div className="section-header">
              <h2>Sucursales Cercanas</h2>
              <p>Las mejores cadenas cerca de {userLocation}</p>
              <Link to="/sucursales" className="view-all-btn">
                Ver Todas <i className="pi pi-arrow-right"></i>
              </Link>
            </div>
            
            {componentLoading.branches ? (
              <div className="branches-skeleton">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="branch-skeleton">
                    <Skeleton width="100%" height="250px" />
                  </div>
                ))}
              </div>
            ) : nearbyBranches && nearbyBranches.length > 0 ? (
              <div className="branches-grid">
                {nearbyBranches.slice(0, 6).map((branch, index) => (
                  <div
                    key={branch.id || `branch-${index}`}
                    className={`branch-wrapper ${visibleCards[`branch-${index}`] ? 'visible' : ''}`}
                    data-animate-id={`branch-${index}`}
                  >
                    {/* Wrapper con namespace para evitar conflictos de estilos */}
                    <div className="branch-card-container">
                      {branch && <BranchCard branch={branch} />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-branches-message">
                <i className="pi pi-building" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                <p>No se encontraron sucursales cercanas. Intenta ampliar tu búsqueda.</p>
                <Link to="/sucursales" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  <i className="pi pi-search"></i>
                  Buscar Sucursales
                </Link>
              </div>
            )}
          </section>

          {/* Testimonials Section */}
          <section className="testimonials-section">
            <div className="section-header">
              <h2>Lo que dicen nuestros usuarios</h2>
              <p>Miles de personas ya ahorran con Compare en toda Argentina</p>
            </div>
            
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`testimonial-card ${visibleCards[`testimonial-${index}`] ? 'visible' : ''}`}
                  data-animate-id={`testimonial-${index}`}
                >
                  <div className="testimonial-content">
                    <div className="stars">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="pi pi-star-fill"></i>
                      ))}
                    </div>
                    <p>"{testimonial.text}"</p>
                    <div className="testimonial-savings">
                      <i className="pi pi-dollar"></i>
                      <span>Ahorró ${testimonial.savings.toLocaleString()} en {testimonial.timeUsing}</span>
                    </div>
                  </div>
                  <div className="testimonial-author">
                    <img src={testimonial.avatar} alt={testimonial.name} />
                    <div>
                      <span className="author-name">{testimonial.name}</span>
                      <small className="author-location">{testimonial.location}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="newsletter-section">
            <div className="newsletter-content">
              <h2>¿Querés recibir las mejores ofertas?</h2>
              <p>Suscribite a nuestro newsletter y recibí notificaciones de descuentos exclusivos</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Tu email aquí..." 
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  <i className="pi pi-send"></i>
                  Suscribirse
                </button>
              </div>
              <div className="newsletter-benefits">
                <div className="benefit-item">
                  <i className="pi pi-check"></i>
                  <span>Ofertas exclusivas semanales</span>
                </div>
                <div className="benefit-item">
                  <i className="pi pi-check"></i>
                  <span>Alertas de precios personalizadas</span>
                </div>
                <div className="benefit-item">
                  <i className="pi pi-check"></i>
                  <span>Primero en conocer nuevos productos</span>
                </div>
              </div>
              <small>Más de {formatNumber(heroStats.totalUsers)} usuarios ya reciben nuestras ofertas</small>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="final-cta-section">
            <div className="final-cta-content">
              <h2>¿Listo para empezar a ahorrar?</h2>
              <p>Unite a miles de argentinos que ya optimizan sus compras con Compare</p>
              <div className="final-cta-actions">
                <Link to="/productos" className="cta-button primary">
                  <i className="pi pi-search"></i>
                  Explorar Productos
                </Link>
                <Link to="/register" className="cta-button secondary">
                  <i className="pi pi-user-plus"></i>
                  Crear Cuenta Gratis
                </Link>
              </div>
              <div className="final-cta-stats">
                <div className="final-stat">
                  <strong>$5.2M</strong>
                  <span>Ahorrados este mes</span>
                </div>
                <div className="final-stat">
                  <strong>24/7</strong>
                  <span>Monitoreo de precios</span>
                </div>
                <div className="final-stat">
                  <strong>+20%</strong>
                  <span>Ahorro promedio</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* FAB (Floating Action Button) - Opcional */}
      {getFabStyle && (
        <Button
          icon="pi pi-plus"
          className="btn-primary"
          style={getFabStyle('bottom-right')}
          tooltip="Buscar producto específico"
          tooltipOptions={{ position: 'left' }}
          onClick={() => scrollToElement && scrollToElement('quick-actions-section')}
          rounded
        />
      )}
    </>
  );
}

export default Home;