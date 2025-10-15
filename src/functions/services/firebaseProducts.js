// src/services/firebaseProducts.js - VERSIÓN OPTIMIZADA
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../src/firebaseConfig';

// ===== CONFIGURACIÓN DE CATEGORÍAS =====
export const CATEGORY_CONFIG = {
  'Bebidas': { 
    icon: '🥤', 
    color: '#2196f3',
    keywords: ['coca', 'pepsi', 'agua', 'jugo', 'gaseosa', 'bebida']
  },
  'Lácteos': { 
    icon: '🥛', 
    color: '#4caf50',
    keywords: ['leche', 'yogur', 'queso', 'manteca', 'crema']
  },
  'Aceites y Condimentos': { 
    icon: '🫒', 
    color: '#ff9800',
    keywords: ['aceite', 'vinagre', 'sal', 'condimento']
  },
  'Cereales y Legumbres': { 
    icon: '🌾', 
    color: '#8bc34a',
    keywords: ['arroz', 'fideos', 'pasta', 'avena', 'cereal']
  },
  'Snacks y Dulces': { 
    icon: '🍪', 
    color: '#e91e63',
    keywords: ['galletas', 'chocolate', 'alfajor', 'dulce']
  },
  'Carnes': {
    icon: '🥩',
    color: '#795548',
    keywords: ['carne', 'pollo', 'pescado', 'jamón', 'chorizo']
  },
  'Frutas y Verduras': {
    icon: '🍎',
    color: '#4caf50',
    keywords: ['banana', 'manzana', 'tomate', 'lechuga', 'papa']
  },
  'Limpieza': {
    icon: '🧽',
    color: '#00bcd4',
    keywords: ['detergente', 'lavandina', 'jabón', 'papel']
  },
  'Otros': { 
    icon: '📦', 
    color: '#9e9e9e',
    keywords: []
  }
};

// ===== UTILIDAD: DETERMINAR CATEGORÍA =====
const determineCategory = (nombre, marca, categoria_principal) => {
  if (categoria_principal) {
    const categoryName = categoria_principal.charAt(0).toUpperCase() + categoria_principal.slice(1);
    if (CATEGORY_CONFIG[categoryName]) return categoryName;
  }
  
  const nombreLower = (nombre || '').toLowerCase();
  const marcaLower = (marca || '').toLowerCase();
  
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    if (config.keywords.some(keyword => 
      nombreLower.includes(keyword) || marcaLower.includes(keyword)
    )) {
      return category;
    }
  }
  
  return 'Otros';
};

// ===== OBTENER TODOS LOS PRODUCTOS (UNA SOLA VEZ) =====
export const getAllProducts = async () => {
  try {
    console.log('🔍 Cargando TODOS los productos de Firestore...');
    
    const productsQuery = query(
      collection(db, 'products'),
      where('activo', '==', true),
      orderBy('nombre')
    );
    
    const snapshot = await getDocs(productsQuery);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      const category = determineCategory(data.nombre, data.marca, data.categoria_principal);
      
      return {
        id: doc.id,
        nombre: data.nombre || 'Sin nombre',
        marca: data.marca || 'Sin marca',
        presentacion: data.presentacion || '',
        precio: data.precio || 0,
        precioMax: data.precio_max || null,
        precioMin: data.precio_min || null,
        categoria: category,
        categoriaOriginal: data.categoria_principal,
        subcategoria: data.subcategoria_volumen || '',
        categoryIcon: CATEGORY_CONFIG[category]?.icon || '📦',
        categoryColor: CATEGORY_CONFIG[category]?.color || '#9e9e9e',
        sucursal: data.sucursal || 'Varias',
        pesoGramos: data.peso_gramos || 0,
        unidadMedida: data.unidad_medida || 'unidad',
        activo: data.activo || false,
        image: data.imageUrl || data.image || null,
        hasImage: Boolean(data.imageUrl || data.image),
        fechaCreacion: data.fecha_creacion?.toDate() || new Date(),
        fechaActualizacion: data.fecha_actualizacion?.toDate() || new Date(),
        hasDiscount: data.precio_max && data.precio_max > data.precio,
        discount: data.precio_max && data.precio_max > data.precio 
          ? Math.round(((data.precio_max - data.precio) / data.precio_max) * 100)
          : 0
      };
    });
    
    console.log(`✅ ${products.length} productos cargados correctamente`);
    
    return products;
    
  } catch (error) {
    console.error('❌ Error en getAllProducts:', error);
    throw error;
  }
};

// ===== OBTENER MARCAS ÚNICAS DE LISTA LOCAL =====
export const extractUniqueBrands = (products) => {
  const brands = [...new Set(
    products
      .map(product => product.marca)
      .filter(marca => marca && marca.trim() !== '')
  )].sort();
  
  return brands;
};

// ===== BUSCAR EN LISTA LOCAL =====
export const searchInProducts = (products, searchTerm) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return products;
  }
  
  const searchLower = searchTerm.toLowerCase().trim();
  
  return products.filter(product => {
    const nombre = product.nombre.toLowerCase();
    const marca = product.marca.toLowerCase();
    return nombre.includes(searchLower) || marca.includes(searchLower);
  });
};

// ===== FILTRAR POR MARCA =====
export const filterByBrand = (products, brand) => {
  if (!brand) return products;
  return products.filter(p => p.marca === brand);
};

// ===== FILTRAR POR CATEGORÍA =====
export const filterByCategory = (products, category) => {
  if (!category) return products;
  return products.filter(p => p.categoria === category);
};

// ===== FORMATEAR PRODUCTO PARA DISPLAY =====
export const formatProductForDisplay = (product) => {
  return {
    id: product.id,
    title: product.nombre,
    brand: product.marca,
    price: product.precio,
    originalPrice: product.precioMax,
    presentation: product.presentacion,
    category: product.categoria,
    categoryIcon: product.categoryIcon,
    categoryColor: product.categoryColor,
    sucursal: product.sucursal,
    image: product.image,
    hasImage: product.hasImage,
    discount: product.discount,
    hasDiscount: product.hasDiscount,
    description: `${product.marca} - ${product.presentacion}`,
    rating: {
      rate: (4 + Math.random()).toFixed(1),
      count: Math.floor(Math.random() * 50) + 10
    }
  };
};

// ===== TEST DE CONEXIÓN =====
export const testConnection = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'products'), where('activo', '==', true))
    );
    
    console.log('✅ Conexión a Firestore exitosa');
    return snapshot.size > 0;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

// ===== AGREGAR RESEÑA =====
export const addReview = async (reviewData, user) => {
  try {
    const review = {
      productId: reviewData.productId,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Usuario',
      rating: reviewData.rating,
      comment: reviewData.comment,
      title: reviewData.title || '',
      createdAt: serverTimestamp(),
      helpful: 0,
      reported: false
    };
    
    const docRef = await addDoc(collection(db, 'reviews'), review);
    
    console.log('✅ Reseña agregada:', docRef.id);
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error('❌ Error agregando reseña:', error);
    throw error;
  }
};

// ===== OBTENER RESEÑAS DE UN PRODUCTO =====
export const getProductReviews = async (productId) => {
  try {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(reviewsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    
  } catch (error) {
    console.error('❌ Error obteniendo reseñas:', error);
    return [];
  }
};

export default {
  getAllProducts,
  extractUniqueBrands,
  searchInProducts,
  filterByBrand,
  filterByCategory,
  formatProductForDisplay,
  testConnection,
  addReview,
  getProductReviews,
  CATEGORY_CONFIG
};