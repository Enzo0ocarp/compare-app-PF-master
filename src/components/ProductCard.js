/**
 * @fileoverview ProductCard Corregido - Compare & Nourish v3.2
 * @description Card de producto sin referencias a stock, enfocado en comparación de precios
 * @author Compare & Nourish Team
 * @version 3.2.0
 * @since 2025
 */

import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import '../styles/ProductCard.css';

function ProductCard({ product, onCompare, onAddImage }) {
    const [dialogVisible, setDialogVisible] = useState(false);

    const openProductDialog = () => {
        setDialogVisible(true);
    };

    const closeDialog = () => {
        setDialogVisible(false);
    };

    const calculateDiscount = () => {
        if (product.originalPrice && product.price) {
            return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        }
        return product.discount || 0;
    };

    const discount = calculateDiscount();
    const savings = product.originalPrice ? product.originalPrice - product.price : 0;

    /**
     * Header del card con imagen o placeholder
     */
    const header = (
        <div className="product-card-header">
            <div className="product-image-container">
                {product.image && product.hasImage ? (
                    <img 
                        src={product.image} 
                        alt={product.title}
                        className="product-image"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                
                {/* Placeholder cuando no hay imagen */}
                <div 
                    className="product-placeholder" 
                    style={{ 
                        display: (product.image && product.hasImage) ? 'none' : 'flex',
                        backgroundColor: product.categoryColor || '#f0f0f0'
                    }}
                >
                    <div className="placeholder-content">
                        <span className="placeholder-icon">
                            {product.categoryIcon || '📦'}
                        </span>
                        <span className="placeholder-text">
                            {product.category || 'Producto'}
                        </span>
                        {onAddImage && (
                            <Button
                                icon="pi pi-camera"
                                className="add-image-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddImage();
                                }}
                                tooltip="Agregar imagen del producto"
                                size="small"
                                text
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Badges de información */}
            <div className="product-badges">
                {discount > 0 && (
                    <Badge 
                        value={`-${discount}%`} 
                        severity="danger" 
                        className="discount-badge"
                    />
                )}
                {product.trending && (
                    <Badge 
                        value="POPULAR" 
                        severity="warning" 
                        className="trending-badge"
                    />
                )}
                {product.sucursal && (
                    <Badge 
                        value={product.sucursal} 
                        severity="info" 
                        className="store-badge"
                    />
                )}
            </div>
        </div>
    );

    /**
     * Footer con acciones principales
     */
    const footer = (
        <div className="product-card-footer">
            <Button
                label="Ver Detalles"
                icon="pi pi-eye"
                className="product-btn-details"
                onClick={openProductDialog}
                outlined
                size="small"
            />
            {onCompare && (
                <Button
                    label="Comparar"
                    icon="pi pi-chart-line"
                    className="product-btn-compare"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCompare();
                    }}
                    severity="success"
                    size="small"
                />
            )}
        </div>
    );

    return (
        <>
            <Card 
                className="product-card-modern"
                header={header} 
                footer={footer}
                onClick={openProductDialog}
            >
                <div className="product-card-content">
                    
                    {/* Información del producto */}
                    <div className="product-title-section">
                        <h3 className="product-title">{product.title}</h3>
                        {product.brand && (
                            <div className="product-brand">
                                <i className="pi pi-bookmark"></i>
                                <span>{product.brand}</span>
                            </div>
                        )}
                        {product.presentation && (
                            <p className="product-presentation">{product.presentation}</p>
                        )}
                    </div>
                    
                    {/* Rating del producto */}
                    {product.rating && (
                        <div className="product-rating">
                            <div className="stars-container">
                                <Rating 
                                    value={parseFloat(product.rating?.rate) || 4.5} 
                                    readOnly 
                                    cancel={false}
                                    stars={5}
                                    size="small"
                                />
                            </div>
                            <span className="rating-text">
                                ({product.rating?.count || 0})
                            </span>
                        </div>
                    )}
                    
                    {/* Precio del producto */}
                    <div className="product-pricing">
                        {product.originalPrice && product.originalPrice > product.price ? (
                            <div className="price-with-discount">
                                <span className="original-price">
                                    ${product.originalPrice?.toLocaleString()}
                                </span>
                                <span className="discounted-price">
                                    ${product.price?.toLocaleString()}
                                </span>
                                {savings > 0 && (
                                    <span className="savings">
                                        Ahorrás ${savings.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="current-price">
                                ${product.price?.toLocaleString()}
                            </span>
                        )}
                    </div>
                    
                    {/* Información de sucursal */}
                    {product.sucursal && (
                        <div className="store-info">
                            <i className="pi pi-map-marker"></i>
                            <span>Disponible en {product.sucursal}</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Modal de detalles del producto */}
            <Dialog
                header={
                    <div className="dialog-header-custom">
                        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
                            {product.categoryIcon || '📦'}
                        </span>
                        <span>Detalles del Producto</span>
                    </div>
                }
                visible={dialogVisible}
                style={{ width: '90vw', maxWidth: '600px' }}
                onHide={closeDialog}
                className="product-dialog-modern"
                modal
            >
                <div className="dialog-content">
                    
                    {/* Imagen o placeholder en el modal */}
                    <div className="dialog-image-section">
                        {product.image && product.hasImage ? (
                            <img 
                                src={product.image} 
                                alt={product.title}
                                className="dialog-product-image"
                            />
                        ) : (
                            <div 
                                className="dialog-placeholder"
                                style={{ backgroundColor: product.categoryColor || '#f0f0f0' }}
                            >
                                <span style={{ fontSize: '3rem' }}>
                                    {product.categoryIcon || '📦'}
                                </span>
                                <p>Imagen no disponible</p>
                                {onAddImage && (
                                    <Button
                                        label="Agregar imagen"
                                        icon="pi pi-camera"
                                        onClick={onAddImage}
                                        className="p-button-outlined"
                                        size="small"
                                    />
                                )}
                            </div>
                        )}
                        
                        {/* Badges en el modal */}
                        {discount > 0 && (
                            <div className="dialog-discount-badge">
                                -{discount}% OFF
                            </div>
                        )}
                    </div>
                    
                    {/* Información detallada */}
                    <div className="dialog-info">
                        <div className="dialog-header-info">
                            <h3>{product.title}</h3>
                            <div className="dialog-category">
                                <i className="pi pi-tag"></i>
                                <span>{product.category}</span>
                            </div>
                        </div>
                        
                        {/* Rating en el modal */}
                        {product.rating && (
                            <div className="dialog-rating">
                                <Rating 
                                    value={parseFloat(product.rating?.rate) || 4.5} 
                                    readOnly 
                                    cancel={false}
                                    stars={5}
                                />
                                <span>({product.rating?.count || 0} calificaciones)</span>
                            </div>
                        )}
                        
                        {/* Precios en el modal */}
                        <div className="dialog-pricing">
                            {product.originalPrice && product.originalPrice > product.price ? (
                                <>
                                    <span className="dialog-original-price">
                                        Antes: ${product.originalPrice?.toLocaleString()}
                                    </span>
                                    <span className="dialog-current-price">
                                        Ahora: ${product.price?.toLocaleString()}
                                    </span>
                                    {savings > 0 && (
                                        <div className="dialog-savings">
                                            <i className="pi pi-dollar"></i>
                                            <span>Te ahorrás ${savings.toLocaleString()}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="dialog-current-price">
                                    Precio: ${product.price?.toLocaleString()}
                                </span>
                            )}
                        </div>
                        
                        {/* Descripción del producto */}
                        <div className="dialog-description">
                            <h4>📋 Información del producto</h4>
                            <p>{product.description || 'Descripción no disponible'}</p>
                            
                            <div className="product-details-grid">
                                {product.brand && (
                                    <div className="detail-item">
                                        <strong>Marca:</strong> {product.brand}
                                    </div>
                                )}
                                {product.presentation && (
                                    <div className="detail-item">
                                        <strong>Presentación:</strong> {product.presentation}
                                    </div>
                                )}
                                {product.category && (
                                    <div className="detail-item">
                                        <strong>Categoría:</strong> {product.category}
                                    </div>
                                )}
                                {product.sucursal && (
                                    <div className="detail-item">
                                        <strong>Sucursal:</strong> {product.sucursal}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Sección de comparación */}
                        {onCompare && (
                            <div className="dialog-comparison-section">
                                <h4>💰 Comparación de precios</h4>
                                <p>
                                    Ve como se compara este producto con otros de la misma categoría 
                                    para encontrar el mejor precio disponible.
                                </p>
                                <Button
                                    label="Comparar precios en categoría"
                                    icon="pi pi-chart-line"
                                    className="p-button-success"
                                    onClick={() => {
                                        onCompare();
                                        closeDialog();
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer del modal */}
                <div className="dialog-footer">
                    <div className="dialog-actions">
                        {onCompare && (
                            <Button
                                label="Comparar Precios"
                                icon="pi pi-chart-line"
                                className="p-button-success"
                                onClick={() => {
                                    onCompare();
                                    closeDialog();
                                }}
                            />
                        )}
                        <Button
                            label="Cerrar"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={closeDialog}
                            outlined
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
}

export default ProductCard;