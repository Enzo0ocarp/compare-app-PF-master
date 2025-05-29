// src/components/Header.js - Versión Corregida Sin Carrito y con Logo Mejorado
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

const Header = ({ projectLogo }) => {
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const menuRef = useRef(null);
    const searchRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Detectar tema del sistema
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        } else {
            setDarkMode(prefersDark);
        }
    }, []);

    // Aplicar tema
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.setAttribute('data-theme', 'light');
        }
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Auth state listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Simular notificaciones para usuarios autenticados
                setNotifications([
                    { 
                        id: 1, 
                        text: 'Nueva oferta disponible en DIA', 
                        type: 'info', 
                        unread: true,
                        time: 'Hace 2 horas'
                    },
                    { 
                        id: 2, 
                        text: 'Precio actualizado en tu lista de favoritos', 
                        type: 'success', 
                        unread: true,
                        time: 'Hace 1 hora'
                    },
                    { 
                        id: 3, 
                        text: 'Nuevos productos disponibles en Carrefour', 
                        type: 'info', 
                        unread: false,
                        time: 'Hace 3 horas'
                    }
                ]);
            } else {
                setNotifications([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Cerrar búsqueda expandida al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

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
            navigate(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchExpanded(false);
            setSearchQuery('');
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

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
            label: 'Historial',
            icon: 'pi pi-history',
            command: () => navigateToPage('/historial')
        },
        {
            label: 'Configuración',
            icon: 'pi pi-cog',
            command: () => navigateToPage('/configuracion')
        },
        {
            separator: true
        },
        {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: handleLogout,
            className: 'logout-item'
        }
    ] : [];

    const unreadCount = notifications.filter(n => n.unread).length;

    const notificationsTemplate = () => (
        <div className="notifications-panel">
            <div className="notifications-header">
                <h4>Notificaciones</h4>
                {unreadCount > 0 && (
                    <Button
                        label="Marcar todas como leídas"
                        onClick={markAllAsRead}
                        text
                        size="small"
                        className="mark-all-read-btn"
                    />
                )}
            </div>
            <div className="notifications-list">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.unread ? 'unread' : ''}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                        >
                            <div className={`notification-icon ${notification.type}`}>
                                <i className={`pi ${notification.type === 'info' ? 'pi-info-circle' : 'pi-check-circle'}`}></i>
                            </div>
                            <div className="notification-content">
                                <span>{notification.text}</span>
                                <small>{notification.time}</small>
                            </div>
                            {notification.unread && (
                                <div className="unread-indicator"></div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-notifications">
                        <i className="pi pi-bell-slash"></i>
                        <span>No hay notificaciones</span>
                    </div>
                )}
            </div>
            <div className="notifications-footer">
                <Button
                    label="Ver todas las notificaciones"
                    className="view-all-notifications"
                    onClick={() => navigateToPage('/notificaciones')}
                    text
                    size="small"
                />
            </div>
        </div>
    );

    return (
        <header className="header-container">
            <div className="header-content">
                {/* Logo y marca */}
                <div className="header-left">
                    <button 
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label="Abrir menú"
                    >
                        <i className="pi pi-bars"></i>
                    </button>
                    
                    <div className="header-brand" onClick={() => navigateToPage('/')}>
                        <div className="header-logo-container">
                            <img 
                                src={projectLogo || logo} 
                                alt="Compare Logo" 
                                className="header-logo" 
                            />
                        </div>
                        <div className="brand-text">
                            <h2>Compare</h2>
                            <small>Ahorrá inteligente</small>
                        </div>
                    </div>
                </div>

                {/* Navegación desktop */}
                <nav className="header-nav desktop-nav">
                    <Button
                        label="Productos"
                        icon="pi pi-shopping-bag"
                        className={`nav-button ${location.pathname === '/productos' ? 'active' : ''}`}
                        onClick={() => navigateToPage('/productos')}
                        text
                    />
                    <Button
                        label="Sucursales"
                        icon="pi pi-map-marker"
                        className={`nav-button ${location.pathname === '/sucursales' ? 'active' : ''}`}
                        onClick={() => navigateToPage('/sucursales')}
                        text
                    />
                    <Button
                        label="Ofertas"
                        icon="pi pi-tag"
                        className={`nav-button ${location.pathname === '/ofertas' ? 'active' : ''}`}
                        onClick={() => navigateToPage('/ofertas')}
                        text
                    />
                </nav>

                {/* Barra de búsqueda */}
                <div className={`header-search ${isSearchExpanded ? 'expanded' : ''}`} ref={searchRef}>
                    <form onSubmit={handleSearch} className="search-form">
                        <InputText
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar productos..."
                            className="search-input"
                            onFocus={() => setIsSearchExpanded(true)}
                        />
                        <Button
                            type="submit"
                            icon="pi pi-search"
                            className="search-button"
                            disabled={!searchQuery.trim()}
                        />
                    </form>
                    
                    {/* Sugerencias de búsqueda */}
                    {isSearchExpanded && searchQuery.length > 2 && (
                        <div className="search-suggestions">
                            <div className="suggestion-item" onClick={() => {
                                setSearchQuery('leche');
                                handleSearch({ preventDefault: () => {} });
                            }}>
                                <i className="pi pi-search"></i>
                                <span>leche</span>
                            </div>
                            <div className="suggestion-item" onClick={() => {
                                setSearchQuery('pan');
                                handleSearch({ preventDefault: () => {} });
                            }}>
                                <i className="pi pi-search"></i>
                                <span>pan</span>
                            </div>
                            <div className="suggestion-item" onClick={() => {
                                setSearchQuery('aceite');
                                handleSearch({ preventDefault: () => {} });
                            }}>
                                <i className="pi pi-search"></i>
                                <span>aceite</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Acciones del header */}
                <div className="header-actions">
                    {/* Botón de tema */}
                    <Button
                        icon={darkMode ? "pi pi-sun" : "pi pi-moon"}
                        className="theme-toggle"
                        onClick={toggleTheme}
                        tooltip={darkMode ? "Modo claro" : "Modo oscuro"}
                        tooltipOptions={{ position: "bottom" }}
                        rounded
                        text
                    />

                    {/* Notificaciones */}
                    {user && (
                        <>
                            <Button
                                icon="pi pi-bell"
                                className="notification-button"
                                onClick={handleNotificationClick}
                                tooltip="Notificaciones"
                                tooltipOptions={{ position: "bottom" }}
                                rounded
                                text
                            >
                                {unreadCount > 0 && (
                                    <Badge value={unreadCount} severity="info" />
                                )}
                            </Button>
                            
                            <OverlayPanel 
                                ref={notificationsRef} 
                                className="notifications-overlay"
                                dismissable
                                showCloseIcon
                            >
                                {notificationsTemplate()}
                            </OverlayPanel>
                        </>
                    )}

                    {/* QR Scanner */}
                    <Button
                        icon="pi pi-qrcode"
                        className="qr-button desktop-only"
                        onClick={() => navigateToPage('/scanner')}
                        tooltip="Escanear código QR"
                        tooltipOptions={{ position: "bottom" }}
                        rounded
                        outlined
                    />

                    {/* Usuario */}
                    {user ? (
                        <div className="user-menu">
                            <Menu
                                model={userMenuItems}
                                popup
                                ref={menuRef}
                                id="user-menu"
                                popupAlignment="right"
                            />
                            <Button
                                className="user-avatar"
                                onClick={(event) => menuRef.current.toggle(event)}
                                tooltip={`Hola, ${user.displayName || user.email}`}
                                tooltipOptions={{ position: "bottom" }}
                                rounded
                            >
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Avatar"
                                        className="avatar-image"
                                    />
                                ) : (
                                    <i className="pi pi-user"></i>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Button
                                label="Iniciar Sesión"
                                icon="pi pi-sign-in"
                                className="login-button desktop-only"
                                onClick={() => navigateToPage('/login')}
                                outlined
                                size="small"
                            />
                            <Button
                                icon="pi pi-sign-in"
                                className="login-button mobile-only"
                                onClick={() => navigateToPage('/login')}
                                rounded
                                outlined
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Menú móvil */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-overlay" onClick={toggleMobileMenu}></div>
                <div className="mobile-menu-content">
                    <div className="mobile-menu-header">
                        <div className="mobile-user-info">
                            {user ? (
                                <div className="mobile-user-profile">
                                    <div className="mobile-avatar">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Avatar" />
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
                                </div>
                            ) : (
                                <div className="mobile-guest">
                                    <i className="pi pi-user"></i>
                                    <span>Invitado</span>
                                </div>
                            )}
                        </div>
                        <Button
                            icon="pi pi-times"
                            className="close-mobile-menu"
                            onClick={toggleMobileMenu}
                            rounded
                            text
                        />
                    </div>

                    <nav className="mobile-nav">
                        <Button
                            label="Inicio"
                            icon="pi pi-home"
                            className={`mobile-nav-button ${location.pathname === '/' ? 'active' : ''}`}
                            onClick={() => navigateToPage('/')}
                            text
                        />
                        <Button
                            label="Productos"
                            icon="pi pi-shopping-bag"
                            className={`mobile-nav-button ${location.pathname === '/productos' ? 'active' : ''}`}
                            onClick={() => navigateToPage('/productos')}
                            text
                        />
                        <Button
                            label="Sucursales"
                            icon="pi pi-map-marker"
                            className={`mobile-nav-button ${location.pathname === '/sucursales' ? 'active' : ''}`}
                            onClick={() => navigateToPage('/sucursales')}
                            text
                        />
                        <Button
                            label="Ofertas"
                            icon="pi pi-tag"
                            className={`mobile-nav-button ${location.pathname === '/ofertas' ? 'active' : ''}`}
                            onClick={() => navigateToPage('/ofertas')}
                            text
                        />
                        <Button
                            label="Scanner QR"
                            icon="pi pi-qrcode"
                            className="mobile-nav-button"
                            onClick={() => navigateToPage('/scanner')}
                            text
                        />
                        
                        {user && (
                            <>
                                <div className="mobile-nav-divider"></div>
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
                                    label="Historial"
                                    icon="pi pi-history"
                                    className="mobile-nav-button"
                                    onClick={() => navigateToPage('/historial')}
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
                            <div className="mobile-auth-buttons">
                                <Button
                                    label="Iniciar Sesión"
                                    icon="pi pi-sign-in"
                                    className="mobile-login-button"
                                    onClick={() => navigateToPage('/login')}
                                    outlined
                                />
                                <Button
                                    label="Registrarse"
                                    icon="pi pi-user-plus"
                                    className="mobile-register-button"
                                    onClick={() => navigateToPage('/register')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;