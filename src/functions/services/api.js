// src/services/api.js
import axios from 'axios';
import { auth } from '../src/firebaseConfig';

// Configuración para Open Food Facts API (para productos de supermercado)
const openFoodFactsApi = axios.create({
  baseURL: 'https://world.openfoodfacts.org',
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

// Función para obtener todos los productos de supermercado usando Open Food Facts
export const getAllSupermarketProducts = async () => {
  try {
    // Usamos el endpoint /search.json para obtener una lista de productos (limitamos a 100 para ejemplo)
    const response = await openFoodFactsApi.get('/search.json', {
      params: {
        page_size: 100,
        fields: 'id,product_name,brands,image_front_small_url,categories'
      }
    });
    return response.data.products;
  } catch (error) {
    console.error('Error obteniendo productos de supermercado:', error);
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
      comment: reviewData.reviewText
    });
    return response.data;
  } catch (error) {
    console.error('Error agregando reseña:', error);
    throw error;
  }
};
