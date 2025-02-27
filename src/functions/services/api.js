// src/services/api.js
import axios from 'axios';
import { auth } from '../src/firebaseConfig';

// Configuración para Fake Store API
const fakeStoreApi = axios.create({
  baseURL: 'https://fakestoreapi.com',
  timeout: 10000
});

// Configuración para Firebase Functions (para reseñas)
const firebaseApi = axios.create({
  baseURL: 'https://us-central1-compareapp-43d31.cloudfunctions.net/api',
  timeout: 15000
});

// Interceptor para Firebase: agrega token si el usuario está autenticado
firebaseApi.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para obtener todos los productos de Fake Store API
export const getAllStoreProducts = async () => {
  try {
    const response = await fakeStoreApi.get('/products');
    return response.data; // La API devuelve un array de productos
  } catch (error) {
    console.error('Error obteniendo productos de Fake Store API:', error);
    throw error;
  }
};

// Funciones para reseñas (Firebase Functions)
export const getReviews = async (productId = null) => {
  try {
    const url = productId ? `/reviews?productId=${productId}` : '/reviews';
    const response = await firebaseApi.get(url);
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
      comment: reviewData.comment  // Usamos "comment" en vez de reviewText
    });
    return response.data;
  } catch (error) {
    console.error('Error agregando reseña:', error);
    throw error;
  }
};
