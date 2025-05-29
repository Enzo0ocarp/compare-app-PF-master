// src/components/ProductCard.js - Versión Sin Imagen
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Rating } from 'primereact/rating';
import { Dialog } from 'primereact/dialog';
import '../styles/ProductCard.css';

function ProductCard({ product }) {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const toggleWishlist = (e) => {
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

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

    const header = (
        <div className="product-card-header-no-image">
            <div className="product-icon-container">
                <div className="product-icon-wrapper">
                    <i className="pi pi-shopping-bag product-main-icon"></i>
                </div>
                <div className="product-category-indicator">
                    <i className="pi pi-tag"></i>
                    <span>{product.category || 'Producto'}</span>
                </div>
            </div>
            
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
                        value="TRENDING" 
                        severity="warning" 
                        className="trending-badge"
                    />
                )}
                {!product.inStock && (
                    <Badge 
                        value="SIN STOCK" 
                        severity="secondary" 
                        className="stock-badge"
                    />
                )}
            </div>
            
            <button 
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={toggleWishlist}
                title={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
                <i className={`pi ${isWishlisted ? 'pi-heart-fill' : 'pi-heart'}`}></i>
            </button>
        </div>
    );

    const footer = (
        <div className="product-card-footer">
            <Button
                label="Ver Detalles"
                icon="pi pi-eye"
                className="product-btn-details"
                onClick={openProductDialog}
                outlined
            />
            <Button
                label="Reseñas"
                icon="pi pi-star"
                className="product-btn-review"
                onClick={() => console.log('Ver reseñas')}
                text
            />
        </div>
    );

    return (
        <>
            <Card 
                className={`product-card-no-image ${!product.inStock ? 'out-of-stock' : ''}`}
                header={header} 
                footer={footer}
            >
                <div className="product-card-content">
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
                    
                    <div className="product-rating">
                        <div className="stars-container">
                            <Rating 
                                value={parseFloat(product.rating?.rate) || 4.5} 
                                readOnly 
                                cancel={false}
                                stars={5}
                            />
                        </div>
                        <span className="rating-text">
                            ({product.rating?.count || 0} reseñas)
                        </span>
                    </div>
                    
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
                    
                    <div className="stock-status">
                        {product.inStock ? (
                            <div className="in-stock">
                                <i className="pi pi-check-circle"></i>
                                <span>En stock</span>
                            </div>
                        ) : (
                            <div className="out-of-stock-text">
                                <i className="pi pi-times-circle"></i>
                                <span>Sin stock</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Product Detail Dialog */}
            <Dialog
                header="Detalles del Producto"
                visible={dialogVisible}
                style={{ width: '90vw', maxWidth: '500px' }}
                onHide={closeDialog}
                className="product-dialog"
                modal
            >
                <div className="dialog-content-no-image">
                    <div className="dialog-icon-header">
                        <div className="dialog-main-icon">
                            <i className="pi pi-shopping-bag"></i>
                        </div>
                        {discount > 0 && (
                            <div className="dialog-discount-badge">
                                -{discount}% OFF
                            </div>
                        )}
                    </div>
                    
                    <div className="dialog-info">
                        <div className="dialog-header">
                            <h3>{product.title}</h3>
                            <div className="dialog-category">
                                <i className="pi pi-tag"></i>
                                <span>{product.category}</span>
                            </div>
                        </div>
                        
                        <div className="dialog-rating">
                            <Rating 
                                value={parseFloat(product.rating?.rate) || 4.5} 
                                readOnly 
                                cancel={false}
                                stars={5}
                            />
                            <span>({product.rating?.count || 0} reseñas)</span>
                        </div>
                        
                        <div className="dialog-pricing">
                            {product.originalPrice && product.originalPrice > product.price ? (
                                <>
                                    <span className="dialog-original-price">
                                        ${product.originalPrice?.toLocaleString()}
                                    </span>
                                    <span className="dialog-current-price">
                                        ${product.price?.toLocaleString()}
                                    </span>
                                    {savings > 0 && (
                                        <div className="dialog-savings">
                                            <i className="pi pi-dollar"></i>
                                            <span>Ahorrás ${savings.toLocaleString()}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span className="dialog-current-price">
                                    ${product.price?.toLocaleString()}
                                </span>
                            )}
                        </div>
                        
                        <div className="dialog-description">
                            <h4>Descripción</h4>
                            <p>{product.description || 'Descripción no disponible'}</p>
                            {product.brand && (
                                <p><strong>Marca:</strong> {product.brand}</p>
                            )}
                            {product.presentation && (
                                <p><strong>Presentación:</strong> {product.presentation}</p>
                            )}
                        </div>
                        
                        <div className="dialog-stock">
                            <h4>Disponibilidad</h4>
                            {product.inStock ? (
                                <div className="in-stock">
                                    <i className="pi pi-check-circle"></i>
                                    <span>Disponible en stock</span>
                                </div>
                            ) : (
                                <div className="out-of-stock-text">
                                    <i className="pi pi-times-circle"></i>
                                    <span>Temporalmente sin stock</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="dialog-footer">
                    <Button
                        label="Comparar Precios"
                        icon="pi pi-chart-line"
                        className="p-button-success"
                        onClick={() => console.log('Comparar precios')}
                    />
                    <Button
                        label="Ver Sucursales"
                        icon="pi pi-map-marker"
                        className="p-button-info"
                        onClick={() => console.log('Ver sucursales')}
                        outlined
                    />
                    <Button
                        label="Cerrar"
                        icon="pi pi-times"
                        className="p-button-secondary"
                        onClick={closeDialog}
                        outlined
                    />
                </div>
            </Dialog>
        </>
    );
}

export default ProductCard;