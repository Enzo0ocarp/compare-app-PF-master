// src/services/api.js
import axios from 'axios';
import { auth } from '../src/firebaseConfig'; // 🔥 Importación necesaria

// Configuración para Fake Store API
const fakestoreApi = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000
});

// Configuración para Firebase Functions
const firebaseApi = axios.create({
  baseURL: 'https://us-central1-compareapp-43d31.cloudfunctions.net/api',
  timeout: 15000
});

// Interceptor para Firebase
firebaseApi.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para obtener productos por categoría (Fake Store API)
export const getProductsByCategory = async (category) => {
  try {
    const response = await fakestoreApi.get(`/products/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

// Funciones para reseñas (Firebase Functions)
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
    const response = await firebaseApi.post('/reviews', {
      productId: reviewData.productId,
      userId: reviewData.userId,
      rating: reviewData.rating,
      comment: reviewData.reviewText
    });
    return response.data;
  } catch (error) {
    console.error('Error agregando reseña:', error);
    throw error;
  }
};