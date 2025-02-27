// src/pages/Reseñas.js
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ReviewList from '../components/ReviewList';
import AddReview from '../components/AddReview';
import { getAuth } from 'firebase/auth';
import { getAllStoreProducts, addReview, getReviews } from '../functions/services/api';
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
    const loadInitialData = async () => {
      try {
        const allProducts = await getAllStoreProducts();
        setProducts(allProducts);
        const apiReviews = await getReviews();
        setReviews(apiReviews);
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
      }
    };
    loadInitialData();
  }, []);

  const handleAddReview = async () => {
    if (!selectedProductId || !newReviewText || !rating) {
      alert('Por favor complete todos los campos.');
      return;
    }

    const reviewPayload = {
      productId: selectedProductId,
      comment: newReviewText,
      rating,
      userId: currentUser ? currentUser.uid : null
    };

    try {
      const savedReview = await addReview(reviewPayload);
      setReviews(prev => [savedReview, ...prev]);
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      const errorDetails =
        error.response && error.response.data && error.response.data.details
          ? error.response.data.details
          : '';
      alert(`Error al guardar la reseña. ${errorDetails}\nSe guardará localmente.`);
      const newReview = {
        productId: selectedProductId,
        comment: newReviewText,
        rating,
        userId: currentUser ? currentUser.uid : null,
        username: currentUser ? currentUser.displayName || 'Anónimo' : 'Anónimo',
        createdAt: new Date().toISOString(),
      };
      setReviews(prev => [newReview, ...prev]);
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setNewReviewText('');
    setRating(0);
  };

  const dialogFooter = (
    <div className="form-actions">
      <button type="button" className="submit-btn" onClick={handleAddReview}>
        Enviar Reseña
      </button>
      <button
        type="button"
        className="cancel-btn"
        onClick={() => {
          setShowForm(false);
          resetForm();
        }}
      >
        Cancelar
      </button>
    </div>
  );

  return (
    <div className="reseñas-page">
      <Header />
      <div className="reseñas-container">
        <h2 className="section-title">Reseñas de Clientes</h2>
        <ReviewList reviews={reviews} products={products} />
        <button className="add-review-btn" onClick={() => setShowForm(true)}>
          Escribir una Reseña
        </button>
      </div>
      <Dialog
        header="Agregar Reseña"
        visible={showForm}
        style={{ width: '500px' }}
        footer={dialogFooter}
        onHide={() => {
          setShowForm(false);
          resetForm();
        }}
        className="review-dialog"
      >
        <AddReview
          products={products}
          selectedProductId={selectedProductId}
          onProductIdChange={setSelectedProductId}
          newReviewText={newReviewText}
          onReviewTextChange={setNewReviewText}
          rating={rating}
          onRatingChange={setRating}
        />
      </Dialog>
      <BottomNav />
    </div>
  );
}

export default Reseñas;
