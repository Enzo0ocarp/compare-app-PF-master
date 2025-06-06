// src/components/AddReview.js - Versión Mejorada
import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Rating } from 'primereact/rating';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import '../styles/AddReviewStyles.css';

const AddReview = ({
  products = [],
  selectedProductId,
  onProductIdChange,
  newReviewText,
  onReviewTextChange,
  rating,
  onRatingChange,
  disabled = false
}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Opciones para el dropdown de productos
  const productOptions = products.map(product => ({
    label: product.title || product.name || `Producto ${product.id}`,
    value: product.id,
    description: product.brand || product.description || '',
    image: product.image || '/placeholder-product.png'
  }));

  // Template personalizado para las opciones del dropdown
  const productOptionTemplate = (option) => {
    return (
      <div className="product-option">
        <img 
          src={option.image} 
          alt={option.label}
          className="product-option-image"
          onError={(e) => e.target.src = '/placeholder-product.png'}
        />
        <div className="product-option-content">
          <div className="product-option-title">{option.label}</div>
          {option.description && (
            <div className="product-option-description">{option.description}</div>
          )}
        </div>
      </div>
    );
  };

  // Template para el valor seleccionado
  const selectedProductTemplate = (option) => {
    if (!option) return <span>Selecciona un producto para reseñar</span>;
    
    return (
      <div className="selected-product">
        <img 
          src={option.image} 
          alt={option.label}
          className="selected-product-image"
          onError={(e) => e.target.src = '/placeholder-product.png'}
        />
        <span className="selected-product-label">{option.label}</span>
      </div>
    );
  };

  // Validación en tiempo real
  useEffect(() => {
    const errors = {};
    
    if (selectedProductId && !productOptions.find(p => p.value === selectedProductId)) {
      errors.product = 'Producto no válido';
    }
    
    if (newReviewText && newReviewText.length < 10) {
      errors.comment = 'La reseña debe tener al menos 10 caracteres';
    }
    
    if (newReviewText && newReviewText.length > 500) {
      errors.comment = 'La reseña no puede exceder 500 caracteres';
    }
    
    if (rating && (rating < 1 || rating > 5)) {
      errors.rating = 'La calificación debe ser entre 1 y 5 estrellas';
    }
    
    setValidationErrors(errors);
  }, [selectedProductId, newReviewText, rating, productOptions]);

  // Manejadores de eventos
  const handleProductChange = (e) => {
    onProductIdChange(e.value);
  };

  const handleTextChange = (e) => {
    onReviewTextChange(e.target.value);
  };

  const handleRatingChange = (e) => {
    onRatingChange(e.value);
  };

  // Progreso del formulario
  const getFormProgress = () => {
    let progress = 0;
    if (selectedProductId) progress += 33;
    if (newReviewText && newReviewText.length >= 10) progress += 34;
    if (rating > 0) progress += 33;
    return progress;
  };

  // Descripción de la calificación
  const getRatingDescription = (ratingValue) => {
    switch (ratingValue) {
      case 1: return '⭐ Muy malo - No lo recomiendo';
      case 2: return '⭐⭐ Malo - Tiene muchos problemas';
      case 3: return '⭐⭐⭐ Regular - Cumple expectativas básicas';
      case 4: return '⭐⭐⭐⭐ Bueno - Lo recomiendo';
      case 5: return '⭐⭐⭐⭐⭐ Excelente - Superó mis expectativas';
      default: return 'Selecciona una calificación';
    }
  };

  const formProgress = getFormProgress();
  const isFormValid = selectedProductId && newReviewText && newReviewText.length >= 10 && rating > 0 && Object.keys(validationErrors).length === 0;

  return (
    <div className="add-review-form">
      {/* Indicador de progreso */}
      <div className="form-progress">
        <div className="progress-header">
          <span className="progress-label">Progreso del formulario</span>
          <span className="progress-percentage">{formProgress}%</span>
        </div>
        <ProgressBar 
          value={formProgress} 
          className="progress-bar"
          color={formProgress === 100 ? '#4caf50' : '#667eea'}
        />
      </div>

      {/* Selector de producto */}
      <div className="form-group">
        <label htmlFor="productId" className="form-label required">
          <i className="pi pi-shopping-bag"></i>
          ¿Qué producto quieres reseñar?
        </label>
        <Dropdown
          id="productId"
          value={selectedProductId}
          options={productOptions}
          onChange={handleProductChange}
          placeholder="Busca y selecciona un producto"
          className={`product-dropdown ${validationErrors.product ? 'p-invalid' : ''}`}
          filter
          filterPlaceholder="Escribe para buscar..."
          emptyMessage="No se encontraron productos"
          disabled={disabled}
          showClear
          itemTemplate={productOptionTemplate}
          valueTemplate={selectedProductTemplate}
          tooltip="Selecciona el producto que compraste y quieres reseñar"
        />
        {validationErrors.product && (
          <small className="field-error">
            <i className="pi pi-exclamation-circle"></i>
            {validationErrors.product}
          </small>
        )}
      </div>

      {/* Calificación */}
      <div className="form-group">
        <label htmlFor="rating" className="form-label required">
          <i className="pi pi-star"></i>
          ¿Cómo calificarías este producto?
        </label>
        <div className="rating-section">
          <Rating
            id="rating"
            value={rating}
            onChange={handleRatingChange}
            stars={5}
            cancel={false}
            disabled={disabled}
            className={`product-rating ${validationErrors.rating ? 'p-invalid' : ''}`}
            tooltip="Haz clic en las estrellas para calificar"
          />
          <div className="rating-description">
            {getRatingDescription(rating)}
          </div>
        </div>
        {validationErrors.rating && (
          <small className="field-error">
            <i className="pi pi-exclamation-circle"></i>
            {validationErrors.rating}
          </small>
        )}
      </div>

      {/* Área de texto para la reseña */}
      <div className="form-group">
        <label htmlFor="reviewText" className="form-label required">
          <i className="pi pi-comment"></i>
          Comparte tu experiencia
        </label>
        <InputTextarea
          id="reviewText"
          value={newReviewText}
          onChange={handleTextChange}
          placeholder="Cuéntanos sobre tu experiencia con este producto. ¿Qué te gustó? ¿Qué no te gustó? ¿Lo recomendarías a otros?"
          rows={6}
          autoResize
          className={`review-textarea ${validationErrors.comment ? 'p-invalid' : ''}`}
          maxLength={500}
          disabled={disabled}
          tooltip="Escribe una reseña detallada y honesta"
        />
        <div className="textarea-footer">
          <div className="character-info">
            <span className={`character-count ${newReviewText.length > 450 ? 'warning' : ''}`}>
              {newReviewText.length}/500 caracteres
            </span>
            {newReviewText.length < 10 && newReviewText.length > 0 && (
              <span className="min-chars">Mínimo 10 caracteres</span>
            )}
          </div>
        </div>
        {validationErrors.comment && (
          <small className="field-error">
            <i className="pi pi-exclamation-circle"></i>
            {validationErrors.comment}
          </small>
        )}
      </div>

      <Divider />

      {/* Guías y consejos */}
      <div className="guidelines-section">
        <div 
          className="guidelines-toggle"
          onClick={() => setShowGuidelines(!showGuidelines)}
        >
          <span className="guidelines-title">
            <i className="pi pi-info-circle"></i>
            Consejos para escribir una buena reseña
          </span>
          <i className={`pi ${showGuidelines ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
        </div>
        
        {showGuidelines && (
          <div className="guidelines-content">
            <div className="tips-grid">
              <div className="tip-item">
                <i className="pi pi-check-circle tip-icon"></i>
                <div>
                  <strong>Sé específico</strong>
                  <p>Menciona características concretas del producto</p>
                </div>
              </div>
              <div className="tip-item">
                <i className="pi pi-users tip-icon"></i>
                <div>
                  <strong>Piensa en otros</strong>
                  <p>¿Qué información te hubiera gustado tener antes de comprar?</p>
                </div>
              </div>
              <div className="tip-item">
                <i className="pi pi-balance-scale tip-icon"></i>
                <div>
                  <strong>Sé equilibrado</strong>
                  <p>Menciona tanto aspectos positivos como negativos</p>
                </div>
              </div>
              <div className="tip-item">
                <i className="pi pi-heart tip-icon"></i>
                <div>
                  <strong>Sé honesto</strong>
                  <p>Comparte tu experiencia real y genuina</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validación del formulario */}
      {!isFormValid && formProgress > 0 && (
        <Message 
          severity="info" 
          text="Completa todos los campos requeridos para enviar tu reseña"
          className="form-validation-message"
        />
      )}

      {/* Estado de envío */}
      {disabled && (
        <div className="submitting-overlay">
          <div className="submitting-content">
            <i className="pi pi-spin pi-spinner"></i>
            <h4>Enviando tu reseña...</h4>
            <p>Por favor espera mientras procesamos tu opinión</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddReview;