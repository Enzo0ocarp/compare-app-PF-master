// src/components/AddReview.js
import React from 'react';

const AddReview = ({
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
            <label htmlFor="productId">ID del Producto:</label>
            <input
                type="text"
                id="productId"
                value={selectedProductId}
                onChange={(e) => onProductIdChange(e.target.value)}
                placeholder="Escribe el ID del producto"
            />

            <label htmlFor="reviewText">Tu Reseña:</label>
            <textarea
                id="reviewText"
                value={newReviewText}
                onChange={(e) => onReviewTextChange(e.target.value)}
                placeholder="Escribe tu reseña"
            />

            <label htmlFor="rating">Calificación:</label>
            <select
                id="rating"
                value={rating}
                onChange={(e) => onRatingChange(parseInt(e.target.value))}
            >
                <option value={0}>Seleccione una calificación</option>
                {[1, 2, 3, 4, 5].map((rate) => (
                    <option key={rate} value={rate}>
                        {rate} Estrellas
                    </option>
                ))}
            </select>

            <div className="form-actions">
                <button className="submit-btn" onClick={onSubmit}>
                    Enviar Reseña
                </button>
                <button className="cancel-btn" onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default AddReview;