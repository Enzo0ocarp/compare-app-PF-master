// src/functions/src/firebaseConfig.js - CONFIGURACIÓN ACTUALIZADA CON VARIABLES DE ENTORNO Y STORAGE
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Verificar que todas las variables estén definidas
const requiredEnvVars = {
  REACT_APP_FIREBASE_API_KEY: firebaseConfig.apiKey,
  REACT_APP_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  REACT_APP_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  REACT_APP_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  REACT_APP_FIREBASE_APP_ID: firebaseConfig.appId
};

// Validar configuración
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Variables de entorno de Firebase faltantes:', missingVars);
  throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuración para emuladores en desarrollo (opcional)
if (process.env.NODE_ENV === 'development') {
  const useEmulators = process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators && window.location.hostname === 'localhost') {
    try {
      // Solo conectar si no están ya conectados
      if (!auth._delegate?._config?.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('Conectado al emulador de Auth');
      }
      
      if (!db._delegate?._databaseId?.projectId?.includes('localhost')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('Conectado al emulador de Firestore');
      }
      
      if (!storage._delegate?._host?.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('Conectado al emulador de Storage');
      }
    } catch (error) {
      console.warn('Error conectando a emuladores (probablemente ya conectados):', error.message);
    }
  }
}

// Función para subir imagen de perfil
export const uploadProfilePhoto = async (file, userId) => {
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  
  if (!file || !userId) {
    throw new Error('File and userId are required');
  }
  
  // Validaciones
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Solo JPG, PNG y WebP.');
  }
  
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 5MB.');
  }
  
  try {
    // Crear referencia única con timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `profile-photos/${userId}/${fileName}`);
    
    // Subir archivo
    console.log('Subiendo archivo a Storage...');
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Archivo subido exitosamente:', downloadURL);
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      size: file.size,
      type: file.type,
      fileName: fileName
    };
    
  } catch (error) {
    console.error('Error detallado subiendo imagen:', error);
    
    // Manejar errores específicos de Storage
    if (error.code === 'storage/unauthorized') {
      throw new Error('No tienes permisos para subir archivos. Verifica las reglas de Storage.');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('Se ha excedido la cuota de almacenamiento.');
    } else if (error.code === 'storage/unauthenticated') {
      throw new Error('Debes iniciar sesión para subir archivos.');
    } else {
      throw new Error(`Error al subir la imagen: ${error.message}`);
    }
  }
};

// Función para eliminar imagen anterior (opcional)
export const deleteProfilePhoto = async (photoPath) => {
  const { ref, deleteObject } = await import('firebase/storage');
  
  if (!photoPath) return;
  
  try {
    const photoRef = ref(storage, photoPath);
    await deleteObject(photoRef);
    console.log('Imagen anterior eliminada:', photoPath);
  } catch (error) {
    console.warn('No se pudo eliminar la imagen anterior:', error.message);
    // No lanzar error porque la subida fue exitosa
  }
};

// Manejo de errores específicos de Firebase
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    // Auth errors
    'auth/invalid-api-key': 'La configuración de Firebase no es válida. Contacta al administrador.',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'El email ya está en uso',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/invalid-email': 'Email inválido',
    'auth/network-request-failed': 'Error de red. Verifica tu conexión.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/operation-not-allowed': 'Operación no permitida',
    
    // Firestore errors
    'firestore/permission-denied': 'No tienes permisos para esta operación',
    'firestore/unavailable': 'El servicio no está disponible temporalmente',
    'firestore/deadline-exceeded': 'Tiempo de espera agotado',
    'firestore/not-found': 'Documento no encontrado',
    'firestore/already-exists': 'El documento ya existe',
    'firestore/resource-exhausted': 'Se han excedido los límites del servicio',
    
    // Storage errors
    'storage/unauthorized': 'No autorizado para subir archivos',
    'storage/object-not-found': 'Archivo no encontrado',
    'storage/quota-exceeded': 'Cuota de almacenamiento excedida',
    'storage/unauthenticated': 'Debes iniciar sesión para subir archivos',
    'storage/retry-limit-exceeded': 'Límite de reintentos excedido',
    'storage/invalid-format': 'Formato de archivo inválido',
    'storage/invalid-url': 'URL de Storage inválida',
    'storage/no-default-bucket': 'No hay bucket de Storage configurado'
  };
  
  return errorMessages[errorCode] || 'Error desconocido. Intenta nuevamente.';
};

// Función de utilidad para validar imágenes
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!file) {
    throw new Error('No se seleccionó ningún archivo');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato no válido. Solo se permiten: JPG, PNG, WebP');
  }
  
  if (file.size > maxSize) {
    throw new Error('Archivo demasiado grande. Máximo 5MB');
  }
  
  return true;
};

export const getUserFavoriteBranches = async (userId) => {
  try {
    if (!userId) {
      throw new Error('userId es requerido');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('Usuario no existe, creando documento...');
      await setDoc(userRef, {
        favoriteBranches: [],
        createdAt: new Date().toISOString()
      });
      return [];
    }

    return userDoc.data().favoriteBranches || [];
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    throw error;
  }
};

/**
 * Agregar sucursal a favoritos
 */
export const addBranchToFavorites = async (userId, branchId) => {
  try {
    if (!userId || !branchId) {
      throw new Error('userId y branchId son requeridos');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Crear documento si no existe
      await setDoc(userRef, {
        favoriteBranches: [branchId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Actualizar documento existente
      await updateDoc(userRef, {
        favoriteBranches: arrayUnion(branchId),
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Sucursal agregada a favoritos:', branchId);
    return true;
  } catch (error) {
    console.error('Error agregando favorito:', error);
    throw error;
  }
};

/**
 * Remover sucursal de favoritos
 */
export const removeBranchFromFavorites = async (userId, branchId) => {
  try {
    if (!userId || !branchId) {
      throw new Error('userId y branchId son requeridos');
    }

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn('Usuario no existe, no hay favoritos para remover');
      return false;
    }

    await updateDoc(userRef, {
      favoriteBranches: arrayRemove(branchId),
      updatedAt: new Date().toISOString()
    });

    console.log('Sucursal removida de favoritos:', branchId);
    return true;
  } catch (error) {
    console.error('Error removiendo favorito:', error);
    throw error;
  }
};

/**
 * Toggle favorito (agregar o remover)
 */
export const toggleBranchFavorite = async (userId, branchId, isFavorite) => {
  try {
    if (isFavorite) {
      return await removeBranchFromFavorites(userId, branchId);
    } else {
      return await addBranchToFavorites(userId, branchId);
    }
  } catch (error) {
    console.error('Error en toggle favorito:', error);
    throw error;
  }
};

// Log de inicialización
console.log('Firebase inicializado correctamente');
console.log('Proyecto:', firebaseConfig.projectId);
console.log('Entorno:', process.env.NODE_ENV);
console.log('Storage Bucket:', firebaseConfig.storageBucket);

export default app;