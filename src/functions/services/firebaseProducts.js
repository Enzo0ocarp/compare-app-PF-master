// src/functions/services/firebaseProducts.js - VERSIÓN CON NORMALIZACIÓN Y DEBUG

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

// ⭐ CACHE SELECTIVO (solo productos consultados)
let pricesCache = new Map();

// ⭐ FUNCIÓN DE UTILIDAD: Normalizar texto (quitar tildes y convertir a minúsculas)
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Quita tildes
};

// ⭐ CATEGORY_CONFIG ACTUALIZADO con firebaseKey normalizado
// ⭐ CATEGORY_CONFIG COMPLETO CON TODAS LAS CATEGORÍAS DE FIREBASE
export const CATEGORY_CONFIG = {
  'Aceites y Grasas': { 
    icon: '🫒', 
    color: '#ff9800',
    keywords: ['aceite', 'grasa', 'manteca', 'margarina', 'oliva'],
    firebaseKey: 'aceites_grasas'
  },
  'Bebidas': { 
    icon: '🥤', 
    color: '#2196f3',
    keywords: ['coca', 'pepsi', 'agua', 'jugo', 'gaseosa', 'bebida', 'refresco'],
    firebaseKey: 'bebidas'
  },
  'Carnes y Pescados': {
    icon: '🥩',
    color: '#795548',
    keywords: ['carne', 'pollo', 'pescado', 'jamon', 'chorizo', 'vacuna', 'cerdo'],
    firebaseKey: 'carnes_pescados'
  },
  'Cereales y Granos': { 
    icon: '🌾', 
    color: '#8bc34a',
    keywords: ['arroz', 'fideos', 'pasta', 'avena', 'cereal', 'trigo', 'harina'],
    firebaseKey: 'cereales_granos'
  },
  'Condimentos': {
    icon: '🧂',
    color: '#ff6f00',
    keywords: ['sal', 'pimienta', 'condimento', 'especias', 'vinagre', 'salsa'],
    firebaseKey: 'condimentos'
  },
  'Conservas': {
    icon: '🥫',
    color: '#ff5722',
    keywords: ['conserva', 'lata', 'enlatado', 'atun', 'tomate'],
    firebaseKey: 'conservas'
  },
  'Frutas y Verduras': {
    icon: '🍎',
    color: '#4caf50',
    keywords: ['banana', 'manzana', 'tomate', 'lechuga', 'papa', 'fruta', 'verdura'],
    firebaseKey: 'frutas_verduras'
  },
  'Lácteos': { 
    icon: '🥛', 
    color: '#4fc3f7',
    keywords: ['leche', 'yogur', 'queso', 'crema', 'dulce de leche'],
    firebaseKey: 'lacteos'
  },
  'Panadería': {
    icon: '🍞',
    color: '#ffb74d',
    keywords: ['pan', 'factura', 'medialunas', 'galleta', 'tostadas'],
    firebaseKey: 'panaderia'
  },
  'Snacks y Dulces': { 
    icon: '🍪', 
    color: '#e91e63',
    keywords: ['galletas', 'chocolate', 'alfajor', 'dulce', 'snack', 'caramelo', 'golosina'],
    firebaseKey: 'snacks_dulces'
  },
  'Limpieza': {
    icon: '🧽',
    color: '#00bcd4',
    keywords: ['detergente', 'lavandina', 'jabon', 'papel', 'limpieza', 'desinfectante'],
    firebaseKey: 'limpieza'
  },
  'Higiene Personal': {
    icon: '🧴',
    color: '#9c27b0',
    keywords: ['shampoo', 'jabon', 'crema', 'pasta dental', 'higiene', 'desodorante'],
    firebaseKey: 'higiene_personal'
  },
  'Congelados': {
    icon: '🧊',
    color: '#81d4fa',
    keywords: ['congelado', 'helado', 'hielo', 'frozen'],
    firebaseKey: 'congelados'
  },
  'Bebés': {
    icon: '👶',
    color: '#ffb3ba',
    keywords: ['bebe', 'pañal', 'leche materna', 'papilla'],
    firebaseKey: 'bebes'
  },
  'Mascotas': {
    icon: '🐕',
    color: '#795548',
    keywords: ['perro', 'gato', 'mascota', 'alimento', 'pet'],
    firebaseKey: 'mascotas'
  },
  'Otros': { 
    icon: '📦', 
    color: '#9e9e9e',
    keywords: [],
    firebaseKey: 'otros'
  }
};

// ⭐ FUNCIÓN DE DEBUG - Ver todas las categorías en Firebase
export const debugCategories = async () => {
  try {
    console.log('🔍 DEBUG: Analizando categorías en Firebase...');
    
    const q = query(
      collection(db, 'products'),
      where('activo', '==', true),
      limit(200)
    );
    
    const snapshot = await getDocs(q);
    
    const categorias = new Map();
    snapshot.docs.forEach(doc => {
      const cat = doc.data().categoria_principal;
      if (cat) {
        categorias.set(cat, (categorias.get(cat) || 0) + 1);
      }
    });
    
    console.log('📊 ===== CATEGORÍAS EN FIREBASE =====');
    const categoriasArray = Array.from(categorias.entries()).map(([cat, count]) => ({
      'Categoría Firebase': cat,
      'Normalizado': normalizeText(cat),
      'Cantidad': count,
      'En CONFIG': Object.values(CATEGORY_CONFIG).some(
        config => normalizeText(config.firebaseKey) === normalizeText(cat)
      ) ? '✅' : '❌'
    }));
    
    console.table(categoriasArray);
    
    console.log('\n📋 ===== CATEGORÍAS EN CATEGORY_CONFIG =====');
    const configArray = Object.entries(CATEGORY_CONFIG).map(([name, config]) => ({
      'Nombre': name,
      'firebaseKey': config.firebaseKey,
      'Normalizado': normalizeText(config.firebaseKey),
      'Icon': config.icon
    }));
    
    console.table(configArray);
    
    // Categorías faltantes
    const faltantes = Array.from(categorias.keys()).filter(cat => 
      !Object.values(CATEGORY_CONFIG).some(
        config => normalizeText(config.firebaseKey) === normalizeText(cat)
      )
    );
    
    if (faltantes.length > 0) {
      console.warn('⚠️ CATEGORÍAS EN FIREBASE QUE FALTAN EN CONFIG:');
      console.table(faltantes.map(cat => ({
        'Categoría': cat,
        'Normalizado': normalizeText(cat),
        'Productos': categorias.get(cat)
      })));
    }
    
    return {
      firebase: categorias,
      config: CATEGORY_CONFIG,
      faltantes
    };
    
  } catch (error) {
    console.error('❌ Error en debugCategories:', error);
    return null;
  }
};

// ⭐ FUNCIÓN CORREGIDA - determineCategory con normalización
const determineCategory = (nombre, marca, categoria_principal) => {
  if (categoria_principal) {
    const categoriaNormalizada = normalizeText(categoria_principal);
    
    // Buscar coincidencia exacta primero
    for (const [categoryName, config] of Object.entries(CATEGORY_CONFIG)) {
      const configKeyNormalizada = normalizeText(config.firebaseKey);
      
      if (configKeyNormalizada === categoriaNormalizada) {
        return categoryName;
      }
    }
    
    // Si no hay coincidencia exacta, intentar con coincidencia parcial
    for (const [categoryName, config] of Object.entries(CATEGORY_CONFIG)) {
      const configKeyNormalizada = normalizeText(config.firebaseKey);
      
      if (categoriaNormalizada.includes(configKeyNormalizada) || 
          configKeyNormalizada.includes(categoriaNormalizada)) {
        console.log(`⚠️ Coincidencia parcial: ${categoria_principal} -> ${categoryName}`);
        return categoryName;
      }
    }
    
    console.warn(`⚠️ Categoría no mapeada: "${categoria_principal}"`);
  }
  
  // Fallback: buscar por keywords en nombre y marca
  const nombreLower = normalizeText(nombre || '');
  const marcaLower = normalizeText(marca || '');
  
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    if (config.keywords.some(keyword => {
      const keywordNormalizado = normalizeText(keyword);
      return nombreLower.includes(keywordNormalizado) || marcaLower.includes(keywordNormalizado);
    })) {
      return category;
    }
  }
  
  return 'Otros';
};

// ⭐ FUNCIÓN OPTIMIZADA: Cargar precios en LOTE para múltiples productos
const loadPricesForProducts = async (productIds) => {
  if (productIds.length === 0) return;
  
  const uncachedIds = productIds.filter(id => !pricesCache.has(id));
  
  if (uncachedIds.length === 0) {
    return;
  }
  
  try {
    const chunkSize = 10;
    const chunks = [];
    
    for (let i = 0; i < uncachedIds.length; i += chunkSize) {
      chunks.push(uncachedIds.slice(i, i + chunkSize));
    }
    
    await Promise.all(
      chunks.map(async (chunk) => {
        const q = query(
          collection(db, 'prices'),
          where('producto_id', 'in', chunk),
          orderBy('precio', 'asc')
        );
        
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const productoId = data.producto_id;
          const precio = data.precio || 0;
          
          if (productoId && precio > 0) {
            if (!pricesCache.has(productoId) || pricesCache.get(productoId) > precio) {
              pricesCache.set(productoId, precio);
            }
          }
        });
      })
    );
    
    console.log(`✅ Precios cargados. Cache total: ${pricesCache.size} productos`);
    
  } catch (error) {
    console.error('❌ Error cargando precios en lote:', error);
  }
};

// ⭐ FUNCIÓN SIMPLIFICADA - formatProduct (sin async)
const formatProduct = (doc) => {
  const data = doc.data();
  const category = determineCategory(data.nombre, data.marca, data.categoria_principal);
  
  let precioMin = data.precio_min || 0;
  let precioMax = data.precio_max || 0;
  
  if ((precioMin === 0 || precioMax === 0) && pricesCache.has(doc.id)) {
    const precioCache = pricesCache.get(doc.id);
    precioMin = precioCache;
    precioMax = precioCache;
  }
  
  const precioPromedio = precioMax > 0 ? precioMax : precioMin;
  
  return {
    id: doc.id,
    nombre: data.nombre || 'Sin nombre',
    marca: data.marca || 'Sin marca',
    presentacion: data.presentacion || '',
    precio: precioPromedio,
    precioMax: precioMax,
    precioMin: precioMin,
    categoria: category,
    categoriaOriginal: data.categoria_principal,
    subcategoria: data.subcategoria_volumen || '',
    categoryIcon: CATEGORY_CONFIG[category]?.icon || '📦',
    categoryColor: CATEGORY_CONFIG[category]?.color || '#9e9e9e',
    sucursal: 'Múltiples',
    sucursalId: '',
    sucursalNombre: 'Ver precios por sucursal',
    pesoGramos: data.peso_gramos || 0,
    unidadMedida: data.unidad_medida || 'unidad',
    activo: data.activo || false,
    image: data.imageUrl || data.image || null,
    hasImage: Boolean(data.imageUrl || data.image),
    fechaCreacion: data.fecha_creacion?.toDate() || new Date(),
    fechaActualizacion: data.fecha_actualizacion?.toDate() || new Date(),
    hasDiscount: precioMax && precioMin && precioMax > precioMin,
    discount: precioMax && precioMin && precioMax > precioMin
      ? Math.round(((precioMax - precioMin) / precioMax) * 100)
      : 0,
    producto_id: doc.id
  };
};

// ⭐ FUNCIÓN PRINCIPAL OPTIMIZADA - getProductsPaginated
export const getProductsPaginated = async ({ 
  pageSize = 24, 
  lastDoc = null,
  filters = {}
}) => {
  try {
    console.log('🔍 Cargando página de productos...', { pageSize, hasLastDoc: !!lastDoc, filters });
    
    const constraints = [
      where('activo', '==', true)
    ];

    if (filters.categoria) {
      const categoryConfig = CATEGORY_CONFIG[filters.categoria];
      if (categoryConfig && categoryConfig.firebaseKey) {
        console.log(`📂 Filtrando por categoría: ${filters.categoria} -> ${categoryConfig.firebaseKey}`);
        constraints.push(where('categoria_principal', '==', categoryConfig.firebaseKey));
      }
    }
    
    if (filters.marca) {
      console.log(`🏷️ Filtrando por marca: ${filters.marca}`);
      constraints.push(where('marca', '==', filters.marca));
    }
    
    constraints.push(orderBy('nombre'));
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    constraints.push(limit(pageSize));
    
    const q = query(collection(db, 'products'), ...constraints);
    const snapshot = await getDocs(q);
    
    console.log(`📊 Documentos obtenidos de Firebase: ${snapshot.docs.length}`);
    
    // ⭐ DEBUG - Ver categorías en resultados
    if (snapshot.docs.length > 0) {
      const categorias = new Set();
      snapshot.docs.forEach(doc => {
        const cat = doc.data().categoria_principal;
        if (cat) categorias.add(cat);
      });
      console.log(`📂 Categorías en esta página:`, Array.from(categorias));
    }
    
    const productIds = snapshot.docs.map(doc => doc.id);
    
    await loadPricesForProducts(productIds);
    
    const products = snapshot.docs.map(formatProduct);
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === pageSize;

    console.log(`✅ ${products.length} productos cargados con precios. HasMore: ${hasMore}`);
    
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

export const searchProducts = async (searchTerm, pageSize = 50) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { products: [], lastDoc: null, hasMore: false };
    }

    console.log('🔍 Buscando productos:', searchTerm);

    const searchLower = searchTerm.toLowerCase().trim();
    
    const q = query(
      collection(db, 'products'),
      where('activo', '==', true),
      orderBy('nombre'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    
    const productIds = snapshot.docs.map(doc => doc.id);
    await loadPricesForProducts(productIds);
    
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

export const getProductPricesAcrossStores = async (producto_id) => {
  try {
    console.log(`🔍 Buscando precios para producto_id: ${producto_id}`);
    
    const q = query(
      collection(db, 'prices'),
      where('producto_id', '==', producto_id),
      orderBy('precio', 'asc')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('⚠️ No se encontraron precios para este producto');
      return [];
    }
    
    const prices = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        precio: data.precio || 0,
        sucursal: data.sucursal_nombre || data.sucursal || 'Desconocido',
        sucursalId: data.sucursal_id || '',
        moneda: data.moneda || 'ARS',
        fechaRelevamiento: data.fecha_relevamiento?.toDate() || new Date(),
        url_producto: data.url_producto || null,
        cadena: data.cadena || '',
        stock_disponible: data.stock_disponible || null
      };
    });
    
    console.log(`✅ ${prices.length} precios encontrados`);
    
    return prices;
    
  } catch (error) {
    console.error('❌ Error obteniendo precios:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoria, limit_count = 10) => {
  try {
    if (!categoria || categoria === 'undefined' || categoria === 'null') {
      console.warn('⚠️ Categoría inválida, usando "Otros"');
      categoria = 'Otros';
    }
    
    console.log(`📂 Cargando productos de categoría: ${categoria}`);
    
    const categoryConfig = CATEGORY_CONFIG[categoria];
    
    if (!categoryConfig) {
      console.warn(`⚠️ Categoría "${categoria}" no encontrada en CATEGORY_CONFIG, usando "Otros"`);
      const firebaseKey = 'otros';
      
      const q = query(
        collection(db, 'products'),
        where('activo', '==', true),
        where('categoria_principal', '==', firebaseKey),
        orderBy('nombre'),
        limit(limit_count)
      );

      const snapshot = await getDocs(q);
      
      const productIds = snapshot.docs.map(doc => doc.id);
      await loadPricesForProducts(productIds);
      
      const products = snapshot.docs.map(formatProduct);
      console.log(`✅ ${products.length} productos de categoría por defecto cargados`);
      return products;
    }
    
    const firebaseKey = categoryConfig.firebaseKey || categoria.toLowerCase();
    
    console.log(`🔍 Buscando en Firebase con key: ${firebaseKey}`);
    
    const q = query(
      collection(db, 'products'),
      where('activo', '==', true),
      where('categoria_principal', '==', firebaseKey),
      orderBy('nombre'),
      limit(limit_count)
    );

    const snapshot = await getDocs(q);
    
    const productIds = snapshot.docs.map(doc => doc.id);
    await loadPricesForProducts(productIds);
    
    const products = snapshot.docs.map(formatProduct);

    console.log(`✅ ${products.length} productos de ${categoria} cargados`);

    return products;

  } catch (error) {
    console.error(`❌ Error obteniendo productos de ${categoria}:`, error);
    return [];
  }
};

export const formatProductForDisplay = (product) => {
  const precioFinal = product.precio || product.precioMax || product.precioMin || 0;
  const precioMaxFinal = product.precioMax || precioFinal;
  
  return {
    id: product.id,
    title: product.nombre,
    brand: product.marca,
    price: precioFinal,
    originalPrice: precioMaxFinal,
    presentation: product.presentacion,
    category: product.categoria || 'Otros',
    categoryIcon: product.categoryIcon,
    categoryColor: product.categoryColor,
    sucursal: product.sucursal,
    sucursalNombre: product.sucursalNombre || product.sucursal,
    sucursalId: product.sucursalId || '',
    image: product.image,
    hasImage: product.hasImage,
    discount: product.discount,
    hasDiscount: product.hasDiscount,
    description: `${product.marca} - ${product.presentacion}`,
    producto_id: product.producto_id || product.id,
    precioMin: product.precioMin || 0,
    precioMax: product.precioMax || 0,
    rating: {
      rate: (4 + Math.random()).toFixed(1),
      count: Math.floor(Math.random() * 50) + 10
    }
  };
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

export const clearPricesCache = () => {
  pricesCache.clear();
  console.log('🗑️ Cache de precios limpiado');
};

export const getCacheStats = () => {
  return {
    size: pricesCache.size,
    products: Array.from(pricesCache.entries()).slice(0, 10)
  };
};

export default {
  getProductsPaginated,
  searchProducts,
  getAvailableBrands,
  getProductsByCategory,
  getProductPricesAcrossStores,
  formatProductForDisplay,
  testConnection,
  addReview,
  clearPricesCache,
  getCacheStats,
  debugCategories, // ⭐ EXPORTAR DEBUG
  CATEGORY_CONFIG
};