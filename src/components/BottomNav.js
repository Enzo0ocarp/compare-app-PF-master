/**
 * @fileoverview Componente de navegación inferior para aplicación móvil
 * @description Barra de navegación fija en la parte inferior con tabs y
 * indicador visual de tab activo para una experiencia móvil moderna.
 * @author Compare Team
 * @version 1.0.0
 * @since 2025
 */

// src/components/BottomNav.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

/**
 * @typedef {Object} NavigationTab
 * @property {string} label - Texto descriptivo del tab
 * @property {string} icon - Clase CSS del ícono de PrimeIcons
 * @property {string} path - Ruta de navegación de React Router
 * @property {string} color - Color temático del tab en formato hexadecimal
 */

/**
 * @component BottomNav
 * @description Componente de navegación inferior que proporciona acceso rápido a las
 * principales secciones de la aplicación. Incluye:
 * 
 * Características principales:
 * - 6 tabs de navegación principales
 * - Indicador visual deslizante del tab activo
 * - Efectos de ripple en cada tap
 * - Colores temáticos personalizados por sección
 * - Diseño responsive optimizado para móviles
 * - Integración completa con React Router
 * - Z-index bajo para no interferir con otros elementos
 * 
 * Secciones incluidas:
 * - Home: Página principal
 * - Nutricional: Productos saludables
 * - Productos: Catálogo completo
 * - Sucursales: Ubicaciones de tiendas
 * - Reseñas: Comentarios de usuarios
 * - Perfil: Configuración de usuario
 * 
 * @returns {JSX.Element} Barra de navegación inferior
 * 
 * @example
 * // Uso básico (sin props requeridas)
 * <BottomNav />
 * 
 * @example
 * // En una aplicación con Router
 * function App() {
 *   return (
 *     <Router>
 *       <Routes>
 *         <Route path="/" element={<Home />} />
 *         <Route path="/productos" element={<Productos />} />
 *       </Routes>
 *       <BottomNav />
 *     </Router>
 *   );
 * }
 */
function BottomNav() {
    /** @type {Function} Hook de navegación de React Router */
    const navigate = useNavigate();
    
    /** @type {Object} Hook de ubicación actual de React Router */
    const location = useLocation();

    /**
     * @description Configuración de todos los tabs de navegación
     * @type {NavigationTab[]}
     * @readonly
     */
    const tabs = [
        { 
            label: 'Home', 
            icon: 'pi pi-home', 
            path: '/',
            color: '#667eea'
        },
        { 
            label: 'Nutricional', 
            icon: 'pi pi-apple', 
            path: '/nutricional',
            color: '#28a745'
        },
        { 
            label: 'Productos', 
            icon: 'pi pi-box', 
            path: '/productos',
            color: '#ffc107'
        },
        { 
            label: 'Sucursales', 
            icon: 'pi pi-map-marker', 
            path: '/sucursales',
            color: '#dc3545'
        },
        { 
            label: 'Reseñas', 
            icon: 'pi pi-star', 
            path: '/resenas',
            color: '#17a2b8'
        },
        { 
            label: 'Perfil', 
            icon: 'pi pi-user', 
            path: '/perfil',
            color: '#6f42c1'
        }
    ];

    /**
     * @description Encuentra el índice del tab actualmente activo
     * @type {number}
     */
    const currentTabIndex = tabs.findIndex(tab => tab.path === location.pathname);
    
    /**
     * @description Obtiene la configuración del tab actualmente activo
     * @type {NavigationTab|undefined}
     */
    const currentTab = tabs[currentTabIndex];

    /**
     * @description Maneja la navegación cuando se hace clic en un tab
     * @function
     * @param {string} path - Ruta de destino para la navegación
     * 
     * @example
     * handleNavigation('/productos'); // Navega a la página de productos
     */
    const handleNavigation = (path) => {
        navigate(path);
    };

    /**
     * @description Maneja el efecto ripple al hacer clic en un tab
     * @function
     * @param {Event} event - Evento de click del mouse
     * @param {number} tabIndex - Índice del tab clickeado
     * 
     * @example
     * handleRippleEffect(clickEvent, 2); // Crea efecto ripple en tab índice 2
     */
    const handleRippleEffect = (event, tabIndex) => {
        const rippleElement = event.currentTarget.querySelector('.ripple-effect');
        if (rippleElement) {
            // Resetear animación
            rippleElement.style.animation = 'none';
            void rippleElement.offsetHeight; // Trigger reflow
            rippleElement.style.animation = 'ripple 0.6s ease-out';
        }
    };

    /**
     * @description Calcula el porcentaje de posición del indicador deslizante
     * @function
     * @param {number} index - Índice del tab
     * @returns {number} Porcentaje de posición (0-100)
     * 
     * @example
     * getIndicatorPosition(2) // 33.33 (para 6 tabs)
     */
    const getIndicatorPosition = (index) => {
        return index >= 0 ? (index * (100 / tabs.length)) : 0;
    };

    /**
     * @description Obtiene el ancho del indicador como porcentaje
     * @function
     * @returns {number} Ancho del indicador en porcentaje
     * 
     * @example
     * getIndicatorWidth() // 16.67 (para 6 tabs)
     */
    const getIndicatorWidth = () => {
        return 100 / tabs.length;
    };

    /**
     * @description Determina si un tab está activo
     * @function
     * @param {string} tabPath - Ruta del tab a verificar
     * @returns {boolean} true si el tab está activo
     * 
     * @example
     * isTabActive('/productos') // true si estamos en /productos
     */
    const isTabActive = (tabPath) => {
        return location.pathname === tabPath;
    };

    return (
        <nav className="bottom-nav" role="navigation" aria-label="Navegación principal">
            {/* Indicador deslizante del tab activo */}
            <div 
                className="bottom-nav-indicator" 
                style={{ 
                    left: `${getIndicatorPosition(currentTabIndex)}%`,
                    width: `${getIndicatorWidth()}%`,
                    backgroundColor: currentTab?.color || '#667eea',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-hidden="true"
            />
            
            {/* Tabs de navegación */}
            {tabs.map((tab, index) => (
                <button
                    key={`${tab.path}-${index}`}
                    className={`bottom-nav-item ${isTabActive(tab.path) ? 'active' : ''}`}
                    onClick={(event) => {
                        handleRippleEffect(event, index);
                        handleNavigation(tab.path);
                    }}
                    style={{ '--tab-color': tab.color }}
                    aria-label={tab.label}
                    aria-current={isTabActive(tab.path) ? 'page' : undefined}
                    type="button"
                >
                    {/* Contenedor del ícono */}
                    <div className="nav-icon-container">
                        <i 
                            className={`bottom-nav-icon ${tab.icon}`}
                            style={{ 
                                color: isTabActive(tab.path) ? tab.color : '#7a7a7a',
                                fontSize: '1.4rem',
                                transition: 'all 0.2s ease'
                            }}
                            aria-hidden="true"
                        />
                    </div>
                    
                    {/* Etiqueta del tab */}
                    <span 
                        className="bottom-nav-label"
                        style={{ 
                            color: isTabActive(tab.path) ? tab.color : '#7a7a7a',
                            fontSize: '0.7rem',
                            fontWeight: isTabActive(tab.path) ? '600' : '500',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {tab.label}
                    </span>
                    
                    {/* Elemento para efecto ripple */}
                    <div 
                        className="ripple-effect"
                        style={{ '--ripple-color': `${tab.color}20` }}
                        aria-hidden="true"
                    ></div>
                </button>
            ))}
        </nav>
    );
}

export default BottomNav;