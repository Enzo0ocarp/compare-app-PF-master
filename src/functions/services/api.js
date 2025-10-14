// src/services/api.js - VERSIÓN CORREGIDA PARA TU BACKEND
import axios from 'axios';
import { auth } from '../src/firebaseConfig';

// Mapeo COMPLETO de códigos de provincia
const PROVINCIA_MAP = {
  'AR-B': 'Buenos Aires',
  'AR-C': 'Ciudad Autónoma de Buenos Aires',
  'AR-K': 'Catamarca',
  'AR-H': 'Chaco',
  'AR-U': 'Chubut',
  'AR-X': 'Córdoba',
  'AR-W': 'Corrientes',
  'AR-E': 'Entre Ríos',
  'AR-P': 'Formosa',
  'AR-Y': 'Jujuy',
  'AR-L': 'La Pampa',
  'AR-F': 'La Rioja',
  'AR-M': 'Mendoza',
  'AR-N': 'Misiones',
  'AR-Q': 'Neuquén',
  'AR-R': 'Río Negro',
  'AR-A': 'Salta',
  'AR-J': 'San Juan',
  'AR-D': 'San Luis',
  'AR-Z': 'Santa Cruz',
  'AR-S': 'Santa Fe',
  'AR-G': 'Santiago del Estero',
  'AR-V': 'Tierra del Fuego',
  'AR-T': 'Tucumán'
};

/**
 * Convierte código de provincia a nombre completo
 * Si no encuentra el código, lo retorna tal cual para debug
 */
export const getProvinceName = (provinciaCode) => {
  if (!provinciaCode) return 'Sin provincia';
  
  // Si ya es un nombre completo, devolverlo
  if (!provinciaCode.startsWith('AR-')) {
    return provinciaCode;
  }
  
  // Buscar en el mapeo
  const name = PROVINCIA_MAP[provinciaCode];
  
  // Si no se encuentra, registrar para debug y devolver el código
  if (!name) {
    console.warn(`⚠️ Código de provincia desconocido: ${provinciaCode}`);
    return provinciaCode; // Devolver el código tal cual
  }
  
  return name;
};

/**
 * Obtiene todas las provincias únicas de las sucursales
 * MEJORADO: Agrupa códigos desconocidos
 */
export const getUniqueProvinces = async () => {
  try {
    const response = await getBranches({ limit: 1000 });
    const allBranches = response.data || [];
    
    // Extraer códigos únicos
    const provinciaCodes = [...new Set(
      allBranches
        .map(branch => branch.provincia)
        .filter(Boolean)
    )];
    
    console.log('🗺️ Códigos de provincia encontrados:', provinciaCodes);
    
    // Convertir códigos a nombres
    const provinces = provinciaCodes
      .map(code => {
        const name = getProvinceName(code);
        return {
          code: code,
          name: name,
          isUnknown: !PROVINCIA_MAP[code] && code.startsWith('AR-')
        };
      })
      .sort((a, b) => {
        // Ordenar: conocidas primero, luego desconocidas
        if (a.isUnknown && !b.isUnknown) return 1;
        if (!a.isUnknown && b.isUnknown) return -1;
        return a.name.localeCompare(b.name);
      });
    
    // Log de provincias desconocidas
    const unknown = provinces.filter(p => p.isUnknown);
    if (unknown.length > 0) {
      console.warn('⚠️ Provincias con códigos desconocidos:', unknown);
    }
    
    console.log('✅ Total de provincias únicas:', provinces.length);
    
    return provinces;
  } catch (error) {
    console.error('Error obteniendo provincias:', error);
    return [];
  }
};

/**
 * NUEVO: Detecta y registra todos los códigos desconocidos
 */
export const findUnknownProvinceCodes = async () => {
  try {
    const response = await getBranches({ limit: 1000 });
    const allBranches = response.data || [];
    
    const unknownCodes = new Set();
    
    allBranches.forEach(branch => {
      const code = branch.provincia;
      if (code && code.startsWith('AR-') && !PROVINCIA_MAP[code]) {
        unknownCodes.add(code);
      }
    });
    
    if (unknownCodes.size > 0) {
      console.log('🔍 CÓDIGOS DESCONOCIDOS ENCONTRADOS:');
      console.log([...unknownCodes]);
      console.log('\n📋 Agregar al PROVINCIA_MAP:');
      [...unknownCodes].forEach(code => {
        console.log(`  '${code}': 'Nombre de Provincia',`);
      });
    } else {
      console.log('✅ Todos los códigos de provincia están mapeados');
    }
    
    return [...unknownCodes];
  } catch (error) {
    console.error('Error buscando códigos desconocidos:', error);
    return [];
  }
};

// FUNCIÓN MEJORADA: getBranches con debug
export const getBranches = async (params = {}) => {
  try {
    console.log('🔍 Obteniendo sucursales con parámetros:', params);
    
    const response = await backendApi.get('/products', {
      params: { 
        type: 'sucursal',
        ...params 
      }
    });
    
    // Enriquecer datos con nombre de provincia completo
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map(branch => ({
        ...branch,
        provinciaCompleta: getProvinceName(branch.provincia),
        // Guardar el código original para filtros
        provinciaCode: branch.provincia
      }));
      
      // Debug: contar provincias únicas
      const uniqueProvinces = [...new Set(
        response.data.data.map(b => b.provincia).filter(Boolean)
      )];
      
      console.log(`✅ Sucursales obtenidas: ${response.data.total}`);
      console.log(`📍 Provincias únicas en esta carga: ${uniqueProvinces.length}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo sucursales:', error);
    throw error;
  }
};

// Exponer función de debug en desarrollo
if (process.env.NODE_ENV === 'development') {
  window.findUnknownProvinceCodes = findUnknownProvinceCodes;
  window.checkProvinces = async () => {
    const provinces = await getUniqueProvinces();
    console.log('🗺️ PROVINCIAS ENCONTRADAS:', provinces);
    return provinces;
  };
}
// Configuración para tu backend local
const backendApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Configuración para Firebase Functions (para reseñas)
const firebaseApi = axios.create({
  baseURL: 'https://us-central1-compareapp-43d31.cloudfunctions.net/api',
  timeout: 15000
});

// Interceptor para Firebase: agrega token si el usuario está autenticado
firebaseApi.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === FUNCIONES PRINCIPALES PARA TU BACKEND ===

/**
 * Obtiene productos con filtros y paginación
 * Ajustado para tu estructura de datos: marca, nombre, presentacion, precio, etc.
 */
export const getProducts = async (params = {}) => {
  try {
    console.log('🔍 Llamando getProducts con parámetros:', params);
    
    const response = await backendApi.get('/products', { params });
    console.log('✅ Respuesta de getProducts:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    console.error('Detalles del error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Obtiene un producto específico por ID
 */
export const getProductById = async (id) => {
  try {
    console.log('🔍 Buscando producto con ID:', id);
    
    const response = await backendApi.get(`/products/${id}`);
    console.log('✅ Producto encontrado:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo producto por ID:', error);
    throw error;
  }
};

/**
 * Busca productos por término - FUNCIÓN CORREGIDA
 * Usa el endpoint /search de tu backend
 */
export const searchProducts = async (searchTerm) => {
  try {
    console.log('🔍 Buscando productos con término:', searchTerm);
    
    // Validar que hay término de búsqueda
    if (!searchTerm || searchTerm.trim().length === 0) {
      console.warn('⚠️ Término de búsqueda vacío');
      return { query: '', count: 0, results: [] };
    }
    
    const response = await backendApi.get('/search', {
      params: { q: searchTerm.trim() }
    });
    
    console.log('✅ Resultados de búsqueda:', {
      query: response.data.query,
      count: response.data.count,
      sampleResults: response.data.results.slice(0, 3)
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    console.error('Detalles del error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Retornar estructura vacía en caso de error
    return { query: searchTerm, count: 0, results: [] };
  }
};


/**
 * Obtiene productos por marca - FUNCIÓN CORREGIDA
 */
export const getProductsByBrand = async (brand, params = {}) => {
  try {
    console.log('🔍 Obteniendo productos de marca:', brand);
    
    const response = await backendApi.get('/products', {
      params: { 
        type: 'producto', 
        marca: brand, 
        ...params 
      }
    });
    
    console.log('✅ Productos de marca obtenidos:', response.data.total);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo productos por marca:', error);
    throw error;
  }
};

/**
 * Obtiene productos por nombre parcial - NUEVA FUNCIÓN
 */
export const getProductsByName = async (name, params = {}) => {
  try {
    console.log('🔍 Obteniendo productos con nombre:', name);
    
    const response = await backendApi.get('/products', {
      params: { 
        type: 'producto', 
        nombre: name, 
        ...params 
      }
    });
    
    console.log('✅ Productos por nombre obtenidos:', response.data.total);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo productos por nombre:', error);
    throw error;
  }
};

/**
 * Obtiene productos destacados (aleatorios) - FUNCIÓN MEJORADA
 */
export const getFeaturedProducts = async (count = 5) => {
  try {
    console.log('🔍 Obteniendo productos destacados...');
    
    // Obtener una muestra más grande para poder seleccionar aleatoriamente
    const response = await backendApi.get('/products', {
      params: { 
        type: 'producto', 
        limit: Math.max(count * 3, 50) // Obtener 3x más para mejor aleatoriedad
      }
    });
    
    if (!response.data.data || response.data.data.length === 0) {
      console.warn('⚠️ No se encontraron productos');
      return [];
    }
    
    // Filtrar solo productos válidos (que tengan marca y nombre)
    const validProducts = response.data.data.filter(product => 
      product.marca && 
      product.nombre && 
      product.marca.trim() !== '' && 
      product.nombre.trim() !== ''
    );
    
    // Mezclar y seleccionar productos aleatorios
    const shuffled = validProducts.sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, count);
    
    console.log('✅ Productos destacados seleccionados:', featured.length);
    return featured;
  } catch (error) {
    console.error('❌ Error obteniendo productos destacados:', error);
    return [];
  }
};

/**
 * Obtiene estadísticas generales - FUNCIÓN CORREGIDA
 */
export const getStats = async () => {
  try {
    console.log('🔍 Obteniendo estadísticas...');
    
    const [productsResponse, branchesResponse] = await Promise.all([
      backendApi.get('/products', { params: { type: 'producto', limit: 1 } }),
      backendApi.get('/products', { params: { type: 'sucursal', limit: 1 } })
    ]);
    
    const stats = {
      totalProducts: productsResponse.data.total || 0,
      totalBranches: branchesResponse.data.total || 0
    };
    
    console.log('✅ Estadísticas obtenidas:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return {
      totalProducts: 0,
      totalBranches: 0
    };
  }
};

/**
 * Función de utilidad para obtener marcas únicas
 */
export const getUniqueBrands = async (limit = 100) => {
  try {
    console.log('🔍 Obteniendo marcas únicas...');
    
    const response = await backendApi.get('/products', {
      params: { 
        type: 'producto', 
        limit: limit * 5 // Obtener más registros para extraer marcas únicas
      }
    });
    
    if (!response.data.data) return [];
    
    // Extraer marcas únicas y filtrar valores válidos
    const brands = [...new Set(
      response.data.data
        .map(product => product.marca)
        .filter(marca => marca && marca.trim() !== '')
    )].sort();
    
    console.log('✅ Marcas únicas encontradas:', brands.length);
    return brands.slice(0, limit);
  } catch (error) {
    console.error('❌ Error obteniendo marcas únicas:', error);
    return [];
  }
};

/**
 * Función de utilidad para formatear productos para el frontend
 */
export const formatProductForDisplay = (product) => {
  // Si el producto ya tiene el formato correcto, devolverlo tal como está
  if (product.title && product.price !== undefined) {
    return product;
  }
  
  // Formatear desde tu estructura de backend
  return {
    id: product.id || product.producto_id || `${Date.now()}-${Math.random()}`,
    title: product.nombre || 'Producto sin nombre',
    price: product.precio || 0,
    originalPrice: product.precio_max || null,
    description: product.presentacion || '',
    category: product.marca || 'Sin marca',
    brand: product.marca || 'Sin marca',
    presentation: product.presentacion || '',
    sucursal: product.sucursal || 'No especificada',
    
    // Datos adicionales
    image: product.image || null,
    hasImage: Boolean(product.image),
    
    // Rating simulado (puedes conectar con tu sistema de reseñas)
    rating: { 
      rate: (4 + Math.random()).toFixed(1), 
      count: Math.floor(Math.random() * 100) + 10 
    },
    
    // Metadatos
    lastUpdated: product.fecha_relevamiento || new Date().toISOString(),
    sucursalId: product.sucursal_id,
    productoId: product.producto_id
  };
};

// === FUNCIONES LEGACY (mantenidas para compatibilidad) ===

/**
 * @deprecated Usar getProducts() con formatProductForDisplay()
 */
export const getAllStoreProducts = async () => {
  console.warn('getAllStoreProducts() está deprecado. Usa getProducts() con formatProductForDisplay().');
  try {
    const response = await getProducts({ type: 'producto', limit: 100 });
    
    if (!response.data) return [];
    
    return response.data.map(formatProductForDisplay);
  } catch (error) {
    console.error('Error en getAllStoreProducts:', error);
    return [];
  }
};

// === FUNCIONES PARA RESEÑAS (sin cambios) ===

export const getReviews = async (productId = null) => {
  try {
    const url = productId ? `/reviews?productId=${productId}` : '/reviews';
    const response = await firebaseApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    throw error;
  }
};

export const addReview = async (reviewData) => {
  try {
    const response = await firebaseApi.post('/reviews', {
      productId: reviewData.productId,
      userId: reviewData.userId,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return response.data;
  } catch (error) {
    console.error('Error agregando reseña:', error);
    throw error;
  }
};

// === FUNCIONES DE DEBUG ===

/**
 * Función de debugging para probar la conexión
 */
export const testConnection = async () => {
  try {
    console.log('🔧 Probando conexión con backend...');
    
    const response = await backendApi.get('/products', {
      params: { limit: 1 }
    });
    
    console.log('✅ Conexión exitosa:', {
      status: response.status,
      total: response.data.total,
      dataLength: response.data.data?.length
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

/**
 * Función para probar específicamente la búsqueda
 */
export const testSearch = async (term = 'aceite') => {
  try {
    console.log('🔧 Probando búsqueda con término:', term);
    
    const result = await searchProducts(term);
    
    console.log('✅ Búsqueda funcionando:', {
      query: result.query,
      count: result.count,
      hasResults: result.results.length > 0
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error en test de búsqueda:', error);
    return null;
  }
};

// Exportar funciones de debug solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  window.debugAPI = {
    testConnection,
    testSearch,
    getProducts,
    searchProducts,
    formatProductForDisplay
  };
}