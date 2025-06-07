/**
 * @fileoverview Página de productos nutricionales de Compare Precios Argentina
 * @description Componente Nutricional que permite a los usuarios explorar productos
 * organizados por categorías nutricionales, con filtros especializados y alertas de ofertas.
 * @author Compare Team
 * @version 1.0.0
 * @since 2025
 */

// src/pages/Nutricional.js - Versión Completamente Mejorada
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryCard from '../components/CategoryCard';
import AlertList from '../components/AlertList';
import BottomNav from '../components/BottomNav';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';
import { Chip } from 'primereact/chip';
import { InputText } from 'primereact/inputtext';
import '../styles/NutricionalStyles.css';

/**
 * @typedef {Object} NutritionalCategory
 * @property {string} id - Identificador único de la categoría
 * @property {string} name - Nombre descriptivo de la categoría
 * @property {string} icon - Clase CSS del ícono de PrimeIcons
 * @property {string} updated - Estado de actualización (Nuevo, Actualizado, etc.)
 * @property {string} description - Descripción detallada de la categoría
 * @property {string} count - Número de productos disponibles
 * @property {string} color - Color primario en formato hexadecimal
 * @property {string} bgGradient - Gradiente CSS para el fondo
 * @property {string[]} benefits - Lista de beneficios nutricionales
 */

/**
 * @typedef {Object} NutritionalAlert
 * @property {number} id - Identificador único de la alerta
 * @property {string} title - Título de la alerta
 * @property {string} message - Mensaje descriptivo de la alerta
 * @property {('success'|'info'|'warning'|'error')} type - Tipo de alerta para styling
 * @property {('high'|'medium'|'low')} priority - Prioridad de la alerta
 * @property {string} category - ID de la categoría relacionada
 * @property {string} discount - Porcentaje de descuento oferecido
 * @property {string} validUntil - Fecha de vencimiento en formato ISO
 */

/**
 * @typedef {Object} NutritionStats
 * @property {number} totalProducts - Total de productos nutricionales
 * @property {number} categoriesCount - Número de categorías disponibles
 * @property {number} avgDiscount - Descuento promedio porcentual
 * @property {number} organicPercentage - Porcentaje de productos orgánicos
 * @property {number} usersHelped - Número de usuarios que han usado la sección
 * @property {number} caloriesSaved - Promedio de ahorro calórico en miles
 */

/**
 * @typedef {Object} FeaturedProduct
 * @property {number} id - Identificador único del producto
 * @property {string} name - Nombre del producto
 * @property {string} category - Categoría nutricional del producto
 * @property {number} price - Precio actual del producto
 * @property {number} originalPrice - Precio original antes del descuento
 * @property {number} discount - Porcentaje de descuento
 * @property {number} rating - Calificación promedio del producto
 * @property {string} image - URL de la imagen del producto
 * @property {string[]} benefits - Lista de beneficios nutricionales
 */

/**
 * @component Nutricional
 * @description Página principal de productos nutricionales que incluye:
 * - Hero section con estadísticas nutricionales
 * - Barra de búsqueda especializada
 * - Grid de categorías nutricionales interactivas
 * - Productos destacados con información nutricional
 * - Sistema de alertas y notificaciones
 * - Newsletter especializado en nutrición
 * 
 * @returns {JSX.Element} Componente de la página nutricional
 * 
 * @example
 * <Nutricional />
 */
function Nutricional() {
    const navigate = useNavigate();
    
    /** @type {[boolean, Function]} Estado de carga general de la página */
    const [loading, setLoading] = useState(true);
    
    /** @type {[string, Function]} Término de búsqueda actual */
    const [searchTerm, setSearchTerm] = useState('');
    
    /** @type {[string|null, Function]} ID de la categoría seleccionada */
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    /** @type {[Object, Function]} Estado de visibilidad de cards para animaciones */
    const [visibleCards, setVisibleCards] = useState({});

    /**
     * @description Categorías nutricionales con información detallada y beneficios
     * @type {NutritionalCategory[]}
     */
    const categories = useMemo(() => [
        { 
            id: 'balanceados',
            name: 'Alimentos Balanceados', 
            icon: 'pi pi-apple', 
            updated: 'Nuevo',
            description: 'Productos con balance nutricional perfecto',
            count: '250+ productos',
            color: '#4CAF50',
            bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
            benefits: ['Rico en fibra', 'Vitaminas esenciales', 'Minerales naturales']
        },
        { 
            id: 'proteinas',
            name: 'Ricos en Proteínas', 
            icon: 'pi pi-bolt', 
            updated: 'Actualizado',
            description: 'Fuentes de proteína de alta calidad',
            count: '180+ productos',
            color: '#FF9800',
            bgGradient: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            benefits: ['Construcción muscular', 'Energía duradera', 'Recuperación rápida']
        },
        { 
            id: 'vitaminas',
            name: 'Vitaminas y Minerales', 
            icon: 'pi pi-sun', 
            updated: 'Recomendado',
            description: 'Suplementos y alimentos fortificados',
            count: '320+ productos',
            color: '#FFC107',
            bgGradient: 'linear-gradient(135deg, #FFC107 0%, #FFA000 100%)',
            benefits: ['Sistema inmune', 'Salud ósea', 'Antioxidantes']
        },
        { 
            id: 'calorias',
            name: 'Bajos en Calorías', 
            icon: 'pi pi-thumbs-up', 
            updated: 'Populares',
            description: 'Opciones light y saludables',
            count: '145+ productos',
            color: '#2196F3',
            bgGradient: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            benefits: ['Control de peso', 'Digestión fácil', 'Bajo en grasas']
        },
        { 
            id: 'organicos',
            name: 'Productos Orgánicos', 
            icon: 'pi pi-leaf', 
            updated: 'Eco',
            description: 'Alimentos naturales y orgánicos',
            count: '95+ productos',
            color: '#8BC34A',
            bgGradient: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
            benefits: ['Sin químicos', 'Cultivo sostenible', 'Sabor natural']
        },
        { 
            id: 'funcionales',
            name: 'Alimentos Funcionales', 
            icon: 'pi pi-cog', 
            updated: 'Innovador',
            description: 'Productos con beneficios específicos',
            count: '75+ productos',
            color: '#9C27B0',
            bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            benefits: ['Probióticos', 'Prebióticos', 'Función cerebral']
        }
    ], []);

    /**
     * @description Alertas nutricionales con ofertas y promociones especiales
     * @type {NutritionalAlert[]}
     */
    const alerts = useMemo(() => [
        {
            id: 1,
            title: 'Nuevos Superalimentos Disponibles',
            message: 'Descubre quinoa, chía y amaranto con descuentos especiales',
            type: 'success',
            priority: 'high',
            category: 'balanceados',
            discount: '25%',
            validUntil: '2025-06-15'
        },
        {
            id: 2,
            title: 'Oferta en Proteínas Vegetales',
            message: 'Legumbres y frutos secos con precios increíbles',
            type: 'info',
            priority: 'medium',
            category: 'proteinas',
            discount: '30%',
            validUntil: '2025-06-10'
        },
        {
            id: 3,
            title: 'Vitaminas para el Invierno',
            message: 'Refuerza tu sistema inmune con vitamina C y D',
            type: 'warning',
            priority: 'high',
            category: 'vitaminas',
            discount: '20%',
            validUntil: '2025-07-01'
        },
        {
            id: 4,
            title: 'Snacks Saludables Light',
            message: 'Opciones bajas en calorías para cuidar tu figura',
            type: 'info',
            priority: 'medium',
            category: 'calorias',
            discount: '15%',
            validUntil: '2025-06-20'
        }
    ], []);

    /** @type {[NutritionStats, Function]} Estadísticas nutricionales dinámicas */
    const [nutritionStats, setNutritionStats] = useState({
        totalProducts: 1065,
        categoriesCount: 6,
        avgDiscount: 22,
        organicPercentage: 35,
        usersHelped: 12450,
        caloriesSaved: 2.5
    });

    /** @type {[FeaturedProduct[], Function]} Productos destacados del día */
    const [featuredProducts, setFeaturedProducts] = useState([
        {
            id: 1,
            name: 'Quinoa Orgánica Premium',
            category: 'balanceados',
            price: 850,
            originalPrice: 1200,
            discount: 29,
            rating: 4.8,
            image: '/placeholder-quinoa.jpg',
            benefits: ['Sin gluten', 'Proteína completa', 'Rico en fibra']
        },
        {
            id: 2,
            name: 'Proteína Vegetal de Arveja',
            category: 'proteinas',
            price: 2300,
            originalPrice: 2800,
            discount: 18,
            rating: 4.6,
            image: '/placeholder-protein.jpg',
            benefits: ['25g proteína', 'Fácil digestión', 'Sin lactosa']
        },
        {
            id: 3,
            name: 'Multivitamínico Natural',
            category: 'vitaminas',
            price: 1450,
            originalPrice: 1800,
            discount: 19,
            rating: 4.7,
            image: '/placeholder-vitamins.jpg',
            benefits: ['12 vitaminas', 'Minerales esenciales', 'Energía natural']
        }
    ]);

    /**
     * @description Configura el Intersection Observer para animaciones de elementos
     * @function
     * @since 1.0.0
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
     * @description Simula la carga inicial de datos con timeout
     * @function
     * @since 1.0.0
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    /**
     * @description Maneja el click en una categoría nutricional y navega a productos filtrados
     * @function
     * @since 1.0.0
     * 
     * @param {string} categoryId - ID de la categoría seleccionada
     * 
     * @example
     * handleCategoryClick('proteinas') // Navega a productos ricos en proteínas
     */
    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        // Navegar a productos con filtro nutricional
        navigate(`/productos?categoria=nutricional&filtro=${categoryId}`);
    };

    /**
     * @description Maneja el envío del formulario de búsqueda nutricional
     * @function
     * @since 1.0.0
     * 
     * @param {Event} e - Evento del formulario
     * 
     * @example
     * handleSearch(event) // Busca productos nutricionales según el término
     */
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/productos?search=${encodeURIComponent(searchTerm)}&categoria=nutricional`);
        }
    };

    /**
     * @description Filtra las alertas según la categoría seleccionada
     * @type {NutritionalAlert[]}
     */
    const filteredAlerts = selectedCategory 
        ? alerts.filter(alert => alert.category === selectedCategory)
        : alerts;

    if (loading) {
        return (
            <div className="nutricional-page loading">
                <Header />
                <div className="nutricional-container">
                    <div className="loading-content">
                        <div className="loading-hero">
                            <Skeleton width="60%" height="3rem" className="mb-3" />
                            <Skeleton width="40%" height="1.5rem" className="mb-4" />
                        </div>
                        <div className="categories-skeleton">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="category-skeleton">
                                    <Skeleton width="100%" height="200px" borderRadius="12px" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="nutricional-page">
            <div className="nutricional-container">
                
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                <span className="title-main">Nutrición Inteligente</span>
                                <span className="title-sub">Para una vida saludable</span>
                            </h1>
                            <p className="hero-description">
                                Descubre productos nutricionales de calidad, comparando precios y beneficios 
                                para tomar las mejores decisiones para tu salud.
                            </p>
                            
                            {/* Estadísticas en tiempo real */}
                            <div className="nutrition-stats">
                                <div className="stat-item">
                                    <span className="stat-number">{nutritionStats.totalProducts.toLocaleString()}</span>
                                    <span className="stat-label">Productos</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{nutritionStats.usersHelped.toLocaleString()}</span>
                                    <span className="stat-label">Usuarios</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{nutritionStats.avgDiscount}%</span>
                                    <span className="stat-label">Descuento Prom.</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="hero-visual">
                            <div className="floating-nutrition-widget">
                                <div className="widget-header">
                                    <i className="pi pi-heart-fill"></i>
                                    <span>Salud en números</span>
                                </div>
                                <div className="widget-content">
                                    <div className="nutrition-metric">
                                        <span className="metric-label">Productos Orgánicos</span>
                                        <ProgressBar value={nutritionStats.organicPercentage} className="custom-progress" />
                                        <span className="metric-value">{nutritionStats.organicPercentage}%</span>
                                    </div>
                                    <div className="nutrition-metric">
                                        <span className="metric-label">Ahorro Promedio</span>
                                        <div className="metric-highlight">
                                            <i className="pi pi-dollar"></i>
                                            <span>{nutritionStats.caloriesSaved}K por mes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Barra de búsqueda nutricional */}
                <section className="nutrition-search-section">
                    <Card className="search-card">
                        <h3>
                            <i className="pi pi-search"></i>
                            Buscar Productos Nutricionales
                        </h3>
                        <form onSubmit={handleSearch} className="nutrition-search-form">
                            <div className="search-input-container">
                                <InputText
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nombre, marca o beneficio nutricional..."
                                    className="nutrition-search-input"
                                />
                                <Button
                                    type="submit"
                                    icon="pi pi-search"
                                    className="search-submit-btn"
                                    disabled={!searchTerm.trim()}
                                />
                            </div>
                            <div className="quick-search-tags">
                                <span className="tags-label">Búsquedas populares:</span>
                                {['Quinoa', 'Proteína vegetal', 'Vitamina D', 'Sin gluten', 'Orgánico'].map((tag, index) => (
                                    <Button
                                        key={index}
                                        label={tag}
                                        className="quick-tag"
                                        size="small"
                                        outlined
                                        onClick={() => setSearchTerm(tag)}
                                    />
                                ))}
                            </div>
                        </form>
                    </Card>
                </section>

                {/* Categorías Nutricionales */}
                <section className="categories-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="pi pi-tags"></i>
                            Categorías Nutricionales 
                            <Badge value="6 Categorías" severity="success" className="ml-2" />
                        </h2>
                        <p className="section-subtitle">
                            Explora productos organizados por beneficios nutricionales específicos
                        </p>
                        <Divider />
                    </div>
                    
                    <div className="categories-grid">
                        {categories.map((category, index) => (
                            <div
                                key={category.id}
                                className={`enhanced-category-card ${visibleCards[`category-${index}`] ? 'visible' : ''}`}
                                data-animate-id={`category-${index}`}
                                onClick={() => handleCategoryClick(category.id)}
                                style={{ '--category-color': category.color }}
                            >
                                <Tooltip target={`#category-${category.id}`} content={`Explora ${category.name}`} position="top" />
                                
                                <div className="category-background" style={{ background: category.bgGradient }}>
                                    <div className="category-icon">
                                        <i className={category.icon}></i>
                                    </div>
                                    <Badge 
                                        value={category.updated} 
                                        className={`category-badge ${category.updated.toLowerCase()}`} 
                                    />
                                </div>
                                
                                <div className="category-content">
                                    <h3>{category.name}</h3>
                                    <p>{category.description}</p>
                                    <div className="category-count">
                                        <i className="pi pi-box"></i>
                                        <span>{category.count}</span>
                                    </div>
                                    
                                    <div className="category-benefits">
                                        {category.benefits.map((benefit, i) => (
                                            <Chip 
                                                key={i} 
                                                label={benefit} 
                                                className="benefit-chip"
                                            />
                                        ))}
                                    </div>
                                    
                                    <div className="category-actions">
                                        <Button
                                            label="Explorar"
                                            icon="pi pi-arrow-right"
                                            className="explore-btn"
                                            text
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Productos Destacados */}
                <section className="featured-products-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="pi pi-star-fill"></i>
                            Productos Destacados del Día
                        </h2>
                        <p className="section-subtitle">Las mejores ofertas en productos nutricionales</p>
                    </div>
                    
                    <div className="featured-products-grid">
                        {featuredProducts.map((product, index) => (
                            <Card
                                key={product.id}
                                className={`featured-product-card ${visibleCards[`product-${index}`] ? 'visible' : ''}`}
                                data-animate-id={`product-${index}`}
                            >
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    <Badge value={`-${product.discount}%`} severity="danger" className="discount-badge" />
                                </div>
                                
                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <div className="product-rating">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <i 
                                                    key={i} 
                                                    className={`pi ${i < Math.floor(product.rating) ? 'pi-star-fill' : 'pi-star'}`}
                                                ></i>
                                            ))}
                                        </div>
                                        <span className="rating-number">({product.rating})</span>
                                    </div>
                                    
                                    <div className="product-benefits">
                                        {product.benefits.map((benefit, i) => (
                                            <span key={i} className="benefit-tag">{benefit}</span>
                                        ))}
                                    </div>
                                    
                                    <div className="product-pricing">
                                        <span className="current-price">${product.price.toLocaleString()}</span>
                                        <span className="original-price">${product.originalPrice.toLocaleString()}</span>
                                    </div>
                                    
                                    <Button
                                        label="Ver Detalles"
                                        icon="pi pi-eye"
                                        className="product-btn"
                                        onClick={() => navigate(`/productos/${product.id}`)}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Filtros de Categoría */}
                {selectedCategory && (
                    <section className="category-filter-section">
                        <Card className="filter-card">
                            <div className="filter-header">
                                <h3>
                                    <i className="pi pi-filter"></i>
                                    Filtrando por: {categories.find(c => c.id === selectedCategory)?.name}
                                </h3>
                                <Button
                                    label="Ver todos"
                                    icon="pi pi-times"
                                    className="clear-filter-btn"
                                    onClick={() => setSelectedCategory(null)}
                                    outlined
                                    size="small"
                                />
                            </div>
                        </Card>
                    </section>
                )}

                {/* Alertas Nutricionales */}
                <section className="alerts-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="pi pi-bell"></i>
                            Alertas Nutricionales
                            <Badge value={filteredAlerts.length} severity="info" className="ml-2" />
                        </h2>
                        <p className="section-subtitle">
                            Mantente informado sobre las mejores ofertas y novedades
                        </p>
                        <Divider />
                    </div>
                    
                    <div className="alerts-grid">
                        {filteredAlerts.map((alert, index) => (
                            <Card
                                key={alert.id}
                                className={`alert-card ${alert.type} ${visibleCards[`alert-${index}`] ? 'visible' : ''}`}
                                data-animate-id={`alert-${index}`}
                            >
                                <div className="alert-header">
                                    <div className="alert-icon">
                                        <i className={`pi ${alert.type === 'success' ? 'pi-check-circle' : 
                                                           alert.type === 'warning' ? 'pi-exclamation-triangle' : 'pi-info-circle'}`}></i>
                                    </div>
                                    <div className="alert-priority">
                                        <Badge 
                                            value={alert.priority === 'high' ? 'Urgente' : 'Normal'} 
                                            severity={alert.priority === 'high' ? 'danger' : 'info'}
                                        />
                                    </div>
                                </div>
                                
                                <div className="alert-content">
                                    <h4>{alert.title}</h4>
                                    <p>{alert.message}</p>
                                    
                                    <div className="alert-details">
                                        <div className="discount-info">
                                            <i className="pi pi-percentage"></i>
                                            <span>Hasta {alert.discount} OFF</span>
                                        </div>
                                        <div className="validity-info">
                                            <i className="pi pi-calendar"></i>
                                            <span>Válido hasta {new Date(alert.validUntil).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="alert-actions">
                                    <Button
                                        label="Ver Ofertas"
                                        icon="pi pi-external-link"
                                        className="alert-btn"
                                        onClick={() => handleCategoryClick(alert.category)}
                                        size="small"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                    
                    <div className="alerts-footer">
                        <Button
                            label="Ver Todas las Alertas"
                            icon="pi pi-arrow-right"
                            className="view-all-alerts-btn"
                            onClick={() => navigate('/alertas')}
                            outlined
                        />
                    </div>
                </section>

                {/* Newsletter Nutricional */}
                <section className="newsletter-section">
                    <Card className="newsletter-card">
                        <div className="newsletter-content">
                            <div className="newsletter-icon">
                                <i className="pi pi-envelope"></i>
                            </div>
                            <div className="newsletter-text">
                                <h3>¿Querés recibir consejos nutricionales?</h3>
                                <p>Suscribite y recibí tips, recetas saludables y ofertas exclusivas en productos nutricionales</p>
                            </div>
                            <div className="newsletter-form">
                                <InputText
                                    placeholder="Tu email aquí..."
                                    className="newsletter-input"
                                />
                                <Button
                                    label="Suscribirse"
                                    icon="pi pi-send"
                                    className="newsletter-btn"
                                />
                            </div>
                        </div>
                        <div className="newsletter-benefits">
                            <div className="benefit-item">
                                <i className="pi pi-check"></i>
                                <span>Recetas saludables semanales</span>
                            </div>
                            <div className="benefit-item">
                                <i className="pi pi-check"></i>
                                <span>Descuentos exclusivos hasta 40%</span>
                            </div>
                            <div className="benefit-item">
                                <i className="pi pi-check"></i>
                                <span>Consejos de nutricionistas</span>
                            </div>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}

export default Nutricional;