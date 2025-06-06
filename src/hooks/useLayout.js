// src/hooks/useLayout.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para gestionar el layout de la aplicación
 * Proporciona información y utilidades para Header y BottomNav
 */
export const useLayout = () => {
    const [layoutInfo, setLayoutInfo] = useState({
        headerHeight: 70,
        bottomNavHeight: 75,
        safeAreaBottom: 0,
        viewportHeight: window.innerHeight,
        contentHeight: 0,
        isLandscape: false,
        isMobile: false
    });

    // Detectar cambios en el viewport
    const updateLayoutInfo = useCallback(() => {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const isLandscape = vw > vh;
        const isMobile = vw <= 768;
        
        // Obtener safe area si está disponible
        const safeAreaBottom = parseFloat(
            getComputedStyle(document.documentElement)
                .getPropertyValue('--app-safe-area-bottom')
                .replace('px', '')
        ) || 0;

        // Calcular alturas según el dispositivo
        let headerHeight = 70;
        let bottomNavHeight = 75;

        if (isMobile) {
            if (vw <= 360) {
                headerHeight = 55;
                bottomNavHeight = 55;
            } else if (vw <= 480) {
                headerHeight = 60;
                bottomNavHeight = 60;
            } else {
                headerHeight = 65;
                bottomNavHeight = 65;
            }
        }

        // Ajuste para landscape en móviles
        if (isLandscape && isMobile && vh <= 500) {
            headerHeight = 50;
            bottomNavHeight = 50;
        }

        const contentHeight = vh - headerHeight - bottomNavHeight - safeAreaBottom;

        setLayoutInfo({
            headerHeight,
            bottomNavHeight,
            safeAreaBottom,
            viewportHeight: vh,
            contentHeight,
            isLandscape,
            isMobile
        });

        // Actualizar variables CSS
        document.documentElement.style.setProperty('--app-header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--app-bottom-nav-height', `${bottomNavHeight}px`);
    }, []);

    // Effect para escuchar cambios de viewport
    useEffect(() => {
        updateLayoutInfo();

        const handleResize = () => {
            updateLayoutInfo();
        };

        const handleOrientationChange = () => {
            // Delay para esperar a que se complete el cambio de orientación
            setTimeout(updateLayoutInfo, 100);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, [updateLayoutInfo]);

    // Utilidades para el layout
    const getContentStyle = useCallback((options = {}) => {
        const {
            hasHeader = true,
            hasBottomNav = true,
            extraBottomSpace = 0,
            extraTopSpace = 0
        } = options;

        const style = {};

        if (hasHeader) {
            style.paddingTop = `${layoutInfo.headerHeight + extraTopSpace}px`;
        }

        if (hasBottomNav) {
            const totalBottomSpace = layoutInfo.bottomNavHeight + 
                                   layoutInfo.safeAreaBottom + 
                                   extraBottomSpace;
            style.paddingBottom = `${totalBottomSpace}px`;
        }

        return style;
    }, [layoutInfo]);

    const getFullHeightStyle = useCallback((options = {}) => {
        const {
            hasHeader = true,
            hasBottomNav = true
        } = options;

        let height = layoutInfo.viewportHeight;

        if (hasHeader) {
            height -= layoutInfo.headerHeight;
        }

        if (hasBottomNav) {
            height -= (layoutInfo.bottomNavHeight + layoutInfo.safeAreaBottom);
        }

        return {
            height: `${height}px`,
            minHeight: `${height}px`
        };
    }, [layoutInfo]);

    const getFabStyle = useCallback((position = 'bottom-right') => {
        const baseStyle = {
            position: 'fixed',
            zIndex: 1000
        };

        const spacing = layoutInfo.isMobile ? '0.75rem' : '1rem';
        const bottomSpace = layoutInfo.bottomNavHeight + layoutInfo.safeAreaBottom;

        switch (position) {
            case 'bottom-right':
                return {
                    ...baseStyle,
                    bottom: `calc(${bottomSpace}px + ${spacing})`,
                    right: spacing
                };
            case 'bottom-left':
                return {
                    ...baseStyle,
                    bottom: `calc(${bottomSpace}px + ${spacing})`,
                    left: spacing
                };
            case 'bottom-center':
                return {
                    ...baseStyle,
                    bottom: `calc(${bottomSpace}px + ${spacing})`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                };
            default:
                return baseStyle;
        }
    }, [layoutInfo]);

    // Función para scroll suave a un elemento
    const scrollToElement = useCallback((elementId, offset = 0) => {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - layoutInfo.headerHeight - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, [layoutInfo.headerHeight]);

    // Función para detectar si un elemento está visible
    const isElementVisible = useCallback((elementId) => {
        const element = document.getElementById(elementId);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const headerHeight = layoutInfo.headerHeight;
        const bottomNavHeight = layoutInfo.bottomNavHeight + layoutInfo.safeAreaBottom;

        return (
            rect.top >= headerHeight &&
            rect.bottom <= (window.innerHeight - bottomNavHeight)
        );
    }, [layoutInfo]);

    return {
        layoutInfo,
        getContentStyle,
        getFullHeightStyle,
        getFabStyle,
        scrollToElement,
        isElementVisible,
        updateLayoutInfo
    };
};

/**
 * Hook simplificado para obtener solo las dimensiones
 */
export const useLayoutDimensions = () => {
    const { layoutInfo } = useLayout();
    return layoutInfo;
};

/**
 * Hook para componentes que necesitan responder a cambios de orientación
 */
export const useOrientation = () => {
    const { layoutInfo } = useLayout();
    
    return {
        isLandscape: layoutInfo.isLandscape,
        isMobile: layoutInfo.isMobile,
        isPortrait: !layoutInfo.isLandscape
    };
};

export default useLayout;