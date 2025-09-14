// src/utils/firebaseUtils.js - UTILIDADES ADICIONALES PARA TU APP
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../functions/src/firebaseConfig';

// ===== UTILIDADES PARA USUARIOS =====

export const userUtils = {
  // Crear o actualizar perfil de usuario
  createOrUpdateProfile: async (userId, profileData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      const data = {
        ...profileData,
        updatedAt: serverTimestamp()
      };
      
      if (!userDoc.exists()) {
        data.createdAt = serverTimestamp();
        data.stats = {
          searchesCount: 0,
          favoritesCount: 0,
          contributionsCount: 0,
          reviewsCount: 0,
          estimatedSavings: 0
        };
      }
      
      await setDoc(userRef, data, { merge: true });
      return true;
    } catch (error) {
      console.error('Error en createOrUpdateProfile:', error);
      throw error;
    }
  },

  // Obtener perfil de usuario
  getUserProfile: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  },

  // Incrementar estadística
  incrementStat: async (userId, statName, value = 1) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`stats.${statName}`]: increment(value),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementando estadística:', error);
      throw error;
    }
  }
};

// ===== UTILIDADES PARA RESEÑAS (compatible con tu estructura) =====

export const reviewUtils = {
  // Agregar reseña
  addReview: async (reviewData) => {
    try {
      const review = {
        productId: reviewData.productId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        comment: reviewData.comment || reviewData.reviewText, // Compatible con ambos nombres
        username: reviewData.username || 'Usuario',
        createdAt: serverTimestamp()
      };
      
      const reviewRef = await collection(db, 'reviews');
      const docRef = await setDoc(doc(reviewRef), review);
      
      // Incrementar estadística del usuario
      await userUtils.incrementStat(reviewData.userId, 'reviewsCount');
      
      return docRef.id;
    } catch (error) {
      console.error('Error agregando reseña:', error);
      throw error;
    }
  },

  // Obtener reseñas de un producto
  getProductReviews: async (productId, limitCount = 10) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(reviewsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo reseñas:', error);
      throw error;
    }
  },

  // Obtener reseñas de un usuario
  getUserReviews: async (userId, limitCount = 20) => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(reviewsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo reseñas del usuario:', error);
      throw error;
    }
  }
};

// ===== UTILIDADES PARA CONTRIBUCIONES NUTRICIONALES =====

export const contributionUtils = {
  // Agregar contribución nutricional
  addContribution: async (contributionData) => {
    try {
      const contribution = {
        userId: contributionData.userId,
        productName: contributionData.productName,
        brand: contributionData.brand,
        category: contributionData.category,
        nutritionalInfo: contributionData.nutritionalInfo,
        additionalInfo: contributionData.additionalInfo || '',
        status: 'pending',
        submissionDate: serverTimestamp(),
        reviewedBy: null,
        reviewDate: null
      };
      
      const contributionRef = await collection(db, 'nutritional_contributions');
      const docRef = await setDoc(doc(contributionRef), contribution);
      
      return docRef.id;
    } catch (error) {
      console.error('Error agregando contribución:', error);
      throw error;
    }
  },

  // Obtener contribuciones de un usuario
  getUserContributions: async (userId, limitCount = 20) => {
    try {
      const contributionsQuery = query(
        collection(db, 'nutritional_contributions'),
        where('userId', '==', userId),
        orderBy('submissionDate', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(contributionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submissionDate: doc.data().submissionDate?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error obteniendo contribuciones:', error);
      throw error;
    }
  },

  // Aprobar contribución (solo admins)
  approveContribution: async (contributionId, reviewerId) => {
    try {
      const contributionRef = doc(db, 'nutritional_contributions', contributionId);
      await updateDoc(contributionRef, {
        status: 'approved',
        reviewedBy: reviewerId,
        reviewDate: serverTimestamp()
      });
      
      // Obtener datos de la contribución para incrementar estadística del usuario
      const contributionDoc = await getDoc(contributionRef);
      if (contributionDoc.exists()) {
        const userId = contributionDoc.data().userId;
        await userUtils.incrementStat(userId, 'contributionsCount');
      }
      
      return true;
    } catch (error) {
      console.error('Error aprobando contribución:', error);
      throw error;
    }
  }
};

// ===== UTILIDADES PARA PRODUCTOS =====

export const productUtils = {
  // Obtener productos con paginación
  getProducts: async (limitCount = 20, lastDoc = null, category = null) => {
    try {
      let productQuery = query(
        collection(db, 'products'),
        orderBy('nombre'),
        limit(limitCount)
      );
      
      if (category && category !== 'todos') {
        productQuery = query(
          collection(db, 'products'),
          where('categoria', '==', category),
          orderBy('nombre'),
          limit(limitCount)
        );
      }
      
      if (lastDoc) {
        productQuery = query(productQuery, startAfter(lastDoc));
      }
      
      const snapshot = await getDocs(productQuery);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  // Buscar productos
  searchProducts: async (searchTerm, limitCount = 20) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }
      
      // Firebase no tiene búsqueda de texto completo nativa
      // Esta es una implementación básica que puedes mejorar
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('nombre'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(productsQuery);
      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredProducts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(product => {
          const name = (product.nombre || '').toLowerCase();
          const brand = (product.marca || '').toLowerCase();
          return name.includes(searchTermLower) || brand.includes(searchTermLower);
        });
      
      return filteredProducts;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  }
};

// ===== UTILIDADES GENERALES =====

export const generalUtils = {
  // Validar imagen
  validateImage: (file, maxSizeMB = 5) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = maxSizeMB * 1024 * 1024;
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo JPG, PNG y WebP.');
    }
    
    if (file.size > maxSize) {
      throw new Error(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`);
    }
    
    return true;
  },

  // Formatear fecha
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options })
      .format(new Date(date));
  },

  // Formatear número
  formatNumber: (number, decimals = 0) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  },

  // Formatear moneda
  formatCurrency: (amount, currency = 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Generar ID único
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Sanitizar texto
  sanitizeText: (text) => {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  },

  // Calcular score nutricional básico
  calculateNutritionalScore: (nutritionalInfo) => {
    if (!nutritionalInfo) return 0;
    
    let score = 5; // Base score
    
    // Factores positivos
    if (nutritionalInfo.proteins > 5) score += 1;
    if (nutritionalInfo.fiber > 3) score += 1;
    if (nutritionalInfo.isVegan) score += 0.5;
    if (nutritionalInfo.isOrganic) score += 0.5;
    
    // Factores negativos
    if (nutritionalInfo.sugar > 10) score -= 1.5;
    if (nutritionalInfo.saturatedFats > 5) score -= 1;
    if (nutritionalInfo.sodium > 400) score -= 1;
    if (nutritionalInfo.calories > 500) score -= 0.5;
    
    return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
  }
};

// ===== UTILIDADES DE CACHE =====

export const cacheUtils = {
  // Cache simple en memoria para evitar consultas repetidas
  cache: new Map(),
  
  // Obtener del cache
  get: (key) => {
    const item = cacheUtils.cache.get(key);
    if (!item) return null;
    
    // Verificar si ha expirado (30 minutos por defecto)
    if (Date.now() - item.timestamp > 30 * 60 * 1000) {
      cacheUtils.cache.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  // Guardar en cache
  set: (key, data, ttlMinutes = 30) => {
    cacheUtils.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  },
  
  // Limpiar cache
  clear: () => {
    cacheUtils.cache.clear();
  }
};

// Exportar todo junto para facilitar uso
export default {
  userUtils,
  reviewUtils,
  contributionUtils,
  productUtils,
  generalUtils,
  cacheUtils
};