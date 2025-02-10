// src/pages/Reseñas.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ReviewList from '../components/ReviewList';
import AddReview from '../components/AddReview';
import { getAuth } from 'firebase/auth';
import { getProductsByCategory, addReview, getReviews } from '../functions/services/api';
import '../styles/ReseñasStyles.css';

function Reseñas() {
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [newReviewText, setNewReviewText] = useState('');
    const [rating, setRating] = useState(0);
    
    const currentUser = getAuth().currentUser;

    useEffect(() => {
        // Cargar productos y reviews al iniciar
        const loadInitialData = async () => {
            try {
                // 1. Cargar productos electrónicos
                const electronicProducts = await getProductsByCategory('electronics');
                setProducts(electronicProducts);
                
                // 2. Cargar reviews locales
                const storedReviews = localStorage.getItem('reviews');
                const localReviews = storedReviews ? JSON.parse(storedReviews) : [];
                
                // 3. Cargar reviews de API
                const apiReviews = await getReviews();
                
                // Combinar todas las reviews
                setReviews([...localReviews, ...apiReviews]);
                
            } catch (error) {
                console.error('Error cargando datos iniciales:', error);
            }
        };
        
        loadInitialData();
    }, []);

    const handleAddReview = async () => {
        if (!currentUser) {
            alert('Debe iniciar sesión para dejar una reseña');
            return;
        }
        
        if (!selectedProductId || !newReviewText || !rating) {
            alert('Por favor complete todos los campos.');
            return;
        }

        const newReview = {
            productId: selectedProductId,
            reviewText: newReviewText,
            rating,
            userId: currentUser.uid,
            username: currentUser.displayName || 'Anónimo',
            createdAt: new Date().toISOString(),
        };

        try {
            // 1. Guardar en API
            await addReview({
                productId: selectedProductId,
                comment: newReviewText,
                rating,
                userId: currentUser.uid
            });
            
            // 2. Actualizar estado local
            const updatedReviews = [newReview, ...reviews];
            setReviews(updatedReviews);
            
            // 3. Guardar en localStorage como respaldo
            localStorage.setItem('reviews', JSON.stringify(updatedReviews));
            
            setShowForm(false);
            resetForm();
            
        } catch (error) {
            console.error('Error al guardar reseña:', error);
            alert('Error al guardar la reseña. Se guardará localmente.');
            
            // Fallback: Guardar solo localmente
            const localUpdated = [newReview, ...reviews];
            setReviews(localUpdated);
            localStorage.setItem('reviews', JSON.stringify(localUpdated));
        }
    };

    const resetForm = () => {
        setSelectedProductId('');
        setNewReviewText('');
        setRating(0);
    };

    return (
        <div className="reseñas-page">
            <Header />
            <div className='reseñas-container'>
                <h2 className="section-title">Reseñas de Clientes</h2>
                <ReviewList 
                    reviews={reviews} 
                    products={products} 
                />

                <button 
                    className="add-review-btn" 
                    onClick={() => setShowForm(true)}
                >
                    Escribir una Reseña
                </button>

                {showForm && (
                    <AddReview
                        products={products}
                        selectedProductId={selectedProductId}
                        onProductIdChange={setSelectedProductId}
                        newReviewText={newReviewText}
                        onReviewTextChange={setNewReviewText}
                        rating={rating}
                        onRatingChange={setRating}
                        onSubmit={handleAddReview}
                        onCancel={() => {
                            setShowForm(false);
                            resetForm();
                        }}
                    />
                )}
            </div>
            <BottomNav />
        </div>
    );
}

export default Reseñas;