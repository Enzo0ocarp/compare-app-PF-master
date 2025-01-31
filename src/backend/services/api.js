// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://fakestoreapi.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configuración para Firebase Functions (cambiar por tu URL de despliegue)
const firebaseApi = axios.create({
    baseURL: 'https://us-central1-compareapp-43d31.cloudfunctions.net/api',
    timeout: 15000,
});

// Productos
export const getProductsByCategory = async (category) => {
    try {
        const response = await api.get(`/products/category/${category}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        throw error;
    }
};

export const searchProductByName = async (productName) => {
    try {
        const response = await api.get('/products', {
            params: { title: productName },
        });
        return response.data;
    } catch (error) {
        console.error('Error al buscar el producto:', error);
        throw error;
    }
};

// Reseñas
export const getReviews = async () => {
    try {
        const response = await firebaseApi.get('/reviews');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo reseñas:', error);
        throw error;
    }
};

export const addReview = async (reviewData) => {
    try {
        const response = await firebaseApi.post('/reviews', reviewData);
        return response.data;
    } catch (error) {
        console.error('Error agregando reseña:', error);
        throw error;
    }
};

// Funciones adicionales
export const getProductDetails = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalles del producto:', error);
        throw error;
    }
};

export default api;