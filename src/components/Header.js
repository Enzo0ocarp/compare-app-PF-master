// Header.js - Versión Corregida con Namespace
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import { auth } from '../functions/src/firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import logo from '../img/logo.jpg';
import '../styles/Header.css';

/**
 * Componente de encabezado optimizado con namespace correcto
 * CORREGIDO: Ahora aplica el namespace .app-header para evitar conflictos
 */
const Header = ({ 
    projectLogo, 
    onSearch, 
    showThemeToggle = true, 
    showNotifications = true,
    className = ""
}) => {
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const menuRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Detectar tema del sistema y aplicar
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        setDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark);
    }, []);

    // Aplicar tema al DOM
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Listener de autenticación
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                loadUserNotifications();
            } else {
                setNotifications([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Cargar notificaciones (simuladas)
    const loadUserNotifications = () => {
        const mockNotifications = [
            { 
                id: 1, 
                text: 'Nueva oferta disponible en DIA', 
                type: 'info', 
                unread: true,
                time: 'Hace 2 horas',
                url: '/productos?filter=ofertas'
            },
            { 
                id: 2, 
                text: 'Precio actualizado en tu lista de favoritos', 
                type: 'success', 
                unread: true,
                time: 'Hace 1 hora',
                url: '/favoritos'
            }
        ];
        setNotifications(mockNotifications);
    };

    const toggleTheme = () => setDarkMode(!darkMode);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            navigate(`/productos?search=${encodedQuery}`);
            setSearchQuery('');
            if (onSearch) onSearch(searchQuery.trim());
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const navigateToPage = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleNotificationClick = (event) => {
        notificationsRef.current.toggle(event);
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, unread: false }
                    : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, unread: false }))
        );
    };

    const handleNotificationAction = (notification) => {
        markNotificationAsRead(notification.id);
        if (notification.url) {
            navigateToPage(notification.url);
        }
        notificationsRef.current.hide();
    };

    const userMenuItems = user ? [
        {
            label: 'Mi Perfil',
            icon: 'pi pi-user',
            command: () => navigateToPage('/perfil')
        },
        {
            label: 'Mis Favoritos',
            icon: 'pi pi-heart',
            command: () => navigateToPage('/favoritos')
        },
        {
            label: 'Configuración',
            icon: 'pi pi-cog',
            command: () => navigateToPage('/configuracion')
        },
        { separator: true },
        {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: handleLogout
        }
    ] : [];

    const unreadCount = notifications.filter(n => n.unread).length;
    const isActiveRoute = (path) => location.pathname === path;

    const notificationsTemplate = () => (
        <div className="notifications-panel">
            <div className="notifications-header">
                <h4>Notificaciones</h4>
                {unreadCount > 0 && (
                    <Button
                        label="Marcar todas"
                        onClick={markAllAsRead}
                        text
                        size="small"
                    />
                )}
            </div>
            <div className="notifications-list">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.unread ? 'unread' : ''}`}
                            onClick={() => handleNotificationAction(notification)}
                        >
                            <div className="notification-icon">
                                <i className="pi pi-info-circle"></i>
                            </div>
                            <div className="notification-content">
                                <span>{notification.text}</span>
                                <small>{notification.time}</small>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-notifications">
                        <i className="pi pi-bell-slash"></i>
                        <span>No hay notificaciones</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        // ✅ NAMESPACE PRINCIPAL APLICADO
        <div className={`app-header ${className}`} data-theme={darkMode ? 'dark' : 'light'}>
            <header className="header-container">
                <div className="header-content">
                    {/* Logo y marca */}
                    <div className="header-left">
                        <button 
                            className="mobile-menu-toggle"
                            onClick={toggleMobileMenu}
                            aria-label="Abrir menú"
                        >
                            <i className={`pi ${isMobileMenuOpen ? 'pi-times' : 'pi-bars'}`}></i>
                        </button>
                        
                        <div 
                            className="header-brand" 
                            onClick={() => navigateToPage('/')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    navigateToPage('/');
                                }
                            }}
                        >
                            <div className="header-logo-container">
                                <img 
                                    src={projectLogo || logo} 
                                    alt="Compare Logo" 
                                    className="header-logo" 
                                    onError={(e) => e.target.src = logo}
                                />
                            </div>
                            <div className="brand-text">
                                <h2>Compare</h2>
                                <small>Ahorrá inteligente</small>
                            </div>
                        </div>
                    </div>

                    {/* Navegación desktop */}
                    <nav className="desktop-nav">
                        <Button
                            label="Productos"
                            icon="pi pi-shopping-bag"
                            className={`nav-button ${isActiveRoute('/productos') ? 'active' : ''}`}
                            onClick={() => navigateToPage('/productos')}
                            text
                        />
                        <Button
                            label="Sucursales"
                            icon="pi pi-map-marker"
                            className={`nav-button ${isActiveRoute('/sucursales') ? 'active' : ''}`}
                            onClick={() => navigateToPage('/sucursales')}
                            text
                        />
                        <Button
                            label="Ofertas"
                            icon="pi pi-tag"
                            className={`nav-button ${isActiveRoute('/ofertas') ? 'active' : ''}`}
                            onClick={() => navigateToPage('/ofertas')}
                            text
                        />
                    </nav>

                    {/* Búsqueda */}
                    <div className="header-search">
                        <form onSubmit={handleSearch} className="search-form">
                            <InputText
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar productos..."
                                className="search-input"
                            />
                            <Button
                                type="submit"
                                icon="pi pi-search"
                                className="search-button"
                                disabled={!searchQuery.trim()}
                                aria-label="Buscar"
                            />
                        </form>
                    </div>

                    {/* Acciones */}
                    <div className="header-actions">
                        {/* Tema */}
                        {showThemeToggle && (
                            <Button
                                icon={darkMode ? "pi pi-sun" : "pi pi-moon"}
                                className="theme-toggle"
                                onClick={toggleTheme}
                                tooltip={darkMode ? "Modo claro" : "Modo oscuro"}
                                tooltipOptions={{ position: 'bottom' }}
                                rounded
                                text
                                aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                            />
                        )}

                        {/* Notificaciones */}
                        {user && showNotifications && (
                            <>
                                <Button
                                    icon="pi pi-bell"
                                    className="notification-button"
                                    onClick={handleNotificationClick}
                                    tooltip="Notificaciones"
                                    tooltipOptions={{ position: 'bottom' }}
                                    rounded
                                    text
                                    aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
                                >
                                    {unreadCount > 0 && (
                                        <Badge value={unreadCount} severity="info" />
                                    )}
                                </Button>
                                
                                <OverlayPanel 
                                    ref={notificationsRef} 
                                    className="notifications-overlay"
                                    dismissable
                                >
                                    {notificationsTemplate()}
                                </OverlayPanel>
                            </>
                        )}

                        {/* Usuario o Login */}
                        {user ? (
                            <div className="user-menu">
                                <Menu
                                    model={userMenuItems}
                                    popup
                                    ref={menuRef}
                                    popupAlignment="right"
                                />
                                <Button
                                    className="user-avatar"
                                    onClick={(event) => menuRef.current.toggle(event)}
                                    tooltip={`Hola, ${user.displayName || user.email}`}
                                    tooltipOptions={{ position: 'bottom' }}
                                    rounded
                                    aria-label="Menú de usuario"
                                >
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt="Avatar del usuario"
                                            className="avatar-image"
                                        />
                                    ) : (
                                        <i className="pi pi-user"></i>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                label="Iniciar Sesión"
                                icon="pi pi-sign-in"
                                className="login-button"
                                onClick={() => navigateToPage('/login')}
                                outlined
                                size="small"
                            />
                        )}
                    </div>
                </div>

                {/* Menú móvil */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div 
                        className="mobile-menu-overlay" 
                        onClick={toggleMobileMenu}
                        aria-label="Cerrar menú"
                    ></div>
                    <div className="mobile-menu-content">
                        {/* Header del menú móvil */}
                        <div className="mobile-menu-header">
                            <div className="mobile-user-profile">
                                {user ? (
                                    <>
                                        <div className="mobile-avatar">
                                            {user.photoURL ? (
                                                <img 
                                                    src={user.photoURL} 
                                                    alt="Avatar del usuario" 
                                                    className="avatar-image"
                                                />
                                            ) : (
                                                <i className="pi pi-user"></i>
                                            )}
                                        </div>
                                        <div className="mobile-user-details">
                                            <span className="user-name">
                                                {user.displayName || user.email}
                                            </span>
                                            <small className="user-email">{user.email}</small>
                                        </div>
                                    </>
                                ) : (
                                    <div className="mobile-guest">
                                        <i className="pi pi-user"></i>
                                        <span>Invitado</span>
                                    </div>
                                )}
                            </div>
                            <Button
                                icon="pi pi-times"
                                onClick={toggleMobileMenu}
                                rounded
                                text
                                aria-label="Cerrar menú"
                            />
                        </div>

                        {/* Navegación móvil */}
                        <nav className="mobile-nav">
                            <Button
                                label="Inicio"
                                icon="pi pi-home"
                                className={`mobile-nav-button ${isActiveRoute('/') ? 'active' : ''}`}
                                onClick={() => navigateToPage('/')}
                                text
                            />
                            <Button
                                label="Productos"
                                icon="pi pi-shopping-bag"
                                className={`mobile-nav-button ${isActiveRoute('/productos') ? 'active' : ''}`}
                                onClick={() => navigateToPage('/productos')}
                                text
                            />
                            <Button
                                label="Sucursales"
                                icon="pi pi-map-marker"
                                className={`mobile-nav-button ${isActiveRoute('/sucursales') ? 'active' : ''}`}
                                onClick={() => navigateToPage('/sucursales')}
                                text
                            />
                            <Button
                                label="Ofertas"
                                icon="pi pi-tag"
                                className={`mobile-nav-button ${isActiveRoute('/ofertas') ? 'active' : ''}`}
                                onClick={() => navigateToPage('/ofertas')}
                                text
                            />
                            
                            {/* Opciones para usuarios autenticados */}
                            {user && (
                                <>
                                    <div style={{ 
                                        height: '1px', 
                                        background: 'var(--header-border)', 
                                        margin: '1rem 1.5rem' 
                                    }}></div>
                                    <Button
                                        label="Mi Perfil"
                                        icon="pi pi-user"
                                        className="mobile-nav-button"
                                        onClick={() => navigateToPage('/perfil')}
                                        text
                                    />
                                    <Button
                                        label="Mis Favoritos"
                                        icon="pi pi-heart"
                                        className="mobile-nav-button"
                                        onClick={() => navigateToPage('/favoritos')}
                                        text
                                    />
                                    <Button
                                        label="Configuración"
                                        icon="pi pi-cog"
                                        className="mobile-nav-button"
                                        onClick={() => navigateToPage('/configuracion')}
                                        text
                                    />
                                </>
                            )}
                        </nav>

                        {/* Footer del menú móvil */}
                        <div className="mobile-menu-footer">
                            {user ? (
                                <Button
                                    label="Cerrar Sesión"
                                    icon="pi pi-sign-out"
                                    className="mobile-logout-button"
                                    onClick={handleLogout}
                                    severity="danger"
                                    text
                                />
                            ) : (
                                <Button
                                    label="Iniciar Sesión"
                                    icon="pi pi-sign-in"
                                    className="mobile-login-button"
                                    onClick={() => navigateToPage('/login')}
                                    outlined
                                />
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;