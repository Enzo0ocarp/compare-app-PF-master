// src/components/BranchCard.js - REEMPLAZAR COMPLETAMENTE

import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { auth } from '../functions/src/firebaseConfig';
import { toggleBranchFavorite } from '../functions/src/firebaseConfig';
import { useNotification } from './Notification';
import { getProvinceName } from '../functions/services/api';
import '../styles/BranchCard.css';

function BranchCard({ 
    branch, 
    onLocationClick, 
    onDirectionsClick, 
    showActions = true, 
    className = '',
    featured = false,
    closed = false,
    loading = false,
    isFavorite = false,
    onFavoriteToggle
}) {
    const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
    const [isUpdating, setIsUpdating] = useState(false);
    const { showNotification } = useNotification();
    const user = auth.currentUser;

    useEffect(() => {
        setLocalIsFavorite(isFavorite);
    }, [isFavorite]);

    const handleViewLocation = () => {
        if (branch.lat && branch.lng) {
            const mapsUrl = `https://www.google.com/maps?q=${branch.lat},${branch.lng}`;
            window.open(mapsUrl, '_blank', 'noopener,noreferrer');
        } else {
            showNotification('error', 'Coordenadas no disponibles para esta sucursal');
        }
        
        if (onLocationClick) {
            onLocationClick(branch);
        }
    };

    const handleGetDirections = () => {
        if (branch.lat && branch.lng) {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
            window.open(directionsUrl, '_blank', 'noopener,noreferrer');
        } else {
            showNotification('error', 'Coordenadas no disponibles para direcciones');
        }
        
        if (onDirectionsClick) {
            onDirectionsClick(branch);
        }
    };

    const handleFavoriteClick = async () => {
        if (!user) {
            showNotification('warning', 'Debes iniciar sesión para guardar favoritos');
            return;
        }

        setIsUpdating(true);
        try {
            await toggleBranchFavorite(user.uid, branch.id, localIsFavorite);
            setLocalIsFavorite(!localIsFavorite);
            
            showNotification(
                'success',
                localIsFavorite 
                    ? 'Sucursal removida de favoritos' 
                    : 'Sucursal agregada a favoritos'
            );

            if (onFavoriteToggle) {
                onFavoriteToggle(branch.id, !localIsFavorite);
            }
        } catch (error) {
            console.error('Error toggling favorito:', error);
            showNotification('error', 'Error al actualizar favoritos');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatAddress = (address) => {
        if (!address) return 'Dirección no disponible';
        return address
            .replace(/^Cl\s+/, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

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

    const hasValidCoordinates = () => {
        return branch.lat && 
               branch.lng && 
               typeof parseFloat(branch.lat) === 'number' && 
               typeof parseFloat(branch.lng) === 'number' &&
               !isNaN(parseFloat(branch.lat)) && 
               !isNaN(parseFloat(branch.lng));
    };

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

    const getCardClasses = () => {
        let classes = 'branch-card';
        if (featured) classes += ' featured';
        if (closed) classes += ' closed';
        if (loading) classes += ' loading';
        return classes;
    };

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
                    />
                )}
                {!hasValidCoordinates() && (
                    <Badge 
                        value="Sin GPS" 
                        severity="secondary"
                        className="gps-badge"
                    />
                )}
            </div>
            {user && (
                <Button
                    icon={localIsFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'}
                    className={`favorite-btn ${localIsFavorite ? 'is-favorite' : ''}`}
                    onClick={handleFavoriteClick}
                    disabled={isUpdating}
                    tooltip={localIsFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    tooltipOptions={{ position: 'left' }}
                    rounded
                    text
                />
            )}
        </div>
    );

    const footer = showActions ? (
        <div className="branch-actions">
            <Button
                label="Ver en Mapa"
                icon="pi pi-map-marker"
                className="p-button-sm p-button-outlined map-button"
                onClick={handleViewLocation}
                disabled={!hasValidCoordinates() || loading}
            />
            <Button
                label="Cómo llegar"
                icon="pi pi-compass"
                className="p-button-sm p-button-success directions-button"
                onClick={handleGetDirections}
                disabled={!hasValidCoordinates() || loading}
            />
        </div>
    ) : null;

    return (
        <div className={`branch-card-wrapper ${className}`} data-theme={closed ? 'closed' : 'light'}>
            <Card 
                className={getCardClasses()}
                header={header}
                footer={footer}
            >
                <div className="branch-content">
                    <h4 className="branch-name" title={branch.sucursalNombre}>
                        {branch.sucursalNombre || 'Sucursal sin nombre'}
                    </h4>
                    
                    <div className="branch-details">
                        {branch.banderaDescripcion && (
                            <div className="detail-item">
                                <i className="pi pi-building detail-icon"></i>
                                <span className="detail-text">
                                    {branch.banderaDescripcion}
                                </span>
                            </div>
                        )}
                        
                        <div className="detail-item">
                            <i className="pi pi-map-marker detail-icon"></i>
                            <span className="detail-text" title={formatAddress(branch.direccion)}>
                                {formatAddress(branch.direccion)}
                            </span>
                        </div>
                        
                        {(branch.localidad || branch.provincia) && (
                            <div className="detail-item">
                                <i className="pi pi-globe detail-icon"></i>
                                <span className="detail-text">
                                    {[
                                        branch.localidad, 
                                        getProvinceName(branch.provincia)
                                    ].filter(Boolean).join(' - ')}
                                </span>
                            </div>
                        )}
                        
                        {branch.comercioRazonSocial && (
                            <div className="detail-item">
                                <i className="pi pi-briefcase detail-icon"></i>
                                <span className="detail-text small" title={branch.comercioRazonSocial}>
                                    {branch.comercioRazonSocial}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default BranchCard;