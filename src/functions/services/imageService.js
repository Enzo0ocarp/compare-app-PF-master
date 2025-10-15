// src/services/imageService.js - SERVICIO DE IMÁGENES
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../src/firebaseConfig';

/**
 * Valida archivo de imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} - {valid: boolean, error: string}
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    return { valid: false, error: 'No se seleccionó ningún archivo' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato no válido. Solo JPG, PNG, WebP' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Archivo demasiado grande. Máximo 5MB' };
  }
  
  return { valid: true, error: null };
};

/**
 * Sube imagen de producto a Firebase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} productId - ID del producto
 * @param {string} userId - ID del usuario que sube la imagen
 * @returns {Promise<string>} URL de la imagen subida
 */
export const uploadProductImage = async (file, productId, userId) => {
  try {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Crear referencia única
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `product-images/${productId}/${fileName}`);
    
    console.log('📤 Subiendo imagen a Storage...');
    
    // Subir archivo
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Actualizar documento del producto en Firestore
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      imageUrl: downloadURL,
      imagePath: snapshot.ref.fullPath,
      imageUploadedBy: userId,
      imageUploadedAt: serverTimestamp(),
      imageStatus: 'pending', // Pendiente de aprobación por Admin
      imageFileName: fileName,
      imageSize: file.size,
      imageType: file.type
    });
    
    console.log('✅ Imagen subida exitosamente');
    return downloadURL;
    
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    throw error;
  }
};

/**
 * Elimina imagen de un producto
 * @param {string} imagePath - Path de la imagen en Storage
 * @param {string} productId - ID del producto
 */
export const deleteProductImage = async (imagePath, productId) => {
  try {
    if (!imagePath) {
      throw new Error('No hay imagen para eliminar');
    }
    
    // Eliminar de Storage
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    
    // Limpiar referencias en Firestore
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      imageUrl: null,
      imagePath: null,
      imageUploadedBy: null,
      imageUploadedAt: null,
      imageStatus: null,
      imageFileName: null,
      imageSize: null,
      imageType: null,
      imageDeletedAt: serverTimestamp()
    });
    
    console.log('🗑️ Imagen eliminada');
    return true;
    
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    throw error;
  }
};