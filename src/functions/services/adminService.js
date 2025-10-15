// src/services/adminService.js - SERVICIO DE ADMINISTRACIÓN
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../src/firebaseConfig';

/**
 * Verifica si un usuario es administrador
 * @param {string} userId - ID del usuario
 * @returns {Promise<boolean>}
 */
export const isUserAdmin = async (userId) => {
  try {
    if (!userId) return false;
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('Usuario no existe en Firestore');
      return false;
    }
    
    const userData = userDoc.data();
    return userData.role === 'admin' || userData.isAdmin === true;
    
  } catch (error) {
    console.error('Error verificando rol de admin:', error);
    return false;
  }
};

/**
 * Asigna rol de administrador a un usuario
 * @param {string} userId - ID del usuario
 * @param {string} assignedBy - ID del admin que asigna el rol
 */
export const assignAdminRole = async (userId, assignedBy) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }
    
    await updateDoc(userRef, {
      role: 'admin',
      isAdmin: true,
      adminAssignedAt: serverTimestamp(),
      adminAssignedBy: assignedBy
    });
    
    console.log('✅ Rol de admin asignado correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error asignando rol de admin:', error);
    throw error;
  }
};

/**
 * Remueve rol de administrador
 * @param {string} userId - ID del usuario
 */
export const removeAdminRole = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      role: 'user',
      isAdmin: false,
      adminRemovedAt: serverTimestamp()
    });
    
    console.log('✅ Rol de admin removido');
    return true;
    
  } catch (error) {
    console.error('❌ Error removiendo rol de admin:', error);
    throw error;
  }
};

/**
 * Obtiene todos los productos pendientes de verificación de imagen
 */
export const getPendingImageProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('imageStatus', '==', 'pending'),
      where('activo', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const products = [];
    
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📸 Productos con imágenes pendientes: ${products.length}`);
    return products;
    
  } catch (error) {
    console.error('Error obteniendo productos pendientes:', error);
    return [];
  }
};

/**
 * Aprueba la imagen de un producto
 * @param {string} productId - ID del producto
 * @param {string} adminId - ID del admin que aprueba
 */
export const approveProductImage = async (productId, adminId) => {
  try {
    const productRef = doc(db, 'products', productId);
    
    await updateDoc(productRef, {
      imageStatus: 'approved',
      imageApprovedBy: adminId,
      imageApprovedAt: serverTimestamp()
    });
    
    console.log('✅ Imagen aprobada');
    return true;
    
  } catch (error) {
    console.error('Error aprobando imagen:', error);
    throw error;
  }
};

/**
 * Rechaza la imagen de un producto
 * @param {string} productId - ID del producto
 * @param {string} adminId - ID del admin
 * @param {string} reason - Razón del rechazo
 */
export const rejectProductImage = async (productId, adminId, reason) => {
  try {
    const productRef = doc(db, 'products', productId);
    
    await updateDoc(productRef, {
      imageStatus: 'rejected',
      imageRejectedBy: adminId,
      imageRejectedAt: serverTimestamp(),
      imageRejectionReason: reason,
      imageUrl: null // Limpiar la URL de imagen
    });
    
    console.log('❌ Imagen rechazada');
    return true;
    
  } catch (error) {
    console.error('Error rechazando imagen:', error);
    throw error;
  }
};