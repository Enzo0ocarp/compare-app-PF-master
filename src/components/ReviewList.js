// src/components/ReviewList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewList = ({ reviews }) => {
    const [apiReviews, setApiReviews] = useState([]);
    
    useEffect(() => {
      const fetchReviews = async () => {
        try {
          const response = await axios.get(
            'https://us-central1-compareapp-43d31.cloudfunctions.net/api/reviews'
          );
          setApiReviews(response.data);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      };
      fetchReviews();
    }, []);

    return (
      <div className="review-list">
        {[...reviews, ...apiReviews].map((review) => (
          <div key={review.id} className="review-item">
            <h4>{review.username || 'Usuario Anónimo'}</h4>
            <p>Rating: {'★'.repeat(review.rating)}</p>
            <p>{review.comment || review.reviewText}</p>
            <small>{new Date(review.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    );
};

export default ReviewList; // Añadir export default