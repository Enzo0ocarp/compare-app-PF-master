// src/components/AddReview.js
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import '../styles/AddReviewStyles.css';

const AddReview = ({
  products,
  selectedProductId,
  onProductIdChange,
  newReviewText,
  onReviewTextChange,
  rating,
  onRatingChange
}) => {
  // Preparar opciones para el dropdown basado en productos
  const productOptions = products.map(product => ({
    label: product.title,
    value: product.id
  }));

  // Opciones de calificación
  const ratingOptions = [
    { label: '1 Estrella', value: 1 },
    { label: '2 Estrellas', value: 2 },
    { label: '3 Estrellas', value: 3 },
    { label: '4 Estrellas', value: 4 },
    { label: '5 Estrellas', value: 5 },
  ];

  return (
    <div className="add-review-form">
      <div className="form-group">
        <label htmlFor="productId">Producto</label>
        <Dropdown
          id="productId"
          value={selectedProductId}
          options={productOptions}
          onChange={(e) => onProductIdChange(e.value)}
          placeholder="Selecciona un producto"
          className="product-dropdown"
        />
      </div>
      <div className="form-group">
        <label htmlFor="reviewText">Reseña</label>
        <InputTextarea
          id="reviewText"
          value={newReviewText}
          onChange={(e) => onReviewTextChange(e.target.value)}
          placeholder="Escribe tu reseña aquí..."
          rows={5}
          autoResize
          className="review-textarea"
        />
      </div>
      <div className="form-group">
        <label htmlFor="rating">Calificación</label>
        <Dropdown
          id="rating"
          value={rating}
          options={ratingOptions}
          onChange={(e) => onRatingChange(e.value)}
          placeholder="Selecciona calificación"
          className="rating-dropdown"
        />
      </div>
    </div>
  );
};

export default AddReview;
