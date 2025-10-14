// src/utils/productsHelpers.js
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../functions/src/firebaseConfig';

/**
 * Agregar producto a favoritos del usuario
 */
export const addProductToFavorites = async (userId, productData) => {
  try {
    // Verificar si ya existe
    const existingQuery = query(
      collection(db, 'user_favorites'),
      where('userId', '==', userId),
      where('productId', '==', productData.productId)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error('Este producto ya está en tus favoritos');
    }

    // Agregar producto
    const docRef = await addDoc(collection(db, 'user_favorites'), {
      userId,
      productId: productData.productId || productData.id,
      productName: productData.nombre || productData.name,
      brand: productData.marca || productData.brand || 'Sin marca',
      category: productData.categoria || productData.category || 'Sin categoría',
      price: productData.precio || productData.price || 0,
      store: productData.sucursal || productData.store || 'Varios',
      hasNutritionalInfo: productData.hasNutritionalInfo || false,
      isFavorite: true,
      nutritionalScore: productData.nutritionalScore || null,
      imageUrl: productData.imageUrl || productData.image || null,
      addedDate: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error agregando producto:', error);
    throw error;
  }
};

/**
 * Verificar si un producto está en favoritos
 */
export const isProductInFavorites = async (userId, productId) => {
  try {
    const q = query(
      collection(db, 'user_favorites'),
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error verificando favorito:', error);
    return false;
  }
};

/**
 * Obtener estadísticas de productos del usuario
 */
export const getUserProductsStats = async (userId) => {
  try {
    const q = query(
      collection(db, 'user_favorites'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => doc.data());

    return {
      total: products.length,
      withNutritionalInfo: products.filter(p => p.hasNutritionalInfo).length,
      favorites: products.filter(p => p.isFavorite).length,
      avgPrice: products.length > 0 
        ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
        : 0
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      total: 0,
      withNutritionalInfo: 0,
      favorites: 0,
      avgPrice: 0
    };
  }
};