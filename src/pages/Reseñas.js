// src/pages/Reseñas.js
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Avatar } from 'primereact/avatar';
import { Rating } from 'primereact/rating';
import { Button } from 'primereact/button';
import '../styles/ReseñasStyles.css';

function Reseñas() {
    const reviews = [
        { user: 'Juan', review: 'Excelente calidad en los productos', rating: 5 },
        { user: 'Maria', review: 'Buena atención y rápido servicio', rating: 4 },
        { user: 'Carlos', review: 'El envío fue muy rápido y el empaque perfecto', rating: 5 },
        { user: 'Ana', review: 'Buena relación calidad-precio, ¡volveré a comprar!', rating: 4 }
    ];

    return (
        <div className="reseñas-page">
            <Header />
            <div className='reseñas-container'>
            {/* Sección de Reseñas */}
            <section className="section reviews-section">
                <h2 className="section-title">Reseñas de Clientes</h2>
                <Divider />

                <div className="reviews-list">
                    {reviews.map((review, index) => (
                        <Card key={index} className="review-card">
                            <div className="review-header">
                                <Avatar label={review.user.charAt(0)} shape="circle" className="avatar" />
                                <h3 className="review-user">{review.user}</h3>
                            </div>
                            <Rating value={review.rating} readOnly stars={5} cancel={false} className="rating-stars" />
                            <p className="review-text">{review.review}</p>
                        </Card>
                    ))}
                </div>

                <div className="actions">
                    <Button label="Escribir una Reseña" icon="pi pi-pencil" className="p-button-rounded p-button-success add-review-btn" />
                </div>
            </section>
            </div>
            <BottomNav />
        </div>
    );
}

export default Reseñas;
