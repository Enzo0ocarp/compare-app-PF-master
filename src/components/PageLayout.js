// src/components/PageLayout.js
import React from 'react';
import '../styles/PageLayout.css';
import Header from './Header';
import BottomNav from './BottomNav';

/**
 * Componente de layout que maneja el espaciado para BottomNav
 * Evita que el contenido quede tapado por la navegación inferior
 */
const PageLayout = ({ 
    children, 
    className = "",
    hasBottomNav = true,
    hasHeader = true,
    fullHeight = false,
    padding = "default" // "none", "small", "default", "large"
}) => {
    const getLayoutClasses = () => {
        const classes = ['page-layout'];
        
        if (hasBottomNav) classes.push('has-bottom-nav');
        if (hasHeader) classes.push('has-header');
        if (fullHeight) classes.push('full-height');
        
        classes.push(`padding-${padding}`);
        
        if (className) classes.push(className);
        
        return classes.join(' ');
    };

    return (
        <div className={getLayoutClasses()}>
            {hasHeader && <Header/>}
            <main className="page-main">
                {children}
            </main>
            {hasBottomNav && <BottomNav/>}
        </div>
    );
};

export default PageLayout;