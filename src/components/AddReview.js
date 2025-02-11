// src/components/AddReview.js
import React from 'react';

const AddReview = ({
  products,
  selectedProductId,
  onProductIdChange,
  newReviewText,
  onReviewTextChange,
  rating,
  onRatingChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="add-review-form">
      <label htmlFor="productId">Seleccionar Producto:</label>
      <select
        id="productId"
        value={selectedProductId}
        onChange={(e) => onProductIdChange(e.target.value)}
      >
        <option value="">Seleccione un producto</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.title}
          </option>
        ))}
      </select>

      <label htmlFor="reviewText">Tu Reseña:</label>
      <textarea
        id="reviewText"
        value={newReviewText}
        onChange={(e) => onReviewTextChange(e.target.value)}
        placeholder="Escribe tu reseña"
        rows="5"
      />

      <label htmlFor="rating">Calificación:</label>
      <select
        id="rating"
        value={rating}
        onChange={(e) => onRatingChange(Number(e.target.value))}
      >
        <option value={0}>Seleccione una calificación</option>
        {[1, 2, 3, 4, 5].map((rate) => (
          <option key={rate} value={rate}>
            {rate} Estrellas
          </option>
        ))}
      </select>

      <div className="form-actions">
        <button type="button" className="submit-btn" onClick={onSubmit}>
          Enviar Reseña
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default AddReview;
