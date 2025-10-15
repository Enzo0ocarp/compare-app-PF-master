// Header.js - Versión Corregida SIN modo oscuro y SIN /ofertas
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import { auth, db } from '../functions/src/firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNotification } from './Notification';
import logo from '../img/logo.jpg';
import '../styles/Header.css';

const Header = ({ 
    projectLogo, 
    showNotifications = true,
    className = ""
}) => {
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const menuRef = useRef(null);
    const notificationsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();

    // Listener de autenticación
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Cargar notificaciones REALES desde Firestore
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                const notifs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));
                setNotifications(notifs);
            },
            (error) => {
                console.error('Error cargando notificaciones:', error);
                setNotifications([]);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
            setIsMobileMenuOpen(false);
            showNotification('Sesión cerrada exitosamente', 'success');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            showNotification('Error al cerrar sesión', 'error');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            navigate(`/productos?search=${encodedQuery}`);
            setSearchQuery('');
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

    const markNotificationAsRead = async (notificationId) => {
        try {
            const notifRef = doc(db, 'notifications', notificationId);
            await updateDoc(notifRef, { read: true });
            
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, read: true }
                        : notif
                )
            );
        } catch (error) {
            console.error('Error marcando notificación:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifs = notifications.filter(n => !n.read);
            
            await Promise.all(
                unreadNotifs.map(notif => {
                    const notifRef = doc(db, 'notifications', notif.id);
                    return updateDoc(notifRef, { read: true });
                })
            );
            
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, read: true }))
            );
            
            showNotification('Todas las notificaciones marcadas como leídas', 'success');
        } catch (error) {
            console.error('Error marcando todas:', error);
            showNotification('Error al marcar notificaciones', 'error');
        }
    };

    const handleNotificationAction = async (notification) => {
        await markNotificationAsRead(notification.id);
        if (notification.url) {
            navigateToPage(notification.url);
        }
        notificationsRef.current.hide();
    };

    const formatNotificationTime = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        if (days < 7) return `Hace ${days} días`;
        return date.toLocaleDateString();
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

    const unreadCount = notifications.filter(n => !n.read).length;
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
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationAction(notification)}
                        >
                            <div className="notification-icon">
                                <i className={`pi ${notification.icon || 'pi-info-circle'}`}></i>
                            </div>
                            <div className="notification-content">
                                <span>{notification.message}</span>
                                <small>{formatNotificationTime(notification.createdAt)}</small>
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
        <div className={`app-header ${className}`}>
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

                    {/* Navegación desktop - SIN /ofertas */}
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

                    {/* Acciones - SIN modo oscuro */}
                    <div className="header-actions">
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

                {/* Menú móvil - SIN /ofertas */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div 
                        className="mobile-menu-overlay" 
                        onClick={toggleMobileMenu}
                    ></div>
                    <div className="mobile-menu-content">
                        <div className="mobile-menu-header">
                            <div className="mobile-user-profile">
                                {user ? (
                                    <>
                                        <div className="mobile-avatar">
                                            {user.photoURL ? (
                                                <img 
                                                    src={user.photoURL} 
                                                    alt="Avatar" 
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
                            />
                        </div>

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