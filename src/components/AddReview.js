import React from 'react';
import { useForm } from 'react-hook-form';
import axios from '../backend/services/api';
import '../styles/AddReviewStyles.css';

function AddReview({ onAddReview }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('/reviews', data);
            onAddReview(response.data);
            reset();
        } catch (error) {
            console.error('Error al enviar la reseña:', error);
        }
    };

    return (
        <div className="add-review-form">
            <h3>Escribir una Reseña</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="name">Nombre</label>
                    <input type="text" id="name" {...register('name', { required: 'El nombre es obligatorio' })} />
                    {errors.name && <span className="error-text">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="rating">Calificación (1-5)</label>
                    <select id="rating" {...register('rating', { required: 'La calificación es obligatoria' })}>
                        <option value="">Selecciona una opción</option>
                        <option value="1">1 - Muy malo</option>
                        <option value="2">2 - Malo</option>
                        <option value="3">3 - Regular</option>
                        <option value="4">4 - Bueno</option>
                        <option value="5">5 - Excelente</option>
                    </select>
                    {errors.rating && <span className="error-text">{errors.rating.message}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="comment">Comentario</label>
                    <textarea id="comment" {...register('comment', { required: 'El comentario es obligatorio' })}></textarea>
                    {errors.comment && <span className="error-text">{errors.comment.message}</span>}
                </div>
                <button type="submit" className="submit-btn">Publicar Reseña</button>
            </form>
        </div>
    );
}

export default AddReview;
