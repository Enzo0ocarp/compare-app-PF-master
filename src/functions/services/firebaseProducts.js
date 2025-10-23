// src/functions/services/firebaseProducts.js - VERSIÓN CORREGIDA ✅

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
  // ACEITES Y GRASAS
  'Aceites y Grasas': {
    name: 'Aceites y Grasas',
    icon: '🫒',
    color: '#f59e0b',
    firebaseKey: 'aceites_grasas',
    subcategories: []
  },

  // LÁCTEOS - Subdivisiones
  'Leches': {
    name: 'Leches',
    icon: '🥛',
    color: '#ffffff',
    firebaseKey: 'leches',
    subcategories: []
  },
  'Yogures': {
    name: 'Yogures',
    icon: '🥄',
    color: '#fef3c7',
    firebaseKey: 'yogures',
    subcategories: []
  },
  'Quesos': {
    name: 'Quesos',
    icon: '🧀',
    color: '#fde68a',
    firebaseKey: 'quesos',
    subcategories: []
  },
  'Mantecas y Cremas': {
    name: 'Mantecas y Cremas',
    icon: '🧈',
    color: '#fef3c7',
    firebaseKey: 'mantecas_cremas',
    subcategories: []
  },
  'Postres Lácteos': {
    name: 'Postres Lácteos',
    icon: '🍮',
    color: '#fde68a',
    firebaseKey: 'postres_lacteos',
    subcategories: []
  },
  'Leches Vegetales': {
    name: 'Leches Vegetales',
    icon: '🌱',
    color: '#d1fae5',
    firebaseKey: 'leches_vegetales',
    subcategories: []
  },

  // CARNES Y PROTEÍNAS
  'Carne Vacuna': {
    name: 'Carne Vacuna',
    icon: '🥩',
    color: '#dc2626',
    firebaseKey: 'carne_vacuna',
    subcategories: []
  },
  'Carne de Pollo': {
    name: 'Carne de Pollo',
    icon: '🍗',
    color: '#fbbf24',
    firebaseKey: 'carne_pollo',
    subcategories: []
  },
  'Carne de Cerdo': {
    name: 'Carne de Cerdo',
    icon: '🥓',
    color: '#f97316',
    firebaseKey: 'carne_cerdo',
    subcategories: []
  },
  'Pescados y Mariscos': {
    name: 'Pescados y Mariscos',
    icon: '🐟',
    color: '#0ea5e9',
    firebaseKey: 'pescados_mariscos',
    subcategories: []
  },
  'Fiambres y Embutidos': {
    name: 'Fiambres y Embutidos',
    icon: '🥓',
    color: '#dc2626',
    firebaseKey: 'fiambres_embutidos',
    subcategories: []
  },
  'Salchichas y Hamburguesas': {
    name: 'Salchichas y Hamburguesas',
    icon: '🌭',
    color: '#dc2626',
    firebaseKey: 'salchichas_hamburguesas',
    subcategories: []
  },

  // CEREALES, GRANOS Y HARINAS
  'Arroz': {
    name: 'Arroz',
    icon: '🍚',
    color: '#fef3c7',
    firebaseKey: 'arroz',
    subcategories: []
  },
  'Pastas': {
    name: 'Pastas',
    icon: '🍝',
    color: '#fbbf24',
    firebaseKey: 'pastas',
    subcategories: []
  },
  'Harinas': {
    name: 'Harinas',
    icon: '🌾',
    color: '#fef3c7',
    firebaseKey: 'harinas',
    subcategories: []
  },
  'Cereales de Desayuno': {
    name: 'Cereales de Desayuno',
    icon: '🥣',
    color: '#fbbf24',
    firebaseKey: 'cereales_desayuno',
    subcategories: []
  },
  'Avena y Quinoa': {
    name: 'Avena y Quinoa',
    icon: '🌾',
    color: '#d1fae5',
    firebaseKey: 'avena_quinoa',
    subcategories: []
  },
  'Polenta y Sémola': {
    name: 'Polenta y Sémola',
    icon: '🌽',
    color: '#fde68a',
    firebaseKey: 'polenta_semola',
    subcategories: []
  },

  // BEBIDAS - Subdivisiones detalladas
  'Aguas': {
    name: 'Aguas',
    icon: '💧',
    color: '#93c5fd',
    firebaseKey: 'aguas',
    subcategories: []
  },
  'Gaseosas': {
    name: 'Gaseosas',
    icon: '🥤',
    color: '#f87171',
    firebaseKey: 'gaseosas',
    subcategories: []
  },
  'Jugos y Néctares': {
    name: 'Jugos y Néctares',
    icon: '🧃',
    color: '#fb923c',
    firebaseKey: 'jugos_nectares',
    subcategories: []
  },
  'Bebidas Energéticas': {
    name: 'Bebidas Energéticas',
    icon: '⚡',
    color: '#fbbf24',
    firebaseKey: 'bebidas_energeticas',
    subcategories: []
  },
  'Té, Café e Infusiones': {
    name: 'Té, Café e Infusiones',
    icon: '☕',
    color: '#92400e',
    firebaseKey: 'te_cafe_infusiones',
    subcategories: []
  },
  'Bebidas Alcohólicas': {
    name: 'Bebidas Alcohólicas',
    icon: '🍷',
    color: '#7c2d12',
    firebaseKey: 'bebidas_alcoholicas',
    subcategories: []
  },

  // SNACKS Y DULCES - Muy detallado
  'Galletas Dulces': {
    name: 'Galletas Dulces',
    icon: '🍪',
    color: '#fde68a',
    firebaseKey: 'galletas_dulces',
    subcategories: []
  },
  'Galletas Saladas': {
    name: 'Galletas Saladas',
    icon: '🧈',
    color: '#fef3c7',
    firebaseKey: 'galletas_saladas',
    subcategories: []
  },
  'Chocolates': {
    name: 'Chocolates',
    icon: '🍫',
    color: '#78350f',
    firebaseKey: 'chocolates',
    subcategories: []
  },
  'Alfajores': {
    name: 'Alfajores',
    icon: '🥐',
    color: '#92400e',
    firebaseKey: 'alfajores',
    subcategories: []
  },
  'Golosinas': {
    name: 'Golosinas',
    icon: '🍬',
    color: '#f9a8d4',
    firebaseKey: 'golosinas',
    subcategories: []
  },
  'Snacks Salados': {
    name: 'Snacks Salados',
    icon: '🥨',
    color: '#fbbf24',
    firebaseKey: 'snacks_salados',
    subcategories: []
  },
  'Barras de Cereales': {
    name: 'Barras de Cereales',
    icon: '🍫',
    color: '#d97706',
    firebaseKey: 'barras_cereales',
    subcategories: []
  },
  'Turrones y Mazapanes': {
    name: 'Turrones y Mazapanes',
    icon: '🍬',
    color: '#fde68a',
    firebaseKey: 'turrones_mazapanes',
    subcategories: []
  },

  // FRUTAS Y VERDURAS
  'Frutas Frescas': {
    name: 'Frutas Frescas',
    icon: '🍎',
    color: '#dc2626',
    firebaseKey: 'frutas_frescas',
    subcategories: []
  },
  'Verduras Frescas': {
    name: 'Verduras Frescas',
    icon: '🥬',
    color: '#16a34a',
    firebaseKey: 'verduras_frescas',
    subcategories: []
  },
  'Frutas y Verduras Congeladas': {
    name: 'Frutas y Verduras Congeladas',
    icon: '❄️',
    color: '#93c5fd',
    firebaseKey: 'frutas_verduras_congeladas',
    subcategories: []
  },
  'Frutas Secas y Deshidratadas': {
    name: 'Frutas Secas y Deshidratadas',
    icon: '🥜',
    color: '#d97706',
    firebaseKey: 'frutas_secas',
    subcategories: []
  },
  'Frutos Secos': {
    name: 'Frutos Secos',
    icon: '🌰',
    color: '#92400e',
    firebaseKey: 'frutos_secos',
    subcategories: []
  },

  // PANIFICADOS Y REPOSTERÍA
  'Pan Fresco': {
    name: 'Pan Fresco',
    icon: '🍞',
    color: '#d97706',
    firebaseKey: 'pan_fresco',
    subcategories: []
  },
  'Pan Tostado y Grisines': {
    name: 'Pan Tostado y Grisines',
    icon: '🥖',
    color: '#fbbf24',
    firebaseKey: 'pan_tostado',
    subcategories: []
  },
  'Pan Rallado y Rebozadores': {
    name: 'Pan Rallado y Rebozadores',
    icon: '🍞',
    color: '#fde68a',
    firebaseKey: 'pan_rallado',
    subcategories: []
  },
  'Masas y Tapas': {
    name: 'Masas y Tapas',
    icon: '🥟',
    color: '#fbbf24',
    firebaseKey: 'masas_tapas',
    subcategories: []
  },
  'Tortas y Budines': {
    name: 'Tortas y Budines',
    icon: '🍰',
    color: '#f97316',
    firebaseKey: 'tortas_budines',
    subcategories: []
  },

  // CONDIMENTOS Y ADEREZOS
  'Sal y Pimienta': {
    name: 'Sal y Pimienta',
    icon: '🧂',
    color: '#d1d5db',
    firebaseKey: 'sal_pimienta',
    subcategories: []
  },
  'Especias y Condimentos': {
    name: 'Especias y Condimentos',
    icon: '🌶️',
    color: '#dc2626',
    firebaseKey: 'especias_condimentos',
    subcategories: []
  },
  'Salsas': {
    name: 'Salsas',
    icon: '🍅',
    color: '#dc2626',
    firebaseKey: 'salsas',
    subcategories: []
  },
  'Mayonesas y Aderezos': {
    name: 'Mayonesas y Aderezos',
    icon: '🥗',
    color: '#fef3c7',
    firebaseKey: 'mayonesas_aderezos',
    subcategories: []
  },
  'Mostazas y Ketchup': {
    name: 'Mostazas y Ketchup',
    icon: '🌭',
    color: '#fbbf24',
    firebaseKey: 'mostazas_ketchup',
    subcategories: []
  },
  'Vinagres': {
    name: 'Vinagres',
    icon: '🍶',
    color: '#92400e',
    firebaseKey: 'vinagres',
    subcategories: []
  },

  // DULCES Y UNTABLES
  'Dulce de Leche': {
    name: 'Dulce de Leche',
    icon: '🍯',
    color: '#d97706',
    firebaseKey: 'dulce_leche',
    subcategories: []
  },
  'Mermeladas y Jaleas': {
    name: 'Mermeladas y Jaleas',
    icon: '🍓',
    color: '#dc2626',
    firebaseKey: 'mermeladas_jaleas',
    subcategories: []
  },
  'Miel': {
    name: 'Miel',
    icon: '🍯',
    color: '#fbbf24',
    firebaseKey: 'miel',
    subcategories: []
  },
  'Cremas de Avellanas': {
    name: 'Cremas de Avellanas',
    icon: '🌰',
    color: '#92400e',
    firebaseKey: 'cremas_avellanas',
    subcategories: []
  },

  // AZÚCAR Y ENDULZANTES
  'Azúcar': {
    name: 'Azúcar',
    icon: '🧂',
    color: '#fef3c7',
    firebaseKey: 'azucar',
    subcategories: []
  },
  'Postres Preparados': {
    name: 'Postres Preparados',
    icon: '🍰',
    color: '#fbbf24',
    firebaseKey: 'postres_preparados',
    subcategories: []
  },

  // LEGUMBRES Y SEMILLAS
  'Legumbres': {
    name: 'Legumbres',
    icon: '🫘',
    color: '#92400e',
    firebaseKey: 'legumbres',
    subcategories: []
  },
  'Semillas': {
    name: 'Semillas',
    icon: '🌻',
    color: '#fbbf24',
    firebaseKey: 'semillas',
    subcategories: []
  },

  // COMIDAS PREPARADAS Y CONGELADAS
  'Pizzas Congeladas': {
    name: 'Pizzas Congeladas',
    icon: '🍕',
    color: '#dc2626',
    firebaseKey: 'pizzas_congeladas',
    subcategories: []
  },
  'Empanadas y Tartas Congeladas': {
    name: 'Empanadas y Tartas Congeladas',
    icon: '🥟',
    color: '#fbbf24',
    firebaseKey: 'empanadas_congeladas',
    subcategories: []
  },
  'Comidas Preparadas': {
    name: 'Comidas Preparadas',
    icon: '🍱',
    color: '#f59e0b',
    firebaseKey: 'comidas_preparadas',
    subcategories: []
  },
  'Milanesas y Rebozados': {
    name: 'Milanesas y Rebozados',
    icon: '🍖',
    color: '#d97706',
    firebaseKey: 'milanesas_rebozados',
    subcategories: []
  },
  'Papas Congeladas': {
    name: 'Papas Congeladas',
    icon: '🍟',
    color: '#fbbf24',
    firebaseKey: 'papas_congeladas',
    subcategories: []
  },

  // PRODUCTOS PARA BEBÉS
  'Pañales': {
    name: 'Pañales',
    icon: '🍼',
    color: '#93c5fd',
    firebaseKey: 'panales',
    subcategories: []
  },
  'Leche de Fórmula': {
    name: 'Leche de Fórmula',
    icon: '🍼',
    color: '#fef3c7',
    firebaseKey: 'leche_formula',
    subcategories: []
  },
  'Alimentos para Bebés': {
    name: 'Alimentos para Bebés',
    icon: '👶',
    color: '#fde68a',
    firebaseKey: 'alimentos_bebes',
    subcategories: []
  },
  'Toallitas y Cuidado': {
    name: 'Toallitas y Cuidado',
    icon: '🧴',
    color: '#bfdbfe',
    firebaseKey: 'toallitas_cuidado',
    subcategories: []
  },

  // HIGIENE Y LIMPIEZA
  'Jabones y Shampoos': {
    name: 'Jabones y Shampoos',
    icon: '🧴',
    color: '#93c5fd',
    firebaseKey: 'jabones_shampoos',
    subcategories: []
  },
  'Productos de Limpieza': {
    name: 'Productos de Limpieza',
    icon: '🧽',
    color: '#bfdbfe',
    firebaseKey: 'productos_limpieza',
    subcategories: []
  },
  'Papel Higiénico y Toallas': {
    name: 'Papel Higiénico y Toallas',
    icon: '🧻',
    color: '#fef3c7',
    firebaseKey: 'papel_higienico',
    subcategories: []
  },
  'Detergentes': {
    name: 'Detergentes',
    icon: '🧼',
    color: '#93c5fd',
    firebaseKey: 'detergentes',
    subcategories: []
  },
  'Productos de Higiene Personal': {
    name: 'Productos de Higiene Personal',
    icon: '💆',
    color: '#f9a8d4',
    firebaseKey: 'higiene_personal',
    subcategories: []
  },

  // MASCOTAS
  'Alimento para Perros': {
    name: 'Alimento para Perros',
    icon: '🐕',
    color: '#f59e0b',
    firebaseKey: 'alimento_perros',
    subcategories: []
  },
  'Alimento para Gatos': {
    name: 'Alimento para Gatos',
    icon: '🐈',
    color: '#fbbf24',
    firebaseKey: 'alimento_gatos',
    subcategories: []
  },
  'Accesorios para Mascotas': {
    name: 'Accesorios para Mascotas',
    icon: '🦴',
    color: '#d97706',
    firebaseKey: 'accesorios_mascotas',
    subcategories: []
  },

  // PRODUCTOS ESPECIALES
  'Productos Sin TACC': {
    name: 'Productos Sin TACC',
    icon: '🌾',
    color: '#d1fae5',
    firebaseKey: 'sin_tacc',
    subcategories: []
  },
  'Productos Diet y Light': {
    name: 'Productos Diet y Light',
    icon: '💚',
    color: '#86efac',
    firebaseKey: 'diet_light',
    subcategories: []
  },
  'Productos Orgánicos': {
    name: 'Productos Orgánicos',
    icon: '🌱',
    color: '#16a34a',
    firebaseKey: 'organicos',
    subcategories: []
  },
  'Productos Veganos': {
    name: 'Productos Veganos',
    icon: '🥗',
    color: '#22c55e',
    firebaseKey: 'veganos',
    subcategories: []
  },

  // VARIOS
  'Edulcorantes': {
    name: 'Edulcorantes',
    icon: '🍯',
    color: '#fef3c7',
    firebaseKey: 'edulcorantes',
    subcategories: []
  },
  'Levaduras y Polvos': {
    name: 'Levaduras y Polvos',
    icon: '🧂',
    color: '#fde68a',
    firebaseKey: 'levaduras_polvos',
    subcategories: []
  },
  'Gelatinas y Flanes': {
    name: 'Gelatinas y Flanes',
    icon: '🍮',
    color: '#fbbf24',
    firebaseKey: 'gelatinas_flanes',
    subcategories: []
  },

  // CATEGORÍA DEFAULT
  'Otros': {
    name: 'Otros',
    icon: '📦',
    color: '#9ca3af',
    firebaseKey: 'otros',
    subcategories: []
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

// ✅ FUNCIÓN CORREGIDA - determineCategory con normalización Y VALIDACIÓN
const determineCategory = (nombre, marca, categoria_principal) => {
  // ✅ VALIDACIÓN: Si categoria_principal existe, usarla
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
  
  // ✅ CORRECCIÓN: Fallback simplificado sin usar keywords (que no existen)
  // Si no se encontró categoría, intentar buscar por palabras clave en el nombre del producto
  const nombreLower = normalizeText(nombre || '');
  const marcaLower = normalizeText(marca || '');
  
  // Búsqueda simple por coincidencia de palabras
  for (const [categoryName, config] of Object.entries(CATEGORY_CONFIG)) {
    const firebaseKeyWords = config.firebaseKey.split('_');
    
    // Verificar si alguna palabra del firebaseKey está en el nombre o marca
    for (const word of firebaseKeyWords) {
      if (nombreLower.includes(word) || marcaLower.includes(word)) {
        console.log(`✨ Categoría inferida por keyword: ${categoryName}`);
        return categoryName;
      }
    }
  }
  
  // Si no se encontró nada, retornar 'Otros'
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