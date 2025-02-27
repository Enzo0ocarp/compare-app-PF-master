// src/components/ReviewList.js
import React from 'react';
import { Card } from 'primereact/card';
import '../styles/ReviewList.css';

const ReviewList = ({ reviews, products }) => {
  // Para mostrar el nombre del producto en la reseña, buscamos el producto en la lista
  const getProductTitle = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.title : 'Producto desconocido';
  };

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <Card key={review.id} className="review-card">
          <div className="review-header">
            <h4>{review.username || 'Usuario Anónimo'}</h4>
            <span className="review-product">{getProductTitle(review.productId)}</span>
          </div>
          <div className="review-body">
            <p className="review-rating">
              {Array(review.rating).fill('★').join('')}
              {Array(5 - review.rating).fill('☆').join('')}
            </p>
            <p className="review-comment">{review.comment}</p>
          </div>
          <div className="review-footer">
            <small>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</small>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ReviewList;
