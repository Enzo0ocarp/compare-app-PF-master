// src/services/nutritionalService.js - VERSIÓN ACTUALIZADA PARA NUEVA ESTRUCTURA FIREBASE
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  getDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../src/firebaseConfig';

// Colecciones de Firebase actualizadas
const COLLECTIONS = {
  PRODUCTS: 'products',
  NUTRITION_DATA: 'nutrition_data', 
  CATEGORIES: 'categories',
  NUTRITIONAL_CONTRIBUTIONS: 'nutritional_contributions',
  NUTRITIONAL_REVIEWS: 'nutritional_reviews',
  NUTRITIONAL_COMPARISONS: 'nutritional_comparisons',
  USER_PREFERENCES: 'user_preferences'
};

// ===== PAGINACIÓN MEJORADA =====

/**
 * Obtiene productos con paginación completa
 * @param {number} pageSize - Tamaño de página
 * @param {Object} lastDoc - Último documento de la página anterior
 * @param {string} categoria - Filtro por categoría
 * @returns {Promise<Object>} {products, lastVisible, hasMore}
 */
export const getNutritionalProductsPaginated = async (pageSize = 20, lastDoc = null, categoria = null) => {
  try {
    console.log('🔍 Cargando productos paginados...');
    
    let productQuery = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('activo', '==', true),
      orderBy('fecha_actualizacion', 'desc'),
      limit(pageSize)
    );

    // Filtro de categoría
    if (categoria && categoria !== 'todos') {
      productQuery = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('activo', '==', true),
        where('categoria_principal', '==', categoria),
        orderBy('fecha_actualizacion', 'desc'),
        limit(pageSize)
      );
    }

    // Paginación: empezar después del último documento
    if (lastDoc) {
      productQuery = query(
        productQuery,
        startAfter(lastDoc)
      );
    }

    const productsSnapshot = await getDocs(productQuery);
    const products = [];
    let lastVisible = null;
    
    // Procesar productos
    for (const productDoc of productsSnapshot.docs) {
      const productData = productDoc.data();
      
      // Buscar datos nutricionales
      const nutritionQuery = query(
        collection(db, COLLECTIONS.NUTRITION_DATA),
        where('producto_id', '==', productData.id)
      );
      
      const nutritionSnapshot = await getDocs(nutritionQuery);
      let nutritionalData = null;
      
      if (!nutritionSnapshot.empty) {
        nutritionalData = nutritionSnapshot.docs[0].data();
      }
      
      // Construir producto completo
      const producto = {
        id: productDoc.id,
        firebaseId: productDoc.id,
        docRef: productDoc, // Guardar referencia para paginación
        ...productData,
        
        // Información nutricional
        hasNutritionalInfo: nutritionalData !== null,
        nutritionalData: nutritionalData ? {
          calories: nutritionalData.calorias_100g || 0,
          proteins: nutritionalData.proteinas_g || 0,
          carbs: nutritionalData.carbohidratos_g || 0,
          fats: nutritionalData.grasas_g || 0,
          fiber: nutritionalData.fibra_g || 0,
          sodium: nutritionalData.sodio_mg || 0,
          sugar: nutritionalData.azucares_g || 0,
          saturatedFats: nutritionalData.grasas_saturadas_g || 0,
          
          // Información adicional
          ingredients: nutritionalData.ingredientes || [],
          allergens: nutritionalData.alergenos || [],
          isVegan: nutritionalData.apto_vegano || false,
          isVegetarian: nutritionalData.apto_vegetariano || false,
          isGlutenFree: nutritionalData.sin_gluten || false,
          isOrganic: nutritionalData.organico || false,
          
          // Metadatos
          source: nutritionalData.fuente || 'manual',
          verified: nutritionalData.verificado || false,
          confidence: nutritionalData.confianza || 0,
          lastUpdated: nutritionalData.fecha_actualizacion,
          
          // Score nutricional
          score: calculateNutritionalScore(nutritionalData)
        } : null,
        
        // Información del producto
        nombre: productData.nombre,
        marca: productData.marca,
        precio: 0,
        presentacion: productData.presentacion,
        categoria: productData.categoria_principal,
        subcategoria: productData.subcategoria_volumen,
        pesoGramos: productData.peso_gramos,
        volumenMl: productData.volumen_ml,
        
        // Imagen
        imageUrl: productData.imageUrl || '/api/placeholder/150/150',
        imageStatus: productData.imageStatus || null,
        
        // Metadatos
        lastUpdated: productData.fecha_actualizacion,
        createdBy: productData.creado_por,
        active: productData.activo
      };
      
      products.push(producto);
      lastVisible = productDoc; // Guardar último documento
    }

    const hasMore = productsSnapshot.docs.length === pageSize;
    
    console.log(`✅ Productos cargados: ${products.length}, Hay más: ${hasMore}`);
    
    return {
      products,
      lastVisible,
      hasMore
    };
    
  } catch (error) {
    console.error('❌ Error cargando productos paginados:', error);
    throw error;
  }
};

/**
 * Carga TODOS los productos (sin límite) - Usar con precaución
 * @param {string} categoria - Filtro opcional por categoría
 * @returns {Promise<Array>} Todos los productos
 */
export const getAllNutritionalProducts = async (categoria = null) => {
  try {
    console.log('⚠️ CARGANDO TODOS LOS PRODUCTOS - Esto puede tardar...');
    
    const allProducts = [];
    let lastDoc = null;
    let hasMore = true;
    let pageCount = 0;
    const pageSize = 50; // Cargar de a 50 para no sobrecargar
    
    while (hasMore) {
      const { products, lastVisible, hasMore: moreAvailable } = await getNutritionalProductsPaginated(
        pageSize,
        lastDoc,
        categoria
      );
      
      allProducts.push(...products);
      lastDoc = lastVisible;
      hasMore = moreAvailable;
      pageCount++;
      
      console.log(`📄 Página ${pageCount} cargada, Total: ${allProducts.length}`);
      
      // Límite de seguridad: máximo 20 páginas (1000 productos)
      if (pageCount >= 20) {
        console.warn('⚠️ Límite de seguridad alcanzado (1000 productos)');
        break;
      }
    }
    
    console.log(`✅ TOTAL DE PRODUCTOS CARGADOS: ${allProducts.length}`);
    return allProducts;
    
  } catch (error) {
    console.error('❌ Error cargando todos los productos:', error);
    throw error;
  }
};
/**
 * Busca productos nutricionales por término
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Productos encontrados
 */
export const searchNutritionalProducts = async (searchTerm) => {
  try {
    console.log('🔍 Buscando productos:', searchTerm);
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const searchTermLower = searchTerm.toLowerCase();
    
    // Búsqueda por nombre (Firebase no soporta búsqueda de texto completo nativa)
    const nameQuery = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('activo', '==', true),
      orderBy('nombre'),
      limit(20)
    );

    const snapshot = await getDocs(nameQuery);
    const products = [];
    
    // Filtrar productos que contengan el término de búsqueda
    for (const productDoc of snapshot.docs) {
      const productData = productDoc.data();
      
      const nombre = (productData.nombre || '').toLowerCase();
      const marca = (productData.marca || '').toLowerCase();
      
      if (nombre.includes(searchTermLower) || marca.includes(searchTermLower)) {
        // Buscar datos nutricionales
        const nutritionQuery = query(
          collection(db, COLLECTIONS.NUTRITION_DATA),
          where('producto_id', '==', productData.id)
        );
        
        const nutritionSnapshot = await getDocs(nutritionQuery);
        let nutritionalData = null;
        
        if (!nutritionSnapshot.empty) {
          nutritionalData = nutritionSnapshot.docs[0].data();
        }
        
        const producto = {
          id: productDoc.id,
          firebaseId: productDoc.id,
          ...productData,
          hasNutritionalInfo: nutritionalData !== null,
          nutritionalData: nutritionalData ? {
            calories: nutritionalData.calorias_100g || 0,
            proteins: nutritionalData.proteinas_g || 0,
            carbs: nutritionalData.carbohidratos_g || 0,
            fats: nutritionalData.grasas_g || 0,
            fiber: nutritionalData.fibra_g || 0,
            sodium: nutritionalData.sodio_mg || 0,
            sugar: nutritionalData.azucares_g || 0,
            saturatedFats: nutritionalData.grasas_saturadas_g || 0,
            score: calculateNutritionalScore(nutritionalData)
          } : null
        };
        
        products.push(producto);
      }
    }

    console.log(`✅ Productos encontrados: ${products.length}`);
    return products;
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    throw error;
  }
};

/**
 * Obtiene categorías disponibles
 * @returns {Promise<Array>} Lista de categorías
 */
export const getCategories = async () => {
  try {
    const categoriesQuery = query(
      collection(db, COLLECTIONS.CATEGORIES),
      where('activa', '==', true),
      orderBy('orden')
    );
    
    const snapshot = await getDocs(categoriesQuery);
    const categories = [];
    
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return categories;
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
};

/**
 * Calcula el score nutricional basado en los datos
 * @param {object} nutritionalData - Datos nutricionales
 * @returns {number} Score del 0 al 10
 */
export const calculateNutritionalScore = (nutritionalData) => {
  if (!nutritionalData) return 0;
  
  let score = 5; // Empezar desde el medio
  
  // Factores positivos (aumentan score)
  if (nutritionalData.proteinas_g > 5) score += 1;
  if (nutritionalData.fibra_g > 3) score += 1;
  if (nutritionalData.apto_vegano) score += 0.5;
  if (nutritionalData.organico) score += 0.5;
  if (nutritionalData.sin_gluten) score += 0.3;
  
  // Factores negativos (reducen score)
  if (nutritionalData.azucares_g > 10) score -= 1.5;
  if (nutritionalData.grasas_saturadas_g > 5) score -= 1;
  if (nutritionalData.sodio_mg > 400) score -= 1;
  if (nutritionalData.calorias_100g > 500) score -= 0.5;
  
  // Mantener score entre 0 y 10
  score = Math.max(0, Math.min(10, score));
  
  return Math.round(score * 10) / 10; // Redondear a 1 decimal
};

/**
 * Agrega un nuevo producto con información nutricional
 * @param {object} productData - Datos del producto y nutrición
 * @returns {Promise<string>} ID del producto creado
 */
export const addNutritionalProduct = async (productData) => {
  try {
    console.log('💾 Agregando nuevo producto nutricional...');
    
    // Separar datos del producto y datos nutricionales
    const { nutritionalData, ...productInfo } = productData;
    
    // Crear documento de producto
    const productDoc = {
      ...productInfo,
      activo: true,
      creado_por: productData.contributedBy || 'user',
      fecha_creacion: serverTimestamp(),
      fecha_actualizacion: serverTimestamp(),
      id: productData.originalId || `${Date.now()}`,
      categoria_principal: productData.categoria || 'general',
      subcategoria_volumen: productData.subcategoria || 'general',
      peso_gramos: productData.pesoGramos || null,
      volumen_ml: productData.volumenMl || null,
      unidad_medida: 'unidad'
    };
    
    const productRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), productDoc);
    
    // Si hay datos nutricionales, crear documento separado
    if (nutritionalData) {
      const nutritionDoc = {
        producto_id: productDoc.id,
        calorias_100g: nutritionalData.calories || 0,
        proteinas_g: nutritionalData.proteins || 0,
        carbohidratos_g: nutritionalData.carbs || 0,
        grasas_g: nutritionalData.fats || 0,
        fibra_g: nutritionalData.fiber || 0,
        sodio_mg: nutritionalData.sodium || 0,
        azucares_g: nutritionalData.sugar || 0,
        grasas_saturadas_g: nutritionalData.saturatedFats || 0,
        
        // Información adicional
        ingredientes: nutritionalData.ingredients || [],
        alergenos: nutritionalData.allergens || [],
        apto_vegano: nutritionalData.isVegan || false,
        apto_vegetariano: nutritionalData.isVegetarian || false,
        sin_gluten: nutritionalData.isGlutenFree || false,
        organico: nutritionalData.isOrganic || false,
        
        // Metadatos
        fuente: nutritionalData.source || 'manual',
        verificado: nutritionalData.verified || false,
        confianza: nutritionalData.confidence || 0.8,
        creado_por: productData.contributedBy || 'user',
        fecha_creacion: serverTimestamp(),
        fecha_actualizacion: serverTimestamp()
      };
      
      await addDoc(collection(db, COLLECTIONS.NUTRITION_DATA), nutritionDoc);
    }
    
    console.log('✅ Producto agregado exitosamente');
    return productRef.id;
    
  } catch (error) {
    console.error('❌ Error agregando producto:', error);
    throw error;
  }
};