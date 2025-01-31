// src/pages/Reseñas.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ReviewList from '../components/ReviewList';
import AddReview from '../components/AddReview';
import axios from '../backend/services/api';
import '../styles/ReseñasStyles.css';

function Reseñas() {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    
    useEffect(() => {
        axios.get('/reviews')
            .then(response => setReviews(response.data))
            .catch(error => console.error('Error al cargar reseñas:', error));
    }, []);
    
    const handleAddReview = (newReview) => {
        setReviews([newReview, ...reviews]);
        setShowForm(false);
    };

    return (
        <div className="reseñas-page">
            <Header />
            <div className='reseñas-container'>
                <h2 className="section-title">Reseñas de Clientes</h2>
                <ReviewList reviews={reviews} />
                <button className="add-review-btn" onClick={() => setShowForm(true)}>
                    Escribir una Reseña
                </button>
                {showForm && <AddReview onAddReview={handleAddReview} />}
            </div>
            <BottomNav />
        </div>
    );
}

export default Reseñas;
