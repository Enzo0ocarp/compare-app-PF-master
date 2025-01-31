// src/components/ReviewList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewList = ({ reviews }) => {
    const [apiReviews, setApiReviews] = useState([]);
    
    // Eliminar cualquier llamada a Fake Store API
    // Usar tu propia API implementada en Firebase Functions
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('/api/reviews'); // Usar tu endpoint
                setApiReviews(response.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="review-list">
            {/* Mostrar ambas fuentes de reviews */}
            {[...reviews, ...apiReviews].map((review, index) => (
                <div key={index} className="review-item">
                    <h4>{review.username}</h4>
                    <p>Rating: {'★'.repeat(review.rating)}</p>
                    <p>{review.reviewText || review.comment}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;