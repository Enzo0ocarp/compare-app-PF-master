// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://losprecios.co/api/v1/', // URL base de la API de Los Precios
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Ejemplo de función para obtener productos por categoría
export const getProductsByCategory = async (categoryId) => {
    try {
        const response = await api.get(`category/${categoryId}/products`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        throw error;
    }
};

// Ejemplo de función para buscar un producto por nombre
export const searchProductByName = async (productName) => {
    try {
        const response = await api.get(`product/search`, {
            params: { q: productName },
        });
        return response.data;
    } catch (error) {
        console.error('Error al buscar el producto:', error);
        throw error;
    }
};

// Ejemplo de función para obtener detalles de un producto por su ID
export const getProductDetails = async (productId) => {
    try {
        const response = await api.get(`product/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalles del producto:', error);
        throw error;
    }
};

export default api;
