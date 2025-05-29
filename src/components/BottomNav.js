// src/components/BottomNav.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from 'primereact/badge';
import '../styles/BottomNav.css';

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { 
            label: 'Home', 
            icon: 'pi pi-home', 
            path: '/',
            notifications: 0,
            color: '#667eea'
        },
        { 
            label: 'Nutricional', 
            icon: 'pi pi-apple', 
            path: '/nutricional',
            notifications: 0,
            color: '#28a745'
        },
        { 
            label: 'Productos', 
            icon: 'pi pi-box', 
            path: '/productos',
            notifications: 5, // ofertas nuevas
            color: '#ffc107'
        },
        { 
            label: 'Sucursales', 
            icon: 'pi pi-map-marker', 
            path: '/sucursales',
            notifications: 2, // nuevas sucursales
            color: '#dc3545'
        },
        { 
            label: 'Reseñas', 
            icon: 'pi pi-star', 
            path: '/resenas',
            notifications: 3,
            color: '#17a2b8'
        },
        { 
            label: 'Perfil', 
            icon: 'pi pi-user', 
            path: '/perfil',
            notifications: 0,
            color: '#6f42c1'
        }
    ];

    const currentTabIndex = tabs.findIndex(tab => tab.path === location.pathname);
    const currentTab = tabs[currentTabIndex];

    return (
        <div className="bottom-nav">
            <div 
                className="bottom-nav-indicator" 
                style={{ 
                    left: `${currentTabIndex >= 0 ? (currentTabIndex * (100 / tabs.length)) : 0}%`,
                    width: `${100 / tabs.length}%`,
                    backgroundColor: currentTab?.color || '#667eea'
                }} 
            />
            
            {tabs.map((tab, index) => (
                <div
                    key={index}
                    className={`bottom-nav-item ${location.pathname === tab.path ? 'active' : ''}`}
                    onClick={() => navigate(tab.path)}
                    style={{ '--tab-color': tab.color }}
                >
                    <div className="nav-icon-container">
                        <i 
                            className={`bottom-nav-icon ${tab.icon}`}
                            style={{ 
                                color: location.pathname === tab.path ? tab.color : '#7a7a7a'
                            }}
                        />
                        {tab.notifications > 0 && (
                            <Badge 
                                value={tab.notifications} 
                                severity="danger" 
                                className="nav-badge"
                            />
                        )}
                    </div>
                    <span 
                        className="bottom-nav-label"
                        style={{ 
                            color: location.pathname === tab.path ? tab.color : '#7a7a7a'
                        }}
                    >
                        {tab.label}
                    </span>
                    
                    {/* Ripple effect element */}
                    <div className="ripple-effect"></div>
                </div>
            ))}
        </div>
    );
}

export default BottomNav;