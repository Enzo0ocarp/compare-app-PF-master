// src/components/ReviewList.js
import React from 'react';

const ReviewList = ({ reviews, products }) => {
  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.id} className="review-item">
          <h4>{review.username || 'Usuario Anónimo'}</h4>
          <p>Rating: {'★'.repeat(review.rating)}</p>
          <p>{review.comment}</p>
          <small>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</small>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
