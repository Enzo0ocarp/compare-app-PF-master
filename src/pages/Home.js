// src/pages/Home.js - Versión Completamente Mejorada
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { Carousel } from 'primereact/carousel';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BranchCard from '../components/BranchCard';
import BottomNav from '../components/BottomNav';
import { getFeaturedProducts, getBranches, getStats, searchProducts } from '../functions/services/api';
import '../styles/HomeStyles.css';

function Home() {
  const navigate = useNavigate();
  
  // Estados principales
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [nearbyBranches, setNearbyBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [componentLoading, setComponentLoading] = useState({
    products: true,
    branches: true,
    stats: true
  });

  // Estados dinámicos
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleCards, setVisibleCards] = useState({});
  const [userLocation] = useState('Buenos Aires, Argentina');
  const [currentHero, setCurrentHero] = useState(0);

  // Estadísticas mejoradas
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBranches: 0,
    totalUsers: 0,
    todayComparisons: 0,
    moneySaved: 0,
    activeUsers: 1247
  });

  // Datos en tiempo real simulados
  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 1247,
    todayComparisons: 8750,
    liveOffers: 156,
    avgSavings: 23.5,
    priceUpdates: 'Hace 2 min'
  });

  // Categorías dinámicas con diseño mejorado
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

  // Testimonios dinámicos
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

  // Múltiples heroes para carousel
  const heroSlides = useMemo(() => [
    {
      title: "Compare Precios Argentina",
      subtitle: "Ahorra Inteligente",
      description: "Encuentra los mejores precios en miles de productos de supermercados argentinos. Compara, ahorra y toma decisiones inteligentes.",
      primaryAction: { text: "Buscar Productos", link: "/productos", icon: "pi pi-search" },
      secondaryAction: { text: "Ver Sucursales", link: "/sucursales", icon: "pi pi-map" },
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      title: "Muchos Supermercados",
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

  // Alertas de información dinámicas
  const [systemAlerts, setSystemAlerts] = useState([]);

  // Intersection Observer para animaciones
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

  // Timer para hora actual
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(timer);
  }, []);

  // Simular datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        todayComparisons: prev.todayComparisons + Math.floor(Math.random() * 15),
        liveOffers: Math.max(100, prev.liveOffers + Math.floor(Math.random() * 6) - 3),
        avgSavings: Math.max(15, prev.avgSavings + (Math.random() - 0.5) * 2),
        priceUpdates: 'Hace ' + Math.floor(Math.random() * 5 + 1) + ' min'
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Carousel automático del hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % heroSlides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Cargar datos principales
  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar productos destacados
      setComponentLoading(prev => ({ ...prev, products: true }));
      try {
        const products = await getFeaturedProducts(8);
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
          trending: Math.random() > 0.7,
          brand: product.marca,
          presentation: product.presentacion
        }));
        setFeaturedProducts(processedProducts);

        // Productos trending (subset diferente)
        const shuffled = [...processedProducts].sort(() => 0.5 - Math.random());
        setTrendingProducts(shuffled.slice(0, 4));
        
      } catch (error) {
        console.error('Error cargando productos:', error);
        setFeaturedProducts([]);
      } finally {
        setComponentLoading(prev => ({ ...prev, products: false }));
      }

      // Cargar sucursales
      setComponentLoading(prev => ({ ...prev, branches: true }));
      try {
        const branchesResponse = await getBranches({ limit: 6 });
        const processedBranches = (branchesResponse.data || []).map(branch => ({
          ...branch,
          rating: (4 + Math.random()).toFixed(1),
          distance: `${(Math.random() * 10 + 0.5).toFixed(1)} km`,
          status: Math.random() > 0.2 ? 'Abierto' : 'Cerrado',
          specialOffers: Math.floor(Math.random() * 20) + 5,
          openUntil: Math.random() > 0.5 ? '22:00' : '20:00'
        }));
        setNearbyBranches(processedBranches);
      } catch (error) {
        console.error('Error cargando sucursales:', error);
        setNearbyBranches([]);
      } finally {
        setComponentLoading(prev => ({ ...prev, branches: false }));
      }

      // Cargar estadísticas
      setComponentLoading(prev => ({ ...prev, stats: true }));
      try {
        const statsData = await getStats();
        const enhancedStats = {
          totalProducts: statsData.totalProducts || Math.floor(Math.random() * 5000) + 15000,
          totalBranches: statsData.totalBranches || Math.floor(Math.random() * 200) + 800,
          totalUsers: Math.floor(Math.random() * 10000) + 25000,
          todayComparisons: Math.floor(Math.random() * 5000) + 8000,
          moneySaved: Math.floor(Math.random() * 1000000) + 5000000,
          activeUsers: realtimeData.activeUsers
        };
        setStats(enhancedStats);

        // Actualizar alertas del sistema
        setSystemAlerts([
          {
            id: 1,
            text: `${enhancedStats.totalProducts.toLocaleString()} productos disponibles para comparar`,
            type: 'info',
            icon: 'pi pi-shopping-bag',
            priority: 'high'
          },
          {
            id: 2,
            text: `${enhancedStats.totalBranches} sucursales registradas en toda Argentina`,
            type: 'success',
            icon: 'pi pi-map-marker',
            priority: 'medium'
          },
          {
            id: 3,
            text: `$${enhancedStats.moneySaved.toLocaleString()} ahorrados por nuestros usuarios este mes`,
            type: 'warning',
            icon: 'pi pi-dollar',
            priority: 'high'
          },
          {
            id: 4,
            text: `${realtimeData.activeUsers} usuarios comparando precios ahora mismo`,
            type: 'info',
            icon: 'pi pi-users',
            priority: 'medium'
          }
        ]);

      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setComponentLoading(prev => ({ ...prev, stats: false }));
      }

    } catch (error) {
      console.error('Error general cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [realtimeData.activeUsers]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Funciones de utilidad
  const formatNumber = useCallback((num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  }, []);

  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }, [currentTime]);

  const handleQuickSearch = useCallback((term) => {
    navigate(`/productos?search=${encodeURIComponent(term)}`);
  }, [navigate]);

  // Estadísticas mejoradas para mostrar
  const enhancedStats = useMemo(() => [
    {
      icon: 'pi pi-shopping-cart',
      value: stats.totalProducts,
      label: 'Productos Disponibles',
      trend: '+12% este mes',
      color: '#667eea',
      description: 'En constante crecimiento'
    },
    {
      icon: 'pi pi-building',
      value: stats.totalBranches,
      label: 'Sucursales Registradas',
      trend: '+5 nuevas esta semana',
      color: '#4ecdc4',
      description: 'Cobertura nacional'
    },
    {
      icon: 'pi pi-users',
      value: stats.totalUsers,
      label: 'Usuarios Activos',
      trend: '+15% mensual',
      color: '#ff6b6b',
      description: 'Comunidad creciente'
    },
    {
      icon: 'pi pi-chart-line',
      value: stats.todayComparisons,
      label: 'Comparaciones Hoy',
      trend: 'En tiempo real',
      color: '#45b7d1',
      description: 'Actualizando constantemente'
    }
  ], [stats]);

  return (
    <div className="home-page">
      <Header />
      
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
                        <span className="stat-number">{formatNumber(stats.totalProducts)}</span>
                        <span className="stat-label">Productos</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{stats.totalBranches}</span>
                        <span className="stat-label">Sucursales</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{formatNumber(stats.totalUsers)}</span>
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

        {/* Enhanced Stats Section */}
        <section className="enhanced-stats-section">
          <div className="section-header">
            <h2>Números que Impresionan</h2>
            <p>Miles de argentinos confían en Compare para optimizar sus compras</p>
          </div>
          
          <div className="enhanced-stats-grid">
            {enhancedStats.map((stat, index) => (
              <div
                key={index}
                className={`enhanced-stat-card ${visibleCards[`stat-${index}`] ? 'visible' : ''}`}
                data-animate-id={`stat-${index}`}
                style={{ '--stat-color': stat.color }}
              >
                {componentLoading.stats ? (
                  <div className="stat-skeleton">
                    <Skeleton shape="circle" size="4rem" />
                    <Skeleton width="100%" height="1.5rem" />
                    <Skeleton width="60%" height="1rem" />
                  </div>
                ) : (
                  <>
                    <div className="stat-icon" style={{ background: stat.color }}>
                      <i className={stat.icon}></i>
                    </div>
                    <div className="stat-content">
                      <h3>{typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</h3>
                      <p>{stat.label}</p>
                      <span className="stat-trend">{stat.trend}</span>
                      <small>{stat.description}</small>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="featured-products-section">
          <div className="section-header">
            <h2>Productos Más Buscados</h2>
            <p>Los favoritos de nuestros usuarios con los mejores precios</p>
            <Link to="/productos" className="view-all-btn">
              Ver Todos <i className="pi pi-arrow-right"></i>
            </Link>
          </div>
          
          {componentLoading.products ? (
            <div className="products-skeleton">
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
            <div className="featured-products-grid">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div
                  key={product.id || index}
                  className={`product-wrapper ${visibleCards[`product-${index}`] ? 'visible' : ''}`}
                  data-animate-id={`product-${index}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trending Products Carousel */}
        <section className="trending-section">
          <div className="section-header">
            <h2>Productos en Tendencia</h2>
            <p>Los más populares esta semana</p>
          </div>
          
          <div className="trending-carousel">
            {trendingProducts.map((product, index) => (
              <div key={product.id} className="trending-product">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
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
              {[...Array(3)].map((_, index) => (
                <div key={index} className="branch-skeleton">
                  <Skeleton width="100%" height="250px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="branches-grid">
              {nearbyBranches.slice(0, 6).map((branch, index) => (
                <div
                  key={branch.id || index}
                  className={`branch-wrapper ${visibleCards[`branch-${index}`] ? 'visible' : ''}`}
                  data-animate-id={`branch-${index}`}
                >
                  <BranchCard branch={branch} />
                </div>
              ))}
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
            <small>Más de {formatNumber(stats.totalUsers)} usuarios ya reciben nuestras ofertas</small>
          </div>
        </section>

        {/* System Alerts Section */}
        <section className="system-alerts-section">
          <div className="section-header">
            <h2>Estado del Sistema</h2>
            <p>
              Última actualización: {currentTime.toLocaleString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="alerts-grid">
            {systemAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`alert-card ${alert.type} ${visibleCards[`alert-${index}`] ? 'visible' : ''}`}
                data-animate-id={`alert-${index}`}
              >
                <i className={alert.icon}></i>
                <div>
                  <span>{alert.text}</span>
                  {alert.priority === 'high' && (
                    <div className="alert-priority">
                      <i className="pi pi-exclamation-circle"></i>
                      <small>Prioritario</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                <strong>${formatNumber(stats.moneySaved)}</strong>
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
      
      <BottomNav />
    </div>
  );
}

export default Home;