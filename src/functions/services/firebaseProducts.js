// src/functions/services/firebaseProducts.js - VERSIÓN CORREGIDA
import { 
  collection, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../src/firebaseConfig';

export const CATEGORY_CONFIG = {
  'Bebidas': { 
    icon: '🥤', 
    color: '#2196f3',
    keywords: ['coca', 'pepsi', 'agua', 'jugo', 'gaseosa', 'bebida'],
    firebaseKey: 'bebidas' // ⭐ AÑADIDO
  },
  'Lácteos': { 
    icon: '🥛', 
    color: '#4caf50',
    keywords: ['leche', 'yogur', 'queso', 'manteca', 'crema'],
    firebaseKey: 'lácteos' // ⭐ AÑADIDO
  },
  'Aceites y Condimentos': { 
    icon: '🫒', 
    color: '#ff9800',
    keywords: ['aceite', 'vinagre', 'sal', 'condimento'],
    firebaseKey: 'aceites y condimentos' // ⭐ AÑADIDO
  },
  'Cereales y Legumbres': { 
    icon: '🌾', 
    color: '#8bc34a',
    keywords: ['arroz', 'fideos', 'pasta', 'avena', 'cereal'],
    firebaseKey: 'cereales y legumbres' // ⭐ AÑADIDO
  },
  'Snacks y Dulces': { 
    icon: '🍪', 
    color: '#e91e63',
    keywords: ['galletas', 'chocolate', 'alfajor', 'dulce'],
    firebaseKey: 'snacks y dulces' // ⭐ AÑADIDO
  },
  'Carnes': {
    icon: '🥩',
    color: '#795548',
    keywords: ['carne', 'pollo', 'pescado', 'jamón', 'chorizo'],
    firebaseKey: 'carnes' // ⭐ AÑADIDO
  },
  'Frutas y Verduras': {
    icon: '🍎',
    color: '#4caf50',
    keywords: ['banana', 'manzana', 'tomate', 'lechuga', 'papa'],
    firebaseKey: 'frutas y verduras' // ⭐ AÑADIDO
  },
  'Limpieza': {
    icon: '🧽',
    color: '#00bcd4',
    keywords: ['detergente', 'lavandina', 'jabón', 'papel'],
    firebaseKey: 'limpieza' // ⭐ AÑADIDO
  },
  'Otros': { 
    icon: '📦', 
    color: '#9e9e9e',
    keywords: [],
    firebaseKey: 'otros' // ⭐ AÑADIDO
  }
};

const determineCategory = (nombre, marca, categoria_principal) => {
  if (categoria_principal) {
    // Buscar la categoría que coincida con el firebaseKey
    for (const [categoryName, config] of Object.entries(CATEGORY_CONFIG)) {
      if (config.firebaseKey === categoria_principal.toLowerCase()) {
        return categoryName;
      }
    }
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

const formatProduct = (doc) => {
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
};

// ⭐ FUNCIÓN CORREGIDA
export const getProductsPaginated = async ({ 
  pageSize = 24, 
  lastDoc = null,
  filters = {}
}) => {
  try {
    console.log('🔍 Cargando página de productos...', { pageSize, hasLastDoc: !!lastDoc, filters });
    
    let q = query(
      collection(db, 'products'),
      where('activo', '==', true)
    );

    // ⭐ CORRECCIÓN: Convertir categoría a firebaseKey
    if (filters.categoria) {
      const categoryConfig = CATEGORY_CONFIG[filters.categoria];
      if (categoryConfig && categoryConfig.firebaseKey) {
        console.log(`📂 Filtrando por categoría: ${filters.categoria} -> ${categoryConfig.firebaseKey}`);
        q = query(q, where('categoria_principal', '==', categoryConfig.firebaseKey));
      }
    }
    
    if (filters.marca) {
      q = query(q, where('marca', '==', filters.marca));
    }
    
    q = query(q, orderBy('nombre'));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    q = query(q, limit(pageSize));

    const snapshot = await getDocs(q);
    
    const products = snapshot.docs.map(formatProduct);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === pageSize;

    console.log(`✅ ${products.length} productos cargados. HasMore: ${hasMore}`);
    
    return {
      products,
      lastDoc: lastVisible,
      hasMore
    };
    
  } catch (error) {
    console.error('❌ Error en getProductsPaginated:', error);
    throw error;
  }
};

// ⭐ FUNCIÓN CORREGIDA
export const getProductsByCategory = async (categoria, limit_count = 10) => {
  try {
    console.log(`📂 Cargando productos de categoría: ${categoria}`);
    
    // ⭐ CORRECCIÓN: Convertir categoría a firebaseKey
    const categoryConfig = CATEGORY_CONFIG[categoria];
    const firebaseKey = categoryConfig?.firebaseKey || categoria.toLowerCase();
    
    console.log(`🔍 Buscando en Firebase con key: ${firebaseKey}`);
    
    const q = query(
      collection(db, 'products'),
      where('activo', '==', true),
      where('categoria_principal', '==', firebaseKey),
      orderBy('precio'),
      limit(limit_count)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(formatProduct);

    console.log(`✅ ${products.length} productos de ${categoria} cargados`);

    return products;

  } catch (error) {
    console.error(`❌ Error obteniendo productos de ${categoria}:`, error);
    return [];
  }
};

// ===== RESTO DE FUNCIONES SIN CAMBIOS =====
export const searchProducts = async (searchTerm, pageSize = 24) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { products: [], lastDoc: null, hasMore: false };
    }

    console.log('🔍 Buscando productos:', searchTerm);

    const searchLower = searchTerm.toLowerCase().trim();
    
    let q = query(
      collection(db, 'products'),
      where('activo', '==', true),
      orderBy('nombre'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    
    const allProducts = snapshot.docs.map(formatProduct);
    
    const filteredProducts = allProducts.filter(product => {
      const nombre = product.nombre.toLowerCase();
      const marca = product.marca.toLowerCase();
      return nombre.includes(searchLower) || marca.includes(searchLower);
    });

    const paginatedResults = filteredProducts.slice(0, pageSize);

    console.log(`✅ Búsqueda completada: ${filteredProducts.length} resultados encontrados`);

    return {
      products: paginatedResults,
      lastDoc: null,
      hasMore: filteredProducts.length > pageSize,
      totalResults: filteredProducts.length
    };

  } catch (error) {
    console.error('❌ Error en searchProducts:', error);
    throw error;
  }
};

export const getAvailableBrands = async () => {
  try {
    console.log('🏷️ Cargando marcas disponibles...');
    
    const q = query(
      collection(db, 'products'),
      where('activo', '==', true),
      limit(500)
    );

    const snapshot = await getDocs(q);
    
    const brands = new Set();
    snapshot.docs.forEach(doc => {
      const marca = doc.data().marca;
      if (marca && marca.trim()) {
        brands.add(marca);
      }
    });

    const brandArray = Array.from(brands).sort();
    
    console.log(`✅ ${brandArray.length} marcas encontradas`);
    
    return brandArray;
    
  } catch (error) {
    console.error('❌ Error obteniendo marcas:', error);
    return [];
  }
};

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

export const testConnection = async () => {
  try {
    const q = query(
      collection(db, 'products'),
      where('activo', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    console.log('✅ Conexión a Firestore exitosa');
    return snapshot.size > 0;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

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

export const getProductReviews = async (productId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    
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

// Legacy functions
export const getAllProducts = async () => {
  console.warn('⚠️ getAllProducts está deprecated. Usa getProductsPaginated');
  const result = await getProductsPaginated({ pageSize: 100 });
  return result.products;
};

export const extractUniqueBrands = (products) => {
  const brands = [...new Set(
    products
      .map(product => product.marca)
      .filter(marca => marca && marca.trim() !== '')
  )].sort();
  
  return brands;
};

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

export const filterByBrand = (products, brand) => {
  if (!brand) return products;
  return products.filter(p => p.marca === brand);
};

export const filterByCategory = (products, category) => {
  if (!category) return products;
  return products.filter(p => p.categoria === category);
};

export default {
  getProductsPaginated,
  searchProducts,
  getAvailableBrands,
  getProductsByCategory,
  formatProductForDisplay,
  testConnection,
  addReview,
  getProductReviews,
  CATEGORY_CONFIG,
  getAllProducts,
  extractUniqueBrands,
  searchInProducts,
  filterByBrand,
  filterByCategory
};