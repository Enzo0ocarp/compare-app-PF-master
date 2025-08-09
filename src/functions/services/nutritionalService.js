// src/services/nutritionalService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../src/firebaseConfig';

// Colecciones de Firebase
const COLLECTIONS = {
  PRODUCTS: 'nutritional_products',
  CONTRIBUTIONS: 'nutritional_contributions',
  REVIEWS: 'nutritional_reviews',
  COMPARISONS: 'nutritional_comparisons',
  USER_PREFERENCES: 'user_preferences'
};

// ===== PRODUCTOS NUTRICIONALES =====

/**
 * Obtiene todos los productos con información nutricional
 * @param {number} limitCount - Límite de productos a obtener
 * @param {object} lastDoc - Último documento para paginación
 * @returns {Promise<Array>} Lista de productos
 */
export const getNutritionalProducts = async (limitCount = 20, lastDoc = null) => {
  try {
    let q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('hasNutritionalInfo', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
        lastDoc: doc // Para paginación
      });
    });

    return products;
  } catch (error) {
    console.error('Error obteniendo productos nutricionales:', error);
    throw error;
  }
};

/**
 * Busca productos por nombre o marca
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Productos encontrados
 */
export const searchNutritionalProducts = async (searchTerm) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    
    // Búsqueda por nombre
    const nameQuery = query(
      productsRef,
      where('nombre', '>=', searchTerm),
      where('nombre', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );

    // Búsqueda por marca
    const brandQuery = query(
      productsRef,
      where('marca', '>=', searchTerm),
      where('marca', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );

    const [nameResults, brandResults] = await Promise.all([
      getDocs(nameQuery),
      getDocs(brandQuery)
    ]);

    const products = new Map();

    nameResults.forEach((doc) => {
      products.set(doc.id, { id: doc.id, ...doc.data() });
    });

    brandResults.forEach((doc) => {
      products.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return Array.from(products.values());
  } catch (error) {
    console.error('Error buscando productos:', error);
    throw error;
  }
};

/**
 * Agrega un nuevo producto nutricional
 * @param {object} productData - Datos del producto
 * @returns {Promise<string>} ID del producto creado
 */
export const addNutritionalProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...productData,
      hasNutritionalInfo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      verificationCount: 0,
      averageRating: 0,
      totalReviews: 0
    });

    return docRef.id;
  } catch (error) {
    console.error('Error agregando producto:', error);
    throw error;
  }
};

/**
 * Actualiza información nutricional de un producto
 * @param {string} productId - ID del producto
 * @param {object} nutritionalData - Datos nutricionales
 * @returns {Promise<void>}
 */
export const updateProductNutrition = async (productId, nutritionalData) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    
    await updateDoc(productRef, {
      nutritionalData: {
        ...nutritionalData,
        score: calculateNutritionalScore(nutritionalData),
        lastUpdated: serverTimestamp()
      },
      hasNutritionalInfo: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error actualizando información nutricional:', error);
    throw error;
  }
};

// ===== CONTRIBUCIONES =====

/**
 * Agrega una nueva contribución nutricional
 * @param {object} contributionData - Datos de la contribución
 * @param {string} userId - ID del usuario contribuyente
 * @returns {Promise<string>} ID de la contribución
 */
export const addNutritionalContribution = async (contributionData, userId) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CONTRIBUTIONS), {
      ...contributionData,
      userId,
      status: 'pending',
      createdAt: serverTimestamp(),
      votes: {
        helpful: 0,
        notHelpful: 0,
        users: []
      }
    });

    return docRef.id;
  } catch (error) {
    console.error('Error agregando contribución:', error);
    throw error;
  }
};

/**
 * Obtiene contribuciones pendientes (para admins)
 * @returns {Promise<Array>} Lista de contribuciones pendientes
 */
export const getPendingContributions = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CONTRIBUTIONS),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const contributions = [];

    querySnapshot.forEach((doc) => {
      contributions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return contributions;
  } catch (error) {
    console.error('Error obteniendo contribuciones pendientes:', error);
    throw error;
  }
};

/**
 * Aprueba o rechaza una contribución
 * @param {string} contributionId - ID de la contribución
 * @param {string} action - 'approve' o 'reject'
 * @param {string} adminId - ID del administrador
 * @returns {Promise<void>}
 */
export const reviewContribution = async (contributionId, action, adminId) => {
  try {
    const contributionRef = doc(db, COLLECTIONS.CONTRIBUTIONS, contributionId);
    const contributionDoc = await getDoc(contributionRef);
    
    if (!contributionDoc.exists()) {
      throw new Error('Contribución no encontrada');
    }

    const contributionData = contributionDoc.data();

    if (action === 'approve') {
      // Actualizar el producto con los nuevos datos
      await updateProductNutrition(contributionData.productId, contributionData.nutritionalData);
      
      // Actualizar puntos del usuario (gamificación)
      await updateUserPoints(contributionData.userId, 10);
    }

    // Actualizar estado de la contribución
    await updateDoc(contributionRef, {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: adminId,
      reviewedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error revisando contribución:', error);
    throw error;
  }
};

// ===== RESEÑAS Y CALIFICACIONES =====

/**
 * Agrega una reseña a un producto
 * @param {string} productId - ID del producto
 * @param {object} reviewData - Datos de la reseña
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} ID de la reseña
 */
export const addProductReview = async (productId, reviewData, userId) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
      productId,
      userId,
      ...reviewData,
      createdAt: serverTimestamp(),
      helpful: 0,
      reported: false
    });

    // Actualizar promedio de calificación del producto
    await updateProductRating(productId);

    return docRef.id;
  } catch (error) {
    console.error('Error agregando reseña:', error);
    throw error;
  }
};

/**
 * Obtiene reseñas de un producto
 * @param {string} productId - ID del producto
 * @returns {Promise<Array>} Lista de reseñas
 */
export const getProductReviews = async (productId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('productId', '==', productId),
      where('reported', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return reviews;
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    throw error;
  }
};

// ===== COMPARACIONES =====

/**
 * Guarda una comparación de productos
 * @param {Array} productIds - IDs de productos a comparar
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} ID de la comparación
 */
export const saveComparison = async (productIds, userId) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.COMPARISONS), {
      productIds,
      userId,
      createdAt: serverTimestamp(),
      shared: false,
      public: false
    });

    return docRef.id;
  } catch (error) {
    console.error('Error guardando comparación:', error);
    throw error;
  }
};

/**
 * Obtiene comparaciones guardadas del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de comparaciones
 */
export const getUserComparisons = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COMPARISONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const comparisons = [];

    querySnapshot.forEach((doc) => {
      comparisons.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return comparisons;
  } catch (error) {
    console.error('Error obteniendo comparaciones:', error);
    throw error;
  }
};

// ===== PREFERENCIAS DE USUARIO =====

/**
 * Guarda las preferencias nutricionales del usuario
 * @param {string} userId - ID del usuario
 * @param {object} preferences - Preferencias del usuario
 * @returns {Promise<void>}
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userPrefRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    
    await updateDoc(userPrefRef, {
      ...preferences,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      // Si el documento no existe, créalo
      await addDoc(collection(db, COLLECTIONS.USER_PREFERENCES), {
        userId,
        ...preferences,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error guardando preferencias:', error);
    throw error;
  }
};

/**
 * Obtiene las preferencias del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<object>} Preferencias del usuario
 */
export const getUserPreferences = async (userId) => {
  try {
    const userPrefRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    const docSnap = await getDoc(userPrefRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Retornar preferencias por defecto
      return {
        dietaryRestrictions: [],
        allergies: [],
        nutritionalGoals: [],
        preferredBrands: [],
        notifications: {
          newProducts: true,
          priceAlerts: true,
          nutritionalTips: true
        }
      };
    }
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    throw error;
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Calcula el score nutricional de un producto
 * @param {object} nutritionalData - Datos nutricionales
 * @returns {number} Score del 1 al 10
 */
export const calculateNutritionalScore = (nutritionalData) => {
  if (!nutritionalData) return 0;
  
  let score = 10;
  
  // Penalizaciones
  if (nutritionalData.saturatedFats > 5) score -= 2;
  if (nutritionalData.sodium > 400) score -= 1.5;
  if (nutritionalData.sugar > 10) score -= 2;
  if (nutritionalData.calories > 500) score -= 1;
  
  // Bonificaciones
  if (nutritionalData.fiber > 3) score += 1;
  if (nutritionalData.proteins > 5) score += 0.5;
  if (nutritionalData.vitamins && nutritionalData.vitamins.length > 0) score += 0.5;
  
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
};

/**
 * Actualiza la calificación promedio de un producto
 * @param {string} productId - ID del producto
 * @returns {Promise<void>}
 */
const updateProductRating = async (productId) => {
  try {
    const reviewsQuery = query(
      collection(db, COLLECTIONS.REVIEWS),
      where('productId', '==', productId),
      where('reported', '==', false)
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    let totalRating = 0;
    let reviewCount = 0;

    reviewsSnapshot.forEach((doc) => {
      const review = doc.data();
      totalRating += review.rating;
      reviewCount++;
    });

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await updateDoc(productRef, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviewCount,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error('Error actualizando calificación del producto:', error);
    throw error;
  }
};

/**
 * Actualiza los puntos del usuario (sistema de gamificación)
 * @param {string} userId - ID del usuario
 * @param {number} points - Puntos a agregar
 * @returns {Promise<void>}
 */
const updateUserPoints = async (userId, points) => {
  try {
    const userPrefRef = doc(db, COLLECTIONS.USER_PREFERENCES, userId);
    const userDoc = await getDoc(userPrefRef);
    
    const currentPoints = userDoc.exists() ? (userDoc.data().points || 0) : 0;
    
    await updateDoc(userPrefRef, {
      points: currentPoints + points,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      // Si el documento no existe, créalo
      await addDoc(collection(db, COLLECTIONS.USER_PREFERENCES), {
        userId,
        points,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error actualizando puntos del usuario:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas generales de la plataforma
 * @returns {Promise<object>} Estadísticas
 */
export const getNutritionalStats = async () => {
  try {
    const [productsSnap, contributionsSnap, reviewsSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.PRODUCTS), where('hasNutritionalInfo', '==', true))),
      getDocs(query(collection(db, COLLECTIONS.CONTRIBUTIONS), where('status', '==', 'approved'))),
      getDocs(collection(db, COLLECTIONS.REVIEWS))
    ]);

    return {
      totalProducts: productsSnap.size,
      totalContributions: contributionsSnap.size,
      totalReviews: reviewsSnap.size,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};