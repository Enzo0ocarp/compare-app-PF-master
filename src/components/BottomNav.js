import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import '../styles/BottomNav.css';

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { label: 'Home', icon: 'pi pi-home', path: '/' },
        { label: 'Nutricional', icon: 'pi pi-apple', path: '/nutricional' },
        { label: 'Productos', icon: 'pi pi-box', path: '/productos' },
        { label: 'Reseñas', icon: 'pi pi-star', path: '/resenas' },
        { label: 'Perfil', icon: 'pi pi-user', path: '/perfil' }
    ];

    return (
        <div className="bottom-nav">
            {tabs.map((tab, index) => (
                <div
                    key={index}
                    className={`bottom-nav-item ${location.pathname === tab.path ? 'active' : ''}`}
                    onClick={() => navigate(tab.path)}
                >
                    <i className={`bottom-nav-icon ${tab.icon}`} />
                    <span className="bottom-nav-label">{tab.label}</span>
                </div>
            ))}
            <div className="bottom-nav-indicator" style={{ left: `${tabs.findIndex(tab => tab.path === location.pathname) * 20}%` }} />
        </div>
    );
}

export default BottomNav;
