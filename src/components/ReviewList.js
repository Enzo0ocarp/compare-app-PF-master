// src/components/ReviewList.js - Versión Mejorada
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Rating } from 'primereact/rating';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { Timeline } from 'primereact/timeline';
import '../styles/ReviewList.css';

/**
 * @typedef {Object} Review
 * @property {string|number} id - ID único de la reseña
 * @property {string} productId - ID del producto reseñado
 * @property {string} comment - Texto de la reseña
 * @property {number} rating - Calificación (1-5)
 * @property {string} userId - ID del usuario
 * @property {string} username - Nombre del usuario
 * @property {string} createdAt - Fecha de creación
 * @property {boolean} verified - Si la reseña está verificada
 * @property {number} helpfulCount - Votos útiles
 */

/**
 * @typedef {Object} Product
 * @property {string|number} id - ID del producto
 * @property {string} title - Título del producto
 * @property {string} name - Nombre del producto
 * @property {string} brand - Marca del producto
 * @property {string} image - URL de imagen
 */

const ReviewList = ({ 
  reviews = [], 
  products = [], 
  showProductInfo = false,
  onHelpfulClick = null,
  currentUserId = null 
}) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState(new Map());

  /**
   * Obtiene información del producto por ID
   */
  const getProductInfo = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? {
      title: product.title || product.name || `Producto ${product.id}`,
      brand: product.brand || 'Marca no especificada',
      image: product.image || '/placeholder-product.png'
    } : {
      title: 'Producto no encontrado',
      brand: '',
      image: '/placeholder-product.png'
    };
  };

  /**
   * Maneja la expansión/contracción de reseñas largas
   */
  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  /**
   * Maneja los votos de "útil"
   */
  const handleHelpfulVote = (reviewId) => {
    if (!currentUserId) return;
    
    const currentVotes = helpfulVotes.get(reviewId) || 0;
    const newVotes = currentVotes + 1;
    
    setHelpfulVotes(new Map(helpfulVotes.set(reviewId, newVotes)));
    
    if (onHelpfulClick) {
      onHelpfulClick(reviewId);
    }
  };

  /**
   * Formatea la fecha de creación
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Hace 1 día';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
      if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`;
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  /**
   * Obtiene el color de la calificación
   */
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#4caf50'; // Verde
    if (rating >= 3) return '#ff9800'; // Naranja
    if (rating >= 2) return '#f44336'; // Rojo
    return '#9e9e9e'; // Gris
  };

  /**
   * Trunca texto largo
   */
  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Genera iniciales del usuario
   */
  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="empty-reviews">
        <div className="empty-content">
          <i className="pi pi-comment empty-icon"></i>
          <h3>No hay reseñas disponibles</h3>
          <p>Sé el primero en compartir tu experiencia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-list">
      {reviews.map((review, index) => {
        const productInfo = getProductInfo(review.productId);
        const isExpanded = expandedReviews.has(review.id);
        const isLongComment = review.comment && review.comment.length > 200;
        const displayComment = isExpanded ? review.comment : truncateText(review.comment);
        const helpfulCount = (review.helpfulCount || 0) + (helpfulVotes.get(review.id) || 0);

        return (
          <Card key={review.id} className="review-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            {/* Header de la reseña */}
            <div className="review-header">
              <div className="user-info">
                <Avatar
                  label={getUserInitials(review.username)}
                  size="large"
                  shape="circle"
                  className="user-avatar"
                  style={{ backgroundColor: getRatingColor(review.rating) }}
                />
                <div className="user-details">
                  <div className="user-name-section">
                    <span className="username">
                      {review.username || 'Usuario Anónimo'}
                    </span>
                    {review.verified && (
                      <Badge 
                        value="Verificado" 
                        severity="success" 
                        className="verified-badge"
                      />
                    )}
                  </div>
                  <div className="review-meta">
                    <span className="review-date">{formatDate(review.createdAt)}</span>
                    {review.userId === currentUserId && (
                      <Chip 
                        label="Tu reseña" 
                        className="own-review-chip"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Información del producto */}
              {showProductInfo && (
                <div className="product-info">
                  <img 
                    src={productInfo.image} 
                    alt={productInfo.title}
                    className="product-thumb"
                    onError={(e) => e.target.src = '/placeholder-product.png'}
                  />
                  <div className="product-details">
                    <span className="product-title">{productInfo.title}</span>
                    {productInfo.brand && (
                      <span className="product-brand">{productInfo.brand}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Calificación */}
            <div className="review-rating-section">
              <Rating 
                value={review.rating} 
                readOnly 
                cancel={false}
                className="review-rating"
              />
              <span className="rating-text">
                {review.rating}/5 estrellas
              </span>
            </div>

            {/* Comentario */}
            <div className="review-content">
              <p className="review-comment">
                {displayComment}
              </p>
              
              {isLongComment && (
                <Button
                  label={isExpanded ? 'Ver menos' : 'Ver más'}
                  icon={isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'}
                  className="p-button-text expand-btn"
                  onClick={() => toggleExpanded(review.id)}
                />
              )}
            </div>

            {/* Footer de la reseña */}
            <div className="review-footer">
              <div className="review-actions">
                <Button
                  icon="pi pi-thumbs-up"
                  label={`Útil (${helpfulCount})`}
                  className="p-button-text helpful-btn"
                  onClick={() => handleHelpfulVote(review.id)}
                  disabled={!currentUserId}
                  tooltip={!currentUserId ? 'Inicia sesión para votar' : 'Marcar como útil'}
                />
                
                <Button
                  icon="pi pi-flag"
                  className="p-button-text report-btn"
                  tooltip="Reportar reseña"
                  onClick={() => console.log('Reportar reseña:', review.id)}
                />
              </div>

              <div className="review-stats">
                {review.verified && (
                  <div className="verified-indicator">
                    <i className="pi pi-verified"></i>
                    <span>Compra verificada</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {/* Indicador de fin de lista */}
      <div className="end-of-list">
        <div className="end-content">
          <i className="pi pi-check-circle"></i>
          <span>Has visto todas las reseñas disponibles</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewList;