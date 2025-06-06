/**
 * @fileoverview Componente tarjeta para mostrar información de sucursales
 * @description Tarjeta informativa que muestra detalles de una sucursal comercial
 * incluyendo ubicación, tipo, acciones de mapas y datos de contacto.
 * @author Compare Team
 * @version 1.0.0
 * @since 2025
 */

// src/components/BranchCard.js
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import '../styles/BranchCard.css';

/**
 * @typedef {Object} Branch
 * @property {string|number} id - Identificador único de la sucursal
 * @property {string} sucursalNombre - Nombre de la sucursal
 * @property {string} [banderaDescripcion] - Marca o cadena comercial
 * @property {string} [direccion] - Dirección física de la sucursal
 * @property {string} [localidad] - Ciudad o localidad
 * @property {string} [provincia] - Provincia donde se ubica
 * @property {string} [sucursalTipo] - Tipo de sucursal (supermercado, autoservicio, etc.)
 * @property {string} [comercioRazonSocial] - Razón social del comercio
 * @property {number} [lat] - Latitud para geolocalización
 * @property {number} [lng] - Longitud para geolocalización
 * @property {string} [telefono] - Número de teléfono
 * @property {string} [email] - Dirección de correo electrónico
 * @property {string} [horarios] - Horarios de atención
 * @property {string} [website] - Sitio web de la sucursal
 */

/**
 * @typedef {Object} BranchCardProps
 * @property {Branch} branch - Datos de la sucursal a mostrar
 * @property {Function} [onLocationClick] - Callback cuando se hace clic en ver ubicación
 * @property {Function} [onDirectionsClick] - Callback cuando se hace clic en direcciones
 * @property {boolean} [showActions] - Si mostrar los botones de acción (default: true)
 * @property {string} [className] - Clases CSS adicionales
 * @property {boolean} [featured] - Si la sucursal está destacada
 * @property {boolean} [closed] - Si la sucursal está cerrada
 * @property {boolean} [loading] - Si está en estado de carga
 */

/**
 * @component BranchCard
 * @description Componente de tarjeta que muestra información detallada de una sucursal.
 * Incluye funcionalidades de integración con Google Maps para ubicación y direcciones.
 * 
 * Características principales:
 * - Información completa de la sucursal
 * - Badge con tipo de sucursal y colores temáticos
 * - Integración con Google Maps (ver ubicación y direcciones)
 * - Formateo inteligente de direcciones
 * - Diseño responsive con PrimeReact Card
 * - Manejo de datos faltantes con fallbacks
 * - Tooltips informativos en botones
 * - Namespace CSS para evitar conflictos
 * 
 * @param {BranchCardProps} props - Props del componente
 * @returns {JSX.Element} Tarjeta de información de sucursal
 * 
 * @example
 * // Uso básico
 * const sucursal = {
 *   id: 1,
 *   sucursalNombre: "Supermercado Central",
 *   banderaDescripcion: "DIA",
 *   direccion: "Av. Corrientes 1234",
 *   localidad: "Buenos Aires",
 *   provincia: "Buenos Aires",
 *   sucursalTipo: "Supermercado",
 *   lat: -34.6037,
 *   lng: -58.3816
 * };
 * 
 * <BranchCard branch={sucursal} />
 * 
 * @example
 * // Con callbacks personalizados y estados
 * <BranchCard 
 *   branch={sucursal}
 *   onLocationClick={(branch) => console.log('Ver ubicación:', branch)}
 *   onDirectionsClick={(branch) => console.log('Direcciones a:', branch)}
 *   showActions={true}
 *   featured={true}
 *   closed={false}
 *   loading={false}
 * />
 */
function BranchCard({ 
    branch, 
    onLocationClick, 
    onDirectionsClick, 
    showActions = true, 
    className = '',
    featured = false,
    closed = false,
    loading = false
}) {
    /**
     * @description Maneja el clic para ver la ubicación en Google Maps
     * @function
     * @since 1.0.0
     * 
     * @example
     * handleViewLocation(); // Abre Google Maps con la ubicación de la sucursal
     */
    const handleViewLocation = () => {
        if (branch.lat && branch.lng) {
            const mapsUrl = `https://www.google.com/maps?q=${branch.lat},${branch.lng}`;
            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
        } else {
            console.warn('Coordenadas no disponibles para la sucursal:', branch.sucursalNombre);
        }
        
        // Ejecutar callback personalizado si existe
        if (onLocationClick) {
            onLocationClick(branch);
        }
    };

    /**
     * @description Maneja el clic para obtener direcciones en Google Maps
     * @function
     * @since 1.0.0
     * 
     * @example
     * handleGetDirections(); // Abre Google Maps con direcciones a la sucursal
     */
    const handleGetDirections = () => {
        if (branch.lat && branch.lng) {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
            window.open(directionsUrl, '_blank', 'noopener,noreferrer');
        } else {
            console.warn('Coordenadas no disponibles para direcciones:', branch.sucursalNombre);
        }
        
        // Ejecutar callback personalizado si existe
        if (onDirectionsClick) {
            onDirectionsClick(branch);
        }
    };

    /**
     * @description Formatea y limpia la dirección para mejor presentación
     * @function
     * @since 1.0.0
     * 
     * @param {string} address - Dirección sin formatear
     * @returns {string} Dirección formateada y limpia
     * 
     * @example
     * formatAddress("Cl Av. Corrientes    1234") // "Av. Corrientes 1234"
     * formatAddress("") // "Dirección no disponible"
     * formatAddress(null) // "Dirección no disponible"
     */
    const formatAddress = (address) => {
        if (!address) return 'Dirección no disponible';
        
        // Limpiar y formatear la dirección
        return address
            .replace(/^Cl\s+/, '') // Remover "Cl " del inicio
            .replace(/\s+/g, ' ')   // Reemplazar múltiples espacios con uno solo
            .trim();                // Eliminar espacios al inicio y final
    };

    /**
     * @description Determina el color del badge según el tipo de sucursal
     * @function
     * @since 1.0.0
     * 
     * @param {string} tipo - Tipo de sucursal
     * @returns {('success'|'info'|'warning'|'help'|'secondary')} Severidad del badge para PrimeReact
     * 
     * @example
     * getBadgeColor("supermercado") // "success"
     * getBadgeColor("AUTOSERVICIO") // "info"
     * getBadgeColor("hipermercado") // "warning"
     * getBadgeColor("mayorista") // "help"
     * getBadgeColor("farmacia") // "secondary"
     */
    const getBadgeColor = (tipo) => {
        if (!tipo) return 'secondary';
        
        const tipoLower = tipo.toLowerCase();
        switch (tipoLower) {
            case 'supermercado':
            case 'super':
                return 'success';
            case 'autoservicio':
            case 'mini':
                return 'info';
            case 'hipermercado':
            case 'hiper':
                return 'warning';
            case 'mayorista':
            case 'wholesale':
                return 'help';
            default:
                return 'secondary';
        }
    };

    /**
     * @description Determina si las coordenadas están disponibles para mapas
     * @function
     * @since 1.0.0
     * 
     * @returns {boolean} true si las coordenadas son válidas
     * 
     * @example
     * hasValidCoordinates() // true si lat y lng existen y son números válidos
     */
    const hasValidCoordinates = () => {
        return branch.lat && 
               branch.lng && 
               typeof branch.lat === 'number' && 
               typeof branch.lng === 'number' &&
               !isNaN(branch.lat) && 
               !isNaN(branch.lng);
    };

    /**
     * @description Genera el icono apropiado según el tipo de sucursal
     * @function
     * @since 1.0.0
     * 
     * @returns {string} Clase de icono de PrimeIcons
     */
    const getBranchIcon = () => {
        if (!branch.sucursalTipo) return 'pi pi-building';
        
        const tipoLower = branch.sucursalTipo.toLowerCase();
        switch (tipoLower) {
            case 'supermercado':
            case 'super':
                return 'pi pi-shopping-cart';
            case 'autoservicio':
            case 'mini':
                return 'pi pi-shop';
            case 'hipermercado':
            case 'hiper':
                return 'pi pi-home';
            case 'mayorista':
            case 'wholesale':
                return 'pi pi-warehouse';
            case 'farmacia':
                return 'pi pi-heart';
            default:
                return 'pi pi-building';
        }
    };

    /**
     * @description Genera las clases CSS del card según su estado
     * @function
     * @since 1.0.0
     * 
     * @returns {string} Clases CSS combinadas
     */
    const getCardClasses = () => {
        let classes = 'branch-card';
        
        if (featured) classes += ' featured';
        if (closed) classes += ' closed';
        if (loading) classes += ' loading';
        
        return classes;
    };

    /**
     * @description Genera el contenido del header de la tarjeta
     * @type {JSX.Element}
     */
    const header = (
        <div className="branch-header">
            <div className="branch-logo">
                <i 
                    className={getBranchIcon()}
                    style={{ 
                        fontSize: '3rem', 
                        color: 'white'
                    }}
                    aria-hidden="true"
                ></i>
            </div>
            <div className="branch-badges">
                {branch.sucursalTipo && (
                    <Badge 
                        value={branch.sucursalTipo} 
                        severity={getBadgeColor(branch.sucursalTipo)}
                        className="type-badge"
                        tooltip={`Tipo: ${branch.sucursalTipo}`}
                        tooltipOptions={{ position: 'left' }}
                    />
                )}
                {!hasValidCoordinates() && (
                    <Badge 
                        value="Sin GPS" 
                        severity="secondary"
                        className="gps-badge"
                        tooltip="Coordenadas no disponibles"
                        tooltipOptions={{ position: 'left' }}
                    />
                )}
            </div>
        </div>
    );

    /**
     * @description Genera el contenido del footer con botones de acción
     * @type {JSX.Element}
     */
    const footer = showActions ? (
        <div className="branch-actions">
            <Button
                label="Ver en Mapa"
                icon="pi pi-map-marker"
                className="p-button-sm p-button-outlined map-button"
                onClick={handleViewLocation}
                disabled={!hasValidCoordinates() || loading}
                tooltip={hasValidCoordinates() ? "Ver ubicación en Google Maps" : "Coordenadas no disponibles"}
                tooltipOptions={{ position: 'top' }}
                aria-label={`Ver ${branch.sucursalNombre} en Google Maps`}
            />
            <Button
                label="Cómo llegar"
                icon="pi pi-compass"
                className="p-button-sm p-button-success directions-button"
                onClick={handleGetDirections}
                disabled={!hasValidCoordinates() || loading}
                tooltip={hasValidCoordinates() ? "Obtener direcciones en Google Maps" : "Coordenadas no disponibles"}
                tooltipOptions={{ position: 'top' }}
                aria-label={`Obtener direcciones a ${branch.sucursalNombre}`}
            />
        </div>
    ) : null;

    return (
        // ✅ NAMESPACE PRINCIPAL APLICADO
        <div className={`branch-card-wrapper ${className}`} data-theme={closed ? 'closed' : 'light'}>
            <Card 
                className={getCardClasses()}
                header={header}
                footer={footer}
                aria-label={`Información de sucursal: ${branch.sucursalNombre}`}
            >
                <div className="branch-content">
                    {/* Nombre de la sucursal */}
                    <h4 className="branch-name" title={branch.sucursalNombre}>
                        {branch.sucursalNombre || 'Sucursal sin nombre'}
                    </h4>
                    
                    {/* Detalles de la sucursal */}
                    <div className="branch-details">
                        {/* Marca/Bandera comercial */}
                        {branch.banderaDescripcion && (
                            <div className="detail-item">
                                <i className="pi pi-building detail-icon" aria-hidden="true"></i>
                                <span className="detail-text">
                                    {branch.banderaDescripcion}
                                </span>
                            </div>
                        )}
                        
                        {/* Dirección */}
                        <div className="detail-item">
                            <i className="pi pi-map-marker detail-icon" aria-hidden="true"></i>
                            <span className="detail-text" title={formatAddress(branch.direccion)}>
                                {formatAddress(branch.direccion)}
                            </span>
                        </div>
                        
                        {/* Localidad y Provincia */}
                        {(branch.localidad || branch.provincia) && (
                            <div className="detail-item">
                                <i className="pi pi-globe detail-icon" aria-hidden="true"></i>
                                <span className="detail-text">
                                    {[branch.localidad, branch.provincia].filter(Boolean).join(' - ')}
                                </span>
                            </div>
                        )}
                        
                        {/* Razón Social */}
                        {branch.comercioRazonSocial && (
                            <div className="detail-item">
                                <i className="pi pi-briefcase detail-icon" aria-hidden="true"></i>
                                <span className="detail-text small" title={branch.comercioRazonSocial}>
                                    {branch.comercioRazonSocial}
                                </span>
                            </div>
                        )}

                        {/* Información adicional si está disponible */}
                        {branch.telefono && (
                            <div className="detail-item">
                                <i className="pi pi-phone detail-icon" aria-hidden="true"></i>
                                <a 
                                    href={`tel:${branch.telefono}`}
                                    className="detail-text link"
                                    title={`Llamar a ${branch.telefono}`}
                                    aria-label={`Llamar a ${branch.telefono}`}
                                >
                                    {branch.telefono}
                                </a>
                            </div>
                        )}

                        {branch.email && (
                            <div className="detail-item">
                                <i className="pi pi-envelope detail-icon" aria-hidden="true"></i>
                                <a 
                                    href={`mailto:${branch.email}`}
                                    className="detail-text link"
                                    title={`Enviar email a ${branch.email}`}
                                    aria-label={`Enviar email a ${branch.email}`}
                                >
                                    {branch.email}
                                </a>
                            </div>
                        )}

                        {branch.horarios && (
                            <div className="detail-item">
                                <i className="pi pi-clock detail-icon" aria-hidden="true"></i>
                                <span className="detail-text small" title="Horarios de atención">
                                    {branch.horarios}
                                </span>
                            </div>
                        )}

                        {branch.website && (
                            <div className="detail-item">
                                <i className="pi pi-external-link detail-icon" aria-hidden="true"></i>
                                <a 
                                    href={branch.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="detail-text link"
                                    title={`Visitar sitio web: ${branch.website}`}
                                    aria-label={`Visitar sitio web de ${branch.sucursalNombre}`}
                                >
                                    Sitio web
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Estado de la sucursal */}
                    {(closed || !closed) && (
                        <div className={`branch-status ${closed ? 'closed' : 'open'}`}>
                            <i className={`pi ${closed ? 'pi-times-circle' : 'pi-check-circle'}`} aria-hidden="true"></i>
                            <span>{closed ? 'Cerrado' : 'Abierto'}</span>
                        </div>
                    )}

                    {/* Información extra (ejemplo de uso) */}
                    {(branch.telefono || branch.email || branch.website) && (
                        <div className="branch-extra-info">
                            {branch.telefono && (
                                <div className="branch-info-tag">
                                    <i className="pi pi-phone" aria-hidden="true"></i>
                                    <span>Tel</span>
                                </div>
                            )}
                            {branch.email && (
                                <div className="branch-info-tag">
                                    <i className="pi pi-envelope" aria-hidden="true"></i>
                                    <span>Email</span>
                                </div>
                            )}
                            {branch.website && (
                                <div className="branch-info-tag">
                                    <i className="pi pi-globe" aria-hidden="true"></i>
                                    <span>Web</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Indicador de coordenadas (solo en modo debug) */}
                    {process.env.NODE_ENV === 'development' && hasValidCoordinates() && (
                        <div className="debug-info">
                            <small className="coordinates-info">
                                📍 {branch.lat?.toFixed(4)}, {branch.lng?.toFixed(4)}
                            </small>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default BranchCard;