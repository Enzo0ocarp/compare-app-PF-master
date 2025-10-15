// src/services/notificationService.js
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../functions/src/firebaseConfig';

/**
 * Crear una nueva notificación para un usuario
 */
export const createNotification = async (userId, notificationData) => {
    try {
        const notification = {
            userId,
            message: notificationData.message,
            type: notificationData.type || 'info', // info, success, warning, error
            icon: notificationData.icon || 'pi-info-circle',
            url: notificationData.url || null,
            read: false,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'notifications'), notification);
        console.log('✅ Notificación creada:', docRef.id);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('❌ Error creando notificación:', error);
        throw error;
    }
};

/**
 * Crear notificación de nuevo producto añadido
 */
export const notifyNewProduct = async (userId, productName, category) => {
    return createNotification(userId, {
        message: `Nuevo producto agregado: ${productName} en ${category}`,
        type: 'success',
        icon: 'pi-shopping-cart',
        url: '/productos'
    });
};

/**
 * Crear notificación de cambio de precio
 */
export const notifyPriceChange = async (userId, productName, oldPrice, newPrice) => {
    const priceChanged = newPrice < oldPrice ? 'bajó' : 'subió';
    const icon = newPrice < oldPrice ? 'pi-arrow-down' : 'pi-arrow-up';
    
    return createNotification(userId, {
        message: `El precio de ${productName} ${priceChanged}: $${oldPrice} → $${newPrice}`,
        type: newPrice < oldPrice ? 'success' : 'warning',
        icon,
        url: '/productos'
    });
};

/**
 * Crear notificación de nueva sucursal
 */
export const notifyNewBranch = async (userId, branchName, location) => {
    return createNotification(userId, {
        message: `Nueva sucursal disponible: ${branchName} en ${location}`,
        type: 'info',
        icon: 'pi-map-marker',
        url: '/sucursales'
    });
};

/**
 * Crear notificación de nueva reseña
 */
export const notifyNewReview = async (userId, productName, rating) => {
    return createNotification(userId, {
        message: `Nueva reseña (${rating}⭐) en ${productName}`,
        type: 'info',
        icon: 'pi-star',
        url: '/resenas'
    });
};

/**
 * Marcar notificación como leída
 */
export const markAsRead = async (notificationId) => {
    try {
        const notifRef = doc(db, 'notifications', notificationId);
        await updateDoc(notifRef, { read: true });
        console.log('✅ Notificación marcada como leída');
        return { success: true };
    } catch (error) {
        console.error('❌ Error marcando notificación:', error);
        throw error;
    }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllAsRead = async (userId) => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(notificationsQuery);
        
        const updatePromises = snapshot.docs.map(doc => 
            updateDoc(doc.ref, { read: true })
        );

        await Promise.all(updatePromises);
        console.log(`✅ ${snapshot.docs.length} notificaciones marcadas como leídas`);
        return { success: true, count: snapshot.docs.length };
    } catch (error) {
        console.error('❌ Error marcando todas las notificaciones:', error);
        throw error;
    }
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (notificationId) => {
    try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        console.log('✅ Notificación eliminada');
        return { success: true };
    } catch (error) {
        console.error('❌ Error eliminando notificación:', error);
        throw error;
    }
};

/**
 * Eliminar todas las notificaciones leídas de un usuario
 */
export const deleteReadNotifications = async (userId) => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', true)
        );

        const snapshot = await getDocs(notificationsQuery);
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        console.log(`✅ ${snapshot.docs.length} notificaciones eliminadas`);
        return { success: true, count: snapshot.docs.length };
    } catch (error) {
        console.error('❌ Error eliminando notificaciones:', error);
        throw error;
    }
};

/**
 * Obtener todas las notificaciones de un usuario
 */
export const getUserNotifications = async (userId, limit = 20) => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limit)
        );

        const snapshot = await getDocs(notificationsQuery);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error('❌ Error obteniendo notificaciones:', error);
        throw error;
    }
};

export default {
    createNotification,
    notifyNewProduct,
    notifyPriceChange,
    notifyNewBranch,
    notifyNewReview,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    getUserNotifications
};