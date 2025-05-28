// src/services/api.js
import axios from 'axios';
import { auth } from '../src/firebaseConfig';

// Configuración para tu nuevo backend
const backendApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
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

// === NUEVAS FUNCIONES PARA TU BACKEND ===

/**
 * Obtiene productos con filtros y paginación
 * @param {Object} params - Parámetros de consulta
 * @param {string} params.type - 'sucursal' o 'producto'
 * @param {string} params.provincia - Código de provincia
 * @param {string} params.localidad - Nombre de localidad
 * @param {string} params.marca - Marca del producto
 * @param {string} params.nombre - Nombre parcial del producto
 * @param {number} params.page - Página (default: 1)
 * @param {number} params.limit - Límite por página (default: 100)
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await backendApi.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

/**
 * Obtiene un producto específico por ID
 * @param {string} id - ID del producto
 */
export const getProductById = async (id) => {
  try {
    const response = await backendApi.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo producto por ID:', error);
    throw error;
  }
};

/**
 * Busca productos por término
 * @param {string} searchTerm - Término de búsqueda
 */
export const searchProducts = async (searchTerm) => {
  try {
    const response = await backendApi.get('/search', {
      params: { q: searchTerm }
    });
    return response.data;
  } catch (error) {
    console.error('Error en búsqueda:', error);
    throw error;
  }
};

/**
 * Obtiene todas las sucursales
 */
export const getBranches = async (params = {}) => {
  try {
    const response = await backendApi.get('/products', {
      params: { type: 'sucursal', ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo sucursales:', error);
    throw error;
  }
};

/**
 * Obtiene productos por marca
 * @param {string} brand - Nombre de la marca
 */
export const getProductsByBrand = async (brand, params = {}) => {
  try {
    const response = await backendApi.get('/products', {
      params: { marca: brand, type: 'producto', ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo productos por marca:', error);
    throw error;
  }
};

/**
 * Obtiene productos destacados (aleatorios)
 * @param {number} count - Cantidad de productos a obtener
 */
export const getFeaturedProducts = async (count = 5) => {
  try {
    const response = await backendApi.get('/products', {
      params: { type: 'producto', limit: 50 }
    });
    
    // Mezclamos y seleccionamos productos aleatorios
    const shuffled = response.data.data.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error obteniendo productos destacados:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas generales
 */
export const getStats = async () => {
  try {
    const [productsResponse, branchesResponse] = await Promise.all([
      backendApi.get('/products', { params: { type: 'producto', limit: 1 } }),
      backendApi.get('/products', { params: { type: 'sucursal', limit: 1 } })
    ]);
    
    return {
      totalProducts: productsResponse.data.total,
      totalBranches: branchesResponse.data.total
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

// === FUNCIONES LEGACY (mantenidas para compatibilidad) ===

/**
 * @deprecated Usar getProducts() en su lugar
 */
export const getAllStoreProducts = async () => {
  console.warn('getAllStoreProducts() está deprecado. Usa getProducts() en su lugar.');
  try {
    const response = await getProducts({ type: 'producto', limit: 100 });
    return response.data.map(product => ({
      id: product.id,
      title: product.nombre,
      price: product.precio || 0,
      description: `${product.marca} - ${product.presentacion || ''}`,
      category: product.marca,
      image: '/placeholder-product.png', // Placeholder ya que no hay imágenes
      rating: { rate: 4.0, count: Math.floor(Math.random() * 100) }
    }));
  } catch (error) {
    console.error('Error en getAllStoreProducts:', error);
    return [];
  }
};

// === FUNCIONES PARA RESEÑAS (sin cambios) ===

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
      comment: reviewData.comment
    });
    return response.data;
  } catch (error) {
    console.error('Error agregando reseña:', error);
    throw error;
  }
};