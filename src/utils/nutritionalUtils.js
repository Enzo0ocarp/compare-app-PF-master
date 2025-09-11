// src/utils/nutritionalUtils.js - UTILIDADES PARA EL SISTEMA NUTRICIONAL

/**
 * Formatea números nutricionales para mostrar
 * @param {number} value - Valor numérico
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Valor formateado
 */
export const formatNutritionalValue = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  if (value === 0) return '0';
  
  if (value < 1) {
    return value.toFixed(2);
  }
  
  return value.toFixed(decimals);
};

/**
 * Convierte alérgenos del formato Firebase al formato legible
 * @param {Array} allergens - Array de alérgenos
 * @returns {Array} Alérgenos formateados
 */
export const formatAllergens = (allergens = []) => {
  const allergenMap = {
    'gluten': 'Gluten',
    'sulphur-dioxide-and-sulphites': 'Sulfitos',
    'eggs': 'Huevos',
    'milk': 'Leche',
    'nuts': 'Frutos secos',
    'peanuts': 'Maní',
    'fish': 'Pescado',
    'shellfish': 'Mariscos',
    'soy': 'Soja',
    'sesame': 'Sésamo'
  };
  
  return allergens.map(allergen => allergenMap[allergen] || allergen);
};

/**
 * Calcula el semáforo nutricional (verde, amarillo, rojo)
 * @param {number} value - Valor del nutriente
 * @param {string} nutrient - Tipo de nutriente
 * @param {number} portion - Porción en gramos (default: 100)
 * @returns {string} Color del semáforo
 */
export const getNutritionalTrafficLight = (value, nutrient, portion = 100) => {
  if (!value || isNaN(value)) return 'gray';
  
  // Normalizar a 100g si la porción es diferente
  const normalizedValue = (value * 100) / portion;
  
  const thresholds = {
    sodium: { low: 120, high: 600 }, // mg por 100g
    sugar: { low: 5, high: 22.5 }, // g por 100g
    saturatedFats: { low: 1.5, high: 5 }, // g por 100g
    totalFats: { low: 3, high: 17.5 }, // g por 100g
    fiber: { low: 3, high: 6 }, // g por 100g (invertido: más es mejor)
    protein: { low: 6, high: 12 } // g por 100g (invertido: más es mejor)
  };
  
  const threshold = thresholds[nutrient];
  if (!threshold) return 'gray';
  
  // Para nutrientes donde más es mejor (fibra, proteína)
  if (nutrient === 'fiber' || nutrient === 'protein') {
    if (normalizedValue >= threshold.high) return 'green';
    if (normalizedValue >= threshold.low) return 'yellow';
    return 'red';
  }
  
  // Para nutrientes donde menos es mejor
  if (normalizedValue <= threshold.low) return 'green';
  if (normalizedValue <= threshold.high) return 'yellow';
  return 'red';
};

/**
 * Categoriza productos por score nutricional
 * @param {number} score - Score nutricional (0-10)
 * @returns {object} Categoría con label y color
 */
export const getScoreCategory = (score) => {
  if (score >= 8) {
    return {
      label: 'Excelente',
      color: 'green',
      description: 'Opción muy saludable'
    };
  } else if (score >= 6) {
    return {
      label: 'Bueno',
      color: 'yellow',
      description: 'Opción moderadamente saludable'
    };
  } else if (score >= 4) {
    return {
      label: 'Regular',
      color: 'orange',
      description: 'Consumir con moderación'
    };
  } else {
    return {
      label: 'Mejorable',
      color: 'red',
      description: 'Buscar alternativas más saludables'
    };
  }
};

/**
 * Calcula el porcentaje de ingesta diaria recomendada
 * @param {number} value - Valor del nutriente
 * @param {string} nutrient - Tipo de nutriente
 * @param {number} portion - Porción en gramos
 * @returns {number} Porcentaje del VD (Valor Diario)
 */
export const calculateDailyValuePercentage = (value, nutrient, portion = 100) => {
  if (!value || isNaN(value)) return 0;
  
  // Valores diarios recomendados (adulto promedio)
  const dailyValues = {
    calories: 2000, // kcal
    protein: 50, // g
    carbs: 300, // g
    totalFats: 65, // g
    saturatedFats: 20, // g
    fiber: 25, // g
    sodium: 2300, // mg
    sugar: 50 // g (límite recomendado)
  };
  
  const dailyValue = dailyValues[nutrient];
  if (!dailyValue) return 0;
  
  // Calcular para la porción especificada
  const portionValue = (value * portion) / 100;
  return Math.round((portionValue / dailyValue) * 100);
};

/**
 * Genera recomendaciones basadas en el perfil nutricional
 * @param {object} nutritionalData - Datos nutricionales del producto
 * @returns {Array} Array de recomendaciones
 */
export const generateNutritionalRecommendations = (nutritionalData) => {
  const recommendations = [];
  
  if (!nutritionalData) return recommendations;
  
  // Recomendaciones por alto contenido de nutrientes problemáticos
  if (nutritionalData.sodium > 600) {
    recommendations.push({
      type: 'warning',
      message: 'Alto contenido de sodio. Consumir con moderación si tienes hipertensión.',
      priority: 'high'
    });
  }
  
  if (nutritionalData.sugar > 15) {
    recommendations.push({
      type: 'warning',
      message: 'Alto contenido de azúcares. Considerar opciones con menos azúcar.',
      priority: 'medium'
    });
  }
  
  if (nutritionalData.saturatedFats > 5) {
    recommendations.push({
      type: 'warning',
      message: 'Alto contenido de grasas saturadas. Moderar el consumo.',
      priority: 'medium'
    });
  }
  
  // Recomendaciones por contenido favorable
  if (nutritionalData.fiber > 6) {
    recommendations.push({
      type: 'positive',
      message: 'Excelente fuente de fibra. Beneficioso para la digestión.',
      priority: 'low'
    });
  }
  
  if (nutritionalData.protein > 10) {
    recommendations.push({
      type: 'positive',
      message: 'Buena fuente de proteínas. Ideal para desarrollo muscular.',
      priority: 'low'
    });
  }
  
  // Recomendaciones por características especiales
  if (nutritionalData.isOrganic) {
    recommendations.push({
      type: 'info',
      message: 'Producto orgánico. Libre de pesticidas sintéticos.',
      priority: 'low'
    });
  }
  
  if (nutritionalData.isVegan) {
    recommendations.push({
      type: 'info',
      message: 'Producto vegano. Libre de ingredientes de origen animal.',
      priority: 'low'
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Compara dos productos nutricionales
 * @param {object} productA - Primer producto
 * @param {object} productB - Segundo producto
 * @returns {object} Resultado de la comparación
 */
export const compareProducts = (productA, productB) => {
  if (!productA.nutritionalData || !productB.nutritionalData) {
    return { error: 'Uno o ambos productos no tienen información nutricional' };
  }
  
  const dataA = productA.nutritionalData;
  const dataB = productB.nutritionalData;
  
  const comparison = {
    winner: null,
    metrics: {},
    summary: {}
  };
  
  // Comparar métricas clave
  const metrics = [
    { key: 'calories', label: 'Calorías', lowerIsBetter: true },
    { key: 'protein', label: 'Proteínas', lowerIsBetter: false },
    { key: 'fiber', label: 'Fibra', lowerIsBetter: false },
    { key: 'sodium', label: 'Sodio', lowerIsBetter: true },
    { key: 'sugar', label: 'Azúcares', lowerIsBetter: true },
    { key: 'saturatedFats', label: 'Grasas Saturadas', lowerIsBetter: true }
  ];
  
  let scoreA = 0;
  let scoreB = 0;
  
  metrics.forEach(metric => {
    const valueA = dataA[metric.key] || 0;
    const valueB = dataB[metric.key] || 0;
    
    let winnerMetric = null;
    
    if (valueA !== valueB) {
      if (metric.lowerIsBetter) {
        winnerMetric = valueA < valueB ? 'A' : 'B';
      } else {
        winnerMetric = valueA > valueB ? 'A' : 'B';
      }
      
      if (winnerMetric === 'A') scoreA++;
      else scoreB++;
    }
    
    comparison.metrics[metric.key] = {
      valueA,
      valueB,
      winner: winnerMetric,
      difference: Math.abs(valueA - valueB),
      percentageDiff: valueB > 0 ? Math.round(((valueA - valueB) / valueB) * 100) : 0
    };
  });
  
  // Determinar ganador general
  if (scoreA > scoreB) {
    comparison.winner = 'A';
    comparison.summary.message = `${productA.marca} es nutricionalmente superior`;
  } else if (scoreB > scoreA) {
    comparison.winner = 'B';
    comparison.summary.message = `${productB.marca} es nutricionalmente superior`;
  } else {
    comparison.winner = 'tie';
    comparison.summary.message = 'Ambos productos son nutricionalmente similares';
  }
  
  comparison.summary.scoreA = scoreA;
  comparison.summary.scoreB = scoreB;
  comparison.summary.totalMetrics = metrics.length;
  
  return comparison;
};

/**
 * Filtros de búsqueda avanzada
 * @param {Array} products - Lista de productos
 * @param {object} filters - Filtros aplicar
 * @returns {Array} Productos filtrados
 */
export const filterProductsAdvanced = (products, filters) => {
  return products.filter(product => {
    // Filtro por categoría
    if (filters.category && filters.category !== 'todos') {
      if (product.categoria !== filters.category) return false;
    }
    
    // Filtro por score mínimo
    if (filters.minScore && product.nutritionalData) {
      if ((product.nutritionalData.score || 0) < filters.minScore) return false;
    }
    
    // Filtro por máximo de calorías
    if (filters.maxCalories && product.nutritionalData) {
      if ((product.nutritionalData.calories || 0) > filters.maxCalories) return false;
    }
    
    // Filtro por características especiales
    if (filters.isVegan && product.nutritionalData) {
      if (!product.nutritionalData.isVegan) return false;
    }
    
    if (filters.isGlutenFree && product.nutritionalData) {
      if (!product.nutritionalData.isGlutenFree) return false;
    }
    
    if (filters.isOrganic && product.nutritionalData) {
      if (!product.nutritionalData.isOrganic) return false;
    }
    
    // Filtro por alérgenos
    if (filters.excludeAllergens && filters.excludeAllergens.length > 0 && product.nutritionalData) {
      const productAllergens = product.nutritionalData.allergens || [];
      const hasExcludedAllergen = filters.excludeAllergens.some(allergen => 
        productAllergens.includes(allergen)
      );
      if (hasExcludedAllergen) return false;
    }
    
    return true;
  });
};

/**
 * Ordena productos por diferentes criterios
 * @param {Array} products - Lista de productos
 * @param {string} sortBy - Criterio de ordenamiento
 * @param {string} order - 'asc' o 'desc'
 * @returns {Array} Productos ordenados
 */
export const sortProducts = (products, sortBy, order = 'desc') => {
  const sortedProducts = [...products];
  
  sortedProducts.sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'score':
        valueA = a.nutritionalData?.score || 0;
        valueB = b.nutritionalData?.score || 0;
        break;
      case 'calories':
        valueA = a.nutritionalData?.calories || 0;
        valueB = b.nutritionalData?.calories || 0;
        break;
      case 'protein':
        valueA = a.nutritionalData?.protein || 0;
        valueB = b.nutritionalData?.protein || 0;
        break;
      case 'name':
        valueA = a.nombre?.toLowerCase() || '';
        valueB = b.nombre?.toLowerCase() || '';
        break;
      case 'brand':
        valueA = a.marca?.toLowerCase() || '';
        valueB = b.marca?.toLowerCase() || '';
        break;
      case 'updated':
        valueA = new Date(a.lastUpdated || 0);
        valueB = new Date(b.lastUpdated || 0);
        break;
      default:
        return 0;
    }
    
    if (typeof valueA === 'string') {
      return order === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    
    if (order === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });
  
  return sortedProducts;
};

/**
 * Genera sugerencias de productos similares
 * @param {object} product - Producto de referencia
 * @param {Array} allProducts - Todos los productos disponibles
 * @param {number} limit - Número máximo de sugerencias
 * @returns {Array} Productos similares
 */
export const getSimilarProducts = (product, allProducts, limit = 5) => {
  if (!product || !product.nutritionalData) return [];
  
  const similar = allProducts
    .filter(p => 
      p.id !== product.id && 
      p.hasNutritionalInfo && 
      p.categoria === product.categoria
    )
    .map(p => {
      // Calcular similitud nutricional
      let similarity = 0;
      let factors = 0;
      
      const metrics = ['calories', 'protein', 'carbs', 'fats'];
      
      metrics.forEach(metric => {
        const valueA = product.nutritionalData[metric] || 0;
        const valueB = p.nutritionalData[metric] || 0;
        
        if (valueA > 0 && valueB > 0) {
          const diff = Math.abs(valueA - valueB) / Math.max(valueA, valueB);
          similarity += (1 - diff);
          factors++;
        }
      });
      
      // Bonificación por características compartidas
      if (product.nutritionalData.isVegan === p.nutritionalData.isVegan) similarity += 0.1;
      if (product.nutritionalData.isGlutenFree === p.nutritionalData.isGlutenFree) similarity += 0.1;
      if (product.nutritionalData.isOrganic === p.nutritionalData.isOrganic) similarity += 0.1;
      
      return {
        ...p,
        similarity: factors > 0 ? similarity / factors : 0
      };
    })
    .filter(p => p.similarity > 0.3) // Mínimo 30% de similitud
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  
  return similar;
};

/**
 * Valida datos nutricionales antes de guardar
 * @param {object} nutritionalData - Datos a validar
 * @returns {object} Resultado de validación
 */
export const validateNutritionalData = (nutritionalData) => {
  const errors = [];
  const warnings = [];
  
  // Validaciones obligatorias
  if (!nutritionalData.calories || nutritionalData.calories < 0) {
    errors.push('Las calorías son obligatorias y deben ser un número positivo');
  }
  
  if (!nutritionalData.protein || nutritionalData.protein < 0) {
    errors.push('Las proteínas son obligatorias y deben ser un número positivo');
  }
  
  if (!nutritionalData.carbs || nutritionalData.carbs < 0) {
    errors.push('Los carbohidratos son obligatorios y deben ser un número positivo');
  }
  
  if (!nutritionalData.fats || nutritionalData.fats < 0) {
    errors.push('Las grasas son obligatorias y deben ser un número positivo');
  }
  
  // Validaciones de coherencia
  const totalMacros = (nutritionalData.protein * 4) + (nutritionalData.carbs * 4) + (nutritionalData.fats * 9);
  const caloriesDiff = Math.abs(nutritionalData.calories - totalMacros);
  
  if (caloriesDiff > nutritionalData.calories * 0.2) {
    warnings.push('Las calorías no coinciden con la suma de macronutrientes (diferencia mayor al 20%)');
  }
  
  // Validaciones de rangos
  if (nutritionalData.sodium > 2000) {
    warnings.push('Contenido de sodio muy alto (>2000mg por 100g)');
  }
  
  if (nutritionalData.sugar > 30) {
    warnings.push('Contenido de azúcar muy alto (>30g por 100g)');
  }
  
  if (nutritionalData.saturatedFats > nutritionalData.fats) {
    errors.push('Las grasas saturadas no pueden ser mayores que las grasas totales');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  };
};

/**
 * Genera un resumen nutricional en texto legible
 * @param {object} nutritionalData - Datos nutricionales
 * @returns {string} Resumen en texto
 */
export const generateNutritionalSummary = (nutritionalData) => {
  if (!nutritionalData) return 'Sin información nutricional disponible.';
  
  const summary = [];
  
  // Información básica
  summary.push(`Contiene ${nutritionalData.calories} calorías por 100g`);
  
  // Macronutrientes
  const macros = [];
  if (nutritionalData.protein) macros.push(`${nutritionalData.protein}g de proteínas`);
  if (nutritionalData.carbs) macros.push(`${nutritionalData.carbs}g de carbohidratos`);
  if (nutritionalData.fats) macros.push(`${nutritionalData.fats}g de grasas`);
  
  if (macros.length > 0) {
    summary.push(`con ${macros.join(', ')}`);
  }
  
  // Características destacadas
  const features = [];
  if (nutritionalData.fiber > 3) features.push('buena fuente de fibra');
  if (nutritionalData.protein > 10) features.push('alto en proteínas');
  if (nutritionalData.sodium > 600) features.push('alto en sodio');
  if (nutritionalData.sugar > 15) features.push('alto en azúcares');
  
  if (features.length > 0) {
    summary.push(`Es ${features.join(' y ')}`);
  }
  
  // Características especiales
  const special = [];
  if (nutritionalData.isVegan) special.push('vegano');
  if (nutritionalData.isGlutenFree) special.push('sin gluten');
  if (nutritionalData.isOrganic) special.push('orgánico');
  
  if (special.length > 0) {
    summary.push(`Producto ${special.join(', ')}`);
  }
  
  return summary.join('. ') + '.';
};

/**
 * Configuración por defecto para filtros
 */
export const defaultFilters = {
  category: 'todos',
  minScore: null,
  maxCalories: null,
  isVegan: false,
  isGlutenFree: false,
  isOrganic: false,
  excludeAllergens: []
};

/**
 * Lista de alérgenos comunes
 */
export const commonAllergens = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'milk', label: 'Leche', icon: '🥛' },
  { id: 'eggs', label: 'Huevos', icon: '🥚' },
  { id: 'nuts', label: 'Frutos secos', icon: '🌰' },
  { id: 'peanuts', label: 'Maní', icon: '🥜' },
  { id: 'soy', label: 'Soja', icon: '🫘' },
  { id: 'fish', label: 'Pescado', icon: '🐟' },
  { id: 'shellfish', label: 'Mariscos', icon: '🦐' },
  { id: 'sesame', label: 'Sésamo', icon: '🌱' },
  { id: 'sulphur-dioxide-and-sulphites', label: 'Sulfitos', icon: '⚗️' }
];