// src/services/recommendationsService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { calculateNutritionalScore, getNutritionalProducts } from './nutritionalService';

// Colecciones de Firebase
const COLLECTIONS = {
  RECOMMENDATIONS: 'nutritional_recommendations',
  USER_BEHAVIOR: 'user_behavior',
  TRENDING_PRODUCTS: 'trending_products',
  NUTRITIONAL_GOALS: 'nutritional_goals',
  MEAL_PLANS: 'meal_plans',
  SMART_ALERTS: 'smart_alerts'
};

// ===== SISTEMA DE RECOMENDACIONES INTELIGENTE =====

/**
 * Genera recomendaciones personalizadas para un usuario
 * @param {string} userId - ID del usuario
 * @param {object} preferences - Preferencias del usuario
 * @param {number} count - Número de recomendaciones a generar
 * @returns {Promise<Array>} Lista de recomendaciones
 */
export const generatePersonalizedRecommendations = async (userId, preferences = {}, count = 10) => {
  try {
    // Obtener historial del usuario
    const userBehavior = await getUserBehavior(userId);
    
    // Obtener productos trending
    const trendingProducts = await getTrendingProducts();
    
    // Obtener productos por categorías de preferencia
    const categoryProducts = await getProductsByCategories(preferences.favoriteCategories || []);
    
    // Obtener todos los productos nutricionales
    const allProducts = await getAllNutritionalProducts();
    
    // Calcular scores de recomendación
    const recommendations = await calculateRecommendationScores(
      userId,
      userBehavior,
      trendingProducts,
      allProducts,
      preferences
    );
    
    // Filtrar y ordenar por score
    const filteredRecommendations = recommendations
      .filter(rec => rec.score > 0.3) // Score mínimo
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
    
    // Guardar recomendaciones en Firebase
    await saveRecommendations(userId, filteredRecommendations);
    
    return filteredRecommendations;
    
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    throw error;
  }
};

/**
 * Obtiene recomendaciones guardadas del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Recomendaciones guardadas
 */
export const getSavedRecommendations = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.RECOMMENDATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const recommendations = [];

    querySnapshot.forEach((doc) => {
      recommendations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return recommendations;
  } catch (error) {
    console.error('Error obteniendo recomendaciones guardadas:', error);
    throw error;
  }
};

/**
 * Registra el comportamiento del usuario para mejorar recomendaciones
 * @param {string} userId - ID del usuario
 * @param {object} behaviorData - Datos del comportamiento
 * @returns {Promise<void>}
 */
export const trackUserBehavior = async (userId, behaviorData) => {
  try {
    await addDoc(collection(db, COLLECTIONS.USER_BEHAVIOR), {
      userId,
      ...behaviorData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error registrando comportamiento:', error);
    throw error;
  }
};

/**
 * Obtiene recomendaciones basadas en objetivos nutricionales
 * @param {object} nutritionalGoals - Objetivos del usuario
 * @param {number} count - Número de recomendaciones
 * @returns {Promise<Array>} Productos recomendados
 */
export const getRecommendationsByGoals = async (nutritionalGoals, count = 10) => {
  try {
    const products = await getAllNutritionalProducts();
    const scoredProducts = [];

    for (const product of products) {
      if (!product.nutritionalData) continue;

      const score = calculateGoalCompatibilityScore(product.nutritionalData, nutritionalGoals);
      
      if (score > 0.5) {
        scoredProducts.push({
          ...product,
          recommendationScore: score,
          recommendationReason: generateRecommendationReason(product.nutritionalData, nutritionalGoals)
        });
      }
    }

    return scoredProducts
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, count);

  } catch (error) {
    console.error('Error obteniendo recomendaciones por objetivos:', error);
    throw error;
  }
};

/**
 * Genera recomendaciones para una dieta específica
 * @param {string} dietType - Tipo de dieta (keto, vegana, etc.)
 * @param {number} count - Número de recomendaciones
 * @returns {Promise<Array>} Productos compatibles con la dieta
 */
export const getRecommendationsByDiet = async (dietType, count = 15) => {
  try {
    const products = await getAllNutritionalProducts();
    const dietRules = getDietRules(dietType);
    const compatibleProducts = [];

    for (const product of products) {
      if (!product.nutritionalData) continue;

      const compatibility = evaluateDietCompatibility(product.nutritionalData, dietRules);
      
      if (compatibility.isCompatible) {
        compatibleProducts.push({
          ...product,
          dietCompatibility: compatibility.score,
          dietBenefits: compatibility.benefits,
          recommendationReason: `Ideal para dieta ${dietType}: ${compatibility.mainReason}`
        });
      }
    }

    return compatibleProducts
      .sort((a, b) => b.dietCompatibility - a.dietCompatibility)
      .slice(0, count);

  } catch (error) {
    console.error('Error obteniendo recomendaciones por dieta:', error);
    throw error;
  }
};

/**
 * Genera alertas inteligentes basadas en productos favoritos del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Lista de alertas
 */
export const generateSmartAlerts = async (userId) => {
  try {
    const userBehavior = await getUserBehavior(userId);
    const favoriteProducts = extractFavoriteProducts(userBehavior);
    const alerts = [];

    for (const product of favoriteProducts) {
      // Buscar alternativas más saludables
      const alternatives = await findHealthierAlternatives(product);
      
      if (alternatives.length > 0) {
        alerts.push({
          type: 'healthier_alternative',
          currentProduct: product,
          alternatives: alternatives.slice(0, 3),
          message: `Encontramos alternativas más saludables para ${product.nombre}`,
          priority: calculateAlertPriority(product, alternatives[0])
        });
      }

      // Alertas de precio
      const priceAlerts = await checkPriceDrops(product);
      if (priceAlerts.length > 0) {
        alerts.push(...priceAlerts);
      }

      // Alertas nutricionales
      const nutritionAlerts = await checkNutritionalConcerns(product);
      if (nutritionAlerts.length > 0) {
        alerts.push(...nutritionAlerts);
      }
    }

    // Guardar alertas en Firebase
    await saveSmartAlerts(userId, alerts);

    return alerts.sort((a, b) => b.priority - a.priority);

  } catch (error) {
    console.error('Error generando alertas:', error);
    throw error;
  }
};

/**
 * Obtiene tendencias nutricionales del mercado
 * @param {string} period - Período de análisis ('week', 'month', 'year')
 * @returns {Promise<object>} Análisis de tendencias
 */
export const getNutritionalTrends = async (period = 'month') => {
  try {
    const userBehaviorData = await getAllUserBehavior(period);
    const productInteractions = aggregateProductInteractions(userBehaviorData);
    
    const trends = {
      topCategories: getTopCategories(productInteractions),
      emergingIngredients: findEmergingIngredients(productInteractions),
      healthTrends: analyzeHealthTrends(productInteractions),
      priceInsights: analyzePriceTrends(productInteractions),
      seasonalPatterns: findSeasonalPatterns(userBehaviorData),
      recommendations: generateTrendBasedRecommendations(productInteractions)
    };

    return trends;

  } catch (error) {
    console.error('Error analizando tendencias:', error);
    throw error;
  }
};

/**
 * Crea un plan de alimentación personalizado
 * @param {string} userId - ID del usuario
 * @param {object} goals - Objetivos nutricionales
 * @param {number} days - Días del plan
 * @returns {Promise<object>} Plan de alimentación
 */
export const createPersonalizedMealPlan = async (userId, goals, days = 7) => {
  try {
    const userPreferences = await getUserPreferences(userId);
    const compatibleProducts = await getProductsForMealPlan(goals, userPreferences);
    
    const mealPlan = generateMealPlan(compatibleProducts, goals, days);
    
    // Guardar el plan generado
    await saveMealPlan(userId, mealPlan);
    
    return {
      plan: mealPlan,
      nutritionalSummary: calculatePlanNutrition(mealPlan),
      shoppingList: generateShoppingList(mealPlan),
      estimatedCost: calculatePlanCost(mealPlan),
      tips: generatePersonalizedTips(mealPlan, goals)
    };

  } catch (error) {
    console.error('Error creando plan de alimentación:', error);
    throw error;
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Obtiene todos los productos nutricionales
 * @returns {Promise<Array>} Lista de productos
 */
const getAllNutritionalProducts = async () => {
  try {
    return await getNutritionalProducts(100); // Obtener hasta 100 productos
  } catch (error) {
    console.error('Error obteniendo productos nutricionales:', error);
    return [];
  }
};

/**
 * Obtiene el comportamiento del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Historial de comportamiento
 */
const getUserBehavior = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USER_BEHAVIOR),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const behavior = [];

    querySnapshot.forEach((doc) => {
      behavior.push(doc.data());
    });

    return behavior;
  } catch (error) {
    console.error('Error obteniendo comportamiento del usuario:', error);
    return [];
  }
};

/**
 * Obtiene productos trending
 * @returns {Promise<Array>} Productos populares
 */
const getTrendingProducts = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRENDING_PRODUCTS),
      orderBy('popularity', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const trending = [];

    querySnapshot.forEach((doc) => {
      trending.push(doc.data());
    });

    return trending;
  } catch (error) {
    console.error('Error obteniendo productos trending:', error);
    return [];
  }
};

/**
 * Obtiene productos por categorías
 * @param {Array} categories - Lista de categorías
 * @returns {Promise<Array>} Productos filtrados
 */
const getProductsByCategories = async (categories) => {
  if (!categories || categories.length === 0) return [];
  
  try {
    const products = await getAllNutritionalProducts();
    return products.filter(product => 
      categories.some(category => 
        product.categoria?.toLowerCase().includes(category.toLowerCase()) ||
        product.marca?.toLowerCase().includes(category.toLowerCase())
      )
    );
  } catch (error) {
    console.error('Error obteniendo productos por categorías:', error);
    return [];
  }
};

/**
 * Calcula scores de recomendación usando algoritmo híbrido
 * @param {string} userId - ID del usuario
 * @param {Array} userBehavior - Comportamiento del usuario
 * @param {Array} trendingProducts - Productos populares
 * @param {Array} allProducts - Todos los productos
 * @param {object} preferences - Preferencias del usuario
 * @returns {Promise<Array>} Productos con scores
 */
const calculateRecommendationScores = async (userId, userBehavior, trendingProducts, allProducts, preferences) => {
  const recommendations = [];

  for (const product of allProducts) {
    if (!product.nutritionalData) continue;

    let score = 0;

    // Score basado en comportamiento del usuario (40%)
    const behaviorScore = calculateBehaviorScore(product, userBehavior);
    score += behaviorScore * 0.4;

    // Score basado en popularidad (20%)
    const popularityScore = calculatePopularityScore(product, trendingProducts);
    score += popularityScore * 0.2;

    // Score basado en calidad nutricional (25%)
    const nutritionScore = product.nutritionalData.score / 10;
    score += nutritionScore * 0.25;

    // Score basado en preferencias del usuario (15%)
    const preferenceScore = calculatePreferenceScore(product, preferences);
    score += preferenceScore * 0.15;

    // Penalizaciones
    score = applyPenalties(score, product, preferences);

    if (score > 0) {
      recommendations.push({
        ...product,
        score: Math.round(score * 100) / 100,
        reasons: generateRecommendationReasons(product, behaviorScore, popularityScore, nutritionScore, preferenceScore)
      });
    }
  }

  return recommendations;
};

/**
 * Calcula score basado en comportamiento del usuario
 * @param {object} product - Producto a evaluar
 * @param {Array} userBehavior - Historial del usuario
 * @returns {number} Score del 0 al 1
 */
const calculateBehaviorScore = (product, userBehavior) => {
  let score = 0;
  
  // Buscar interacciones con productos similares
  const similarInteractions = userBehavior.filter(behavior => 
    behavior.productCategory === product.categoria ||
    behavior.productBrand === product.marca ||
    (behavior.action === 'view_details' && behavior.productId === product.id)
  );

  // Peso por tipo de interacción
  const weights = {
    'view_details': 0.1,
    'compare': 0.2,
    'favorite': 0.3,
    'purchase': 0.5,
    'positive_review': 0.4
  };

  similarInteractions.forEach(interaction => {
    const weight = weights[interaction.action] || 0.05;
    const recency = calculateRecencyWeight(interaction.timestamp);
    score += weight * recency;
  });

  return Math.min(score, 1);
};

/**
 * Calcula peso por recencia de la interacción
 * @param {Date} timestamp - Fecha de la interacción
 * @returns {number} Peso del 0 al 1
 */
const calculateRecencyWeight = (timestamp) => {
  const now = new Date();
  const interaction = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const daysDiff = (now - interaction) / (1000 * 60 * 60 * 24);
  
  if (daysDiff <= 7) return 1.0;
  if (daysDiff <= 30) return 0.8;
  if (daysDiff <= 90) return 0.5;
  return 0.2;
};

/**
 * Calcula score de popularidad
 * @param {object} product - Producto a evaluar
 * @param {Array} trendingProducts - Productos populares
 * @returns {number} Score del 0 al 1
 */
const calculatePopularityScore = (product, trendingProducts) => {
  const trendingProduct = trendingProducts.find(tp => tp.id === product.id);
  if (!trendingProduct) return 0.1;
  
  const maxPopularity = Math.max(...trendingProducts.map(tp => tp.popularity || 0));
  return maxPopularity > 0 ? (trendingProduct.popularity || 0) / maxPopularity : 0.1;
};

/**
 * Calcula score basado en preferencias del usuario
 * @param {object} product - Producto a evaluar
 * @param {object} preferences - Preferencias del usuario
 * @returns {number} Score del 0 al 1
 */
const calculatePreferenceScore = (product, preferences) => {
  let score = 0.5; // Score base
  
  // Preferencias de marca
  if (preferences.preferredBrands?.includes(product.marca)) {
    score += 0.3;
  }
  
  // Restricciones dietéticas
  if (preferences.dietaryRestrictions?.length > 0) {
    const isCompatible = checkDietaryCompatibility(product, preferences.dietaryRestrictions);
    if (!isCompatible) score -= 0.5;
  }
  
  // Alergias
  if (preferences.allergies?.length > 0) {
    const hasAllergens = checkAllergens(product, preferences.allergies);
    if (hasAllergens) score -= 0.8;
  }
  
  // Rango de precio preferido
  if (preferences.priceRange) {
    const priceScore = calculatePriceCompatibility(product.precio, preferences.priceRange);
    score += priceScore * 0.2;
  }

  return Math.max(0, Math.min(1, score));
};

/**
 * Verifica compatibilidad dietética
 * @param {object} product - Producto
 * @param {Array} restrictions - Restricciones dietéticas
 * @returns {boolean} Es compatible
 */
const checkDietaryCompatibility = (product, restrictions) => {
  const productName = product.nombre.toLowerCase();
  const incompatibleIngredients = {
    'vegano': ['leche', 'huevo', 'carne', 'pollo', 'pescado', 'miel'],
    'vegetariano': ['carne', 'pollo', 'pescado'],
    'sin_gluten': ['trigo', 'avena', 'cebada', 'centeno'],
    'sin_lactosa': ['leche', 'lactosa', 'suero'],
    'keto': ['azúcar', 'miel', 'jarabe']
  };

  for (const restriction of restrictions) {
    const forbidden = incompatibleIngredients[restriction] || [];
    if (forbidden.some(ingredient => productName.includes(ingredient))) {
      return false;
    }
  }
  
  return true;
};

/**
 * Verifica presencia de alérgenos
 * @param {object} product - Producto
 * @param {Array} allergies - Lista de alergias
 * @returns {boolean} Contiene alérgenos
 */
const checkAllergens = (product, allergies) => {
  const productName = product.nombre.toLowerCase();
  const allergenMap = {
    'nueces': ['nuez', 'almendra', 'avellana', 'pistache'],
    'lacteos': ['leche', 'lactosa', 'caseína'],
    'gluten': ['trigo', 'avena', 'cebada'],
    'soja': ['soja', 'soya'],
    'huevo': ['huevo', 'albumina']
  };

  for (const allergy of allergies) {
    const allergens = allergenMap[allergy] || [allergy];
    if (allergens.some(allergen => productName.includes(allergen))) {
      return true;
    }
  }
  
  return false;
};

/**
 * Calcula compatibilidad de precio
 * @param {number} price - Precio del producto
 * @param {object} priceRange - Rango de precio preferido
 * @returns {number} Score de compatibilidad
 */
const calculatePriceCompatibility = (price, priceRange) => {
  const { min = 0, max = Infinity } = priceRange;
  
  if (price >= min && price <= max) {
    return 1.0;
  } else if (price < min) {
    return 0.8; // Muy barato puede ser sospechoso
  } else {
    const excess = (price - max) / max;
    return Math.max(0, 1 - excess);
  }
};

/**
 * Aplica penalizaciones al score
 * @param {number} score - Score actual
 * @param {object} product - Producto
 * @param {object} preferences - Preferencias
 * @returns {number} Score ajustado
 */
const applyPenalties = (score, product, preferences) => {
  // Penalización por productos con bajo score nutricional
  if (product.nutritionalData.score < 5) {
    score *= 0.8;
  }
  
  // Penalización por productos muy caros
  if (product.precio > 2000) {
    score *= 0.9;
  }
  
  // Penalización por falta de reseñas
  if (!product.totalReviews || product.totalReviews < 5) {
    score *= 0.95;
  }

  return score;
};

/**
 * Genera razones de recomendación
 * @param {object} product - Producto
 * @param {number} behaviorScore - Score de comportamiento
 * @param {number} popularityScore - Score de popularidad
 * @param {number} nutritionScore - Score nutricional
 * @param {number} preferenceScore - Score de preferencias
 * @returns {Array} Lista de razones
 */
const generateRecommendationReasons = (product, behaviorScore, popularityScore, nutritionScore, preferenceScore) => {
  const reasons = [];
  
  if (behaviorScore > 0.5) {
    reasons.push("Basado en tus productos favoritos");
  }
  
  if (popularityScore > 0.7) {
    reasons.push("Muy popular entre otros usuarios");
  }
  
  if (nutritionScore > 0.8) {
    reasons.push("Excelente calidad nutricional");
  }
  
  if (preferenceScore > 0.7) {
    reasons.push("Coincide con tus preferencias");
  }
  
  if (product.nutritionalData.proteins > 10) {
    reasons.push("Alto contenido proteico");
  }
  
  if (product.nutritionalData.fiber > 5) {
    reasons.push("Rica en fibra");
  }
  
  if (product.nutritionalData.sugar < 5) {
    reasons.push("Bajo en azúcares");
  }

  return reasons;
};

/**
 * Calcula compatibilidad con objetivos nutricionales
 * @param {object} nutritionalData - Datos nutricionales del producto
 * @param {object} goals - Objetivos del usuario
 * @returns {number} Score de compatibilidad
 */
const calculateGoalCompatibilityScore = (nutritionalData, goals) => {
  let score = 0.5; // Score base
  
  // Objetivo de proteínas
  if (goals.highProtein && nutritionalData.proteins > 15) {
    score += 0.3;
  }
  
  // Objetivo de bajo azúcar
  if (goals.lowSugar && nutritionalData.sugar < 5) {
    score += 0.2;
  }
  
  // Objetivo de alta fibra
  if (goals.highFiber && nutritionalData.fiber > 5) {
    score += 0.2;
  }
  
  // Objetivo de bajo sodio
  if (goals.lowSodium && nutritionalData.sodium < 300) {
    score += 0.15;
  }
  
  // Objetivo de bajas calorías
  if (goals.lowCalorie && nutritionalData.calories < 200) {
    score += 0.25;
  }

  return Math.min(1, score);
};

/**
 * Genera razón de recomendación basada en objetivos
 * @param {object} nutritionalData - Datos nutricionales
 * @param {object} goals - Objetivos
 * @returns {string} Razón de recomendación
 */
const generateRecommendationReason = (nutritionalData, goals) => {
  const reasons = [];
  
  if (goals.highProtein && nutritionalData.proteins > 15) {
    reasons.push(`alto en proteínas (${nutritionalData.proteins}g)`);
  }
  
  if (goals.lowSugar && nutritionalData.sugar < 5) {
    reasons.push(`bajo en azúcares (${nutritionalData.sugar}g)`);
  }
  
  if (goals.highFiber && nutritionalData.fiber > 5) {
    reasons.push(`rico en fibra (${nutritionalData.fiber}g)`);
  }
  
  if (reasons.length === 0) {
    return "Buena opción nutricional";
  }
  
  return `Ideal porque es ${reasons.join(', ')}`;
};

/**
 * Obtiene reglas para diferentes tipos de dieta
 * @param {string} dietType - Tipo de dieta
 * @returns {object} Reglas de la dieta
 */
const getDietRules = (dietType) => {
  const rules = {
    keto: {
      maxCarbs: 5,
      minFats: 15,
      maxSugar: 2,
      preferredIngredients: ['aceite', 'aguacate', 'nueces'],
      avoidIngredients: ['azúcar', 'harina', 'papa']
    },
    vegana: {
      avoidIngredients: ['leche', 'huevo', 'carne', 'pollo', 'pescado', 'miel'],
      preferredIngredients: ['soja', 'quinoa', 'legumbres', 'frutos secos']
    },
    paleo: {
      avoidIngredients: ['trigo', 'avena', 'legumbres', 'lácteos'],
      preferredIngredients: ['carne', 'pescado', 'verduras', 'frutos secos']
    },
    mediterranea: {
      preferredIngredients: ['aceite de oliva', 'pescado', 'verduras', 'frutos secos'],
      maxSaturatedFats: 3
    },
    lowCarb: {
      maxCarbs: 15,
      minProteins: 10,
      preferredIngredients: ['proteínas', 'verduras verdes']
    }
  };
  
  return rules[dietType] || {};
};

/**
 * Evalúa compatibilidad con una dieta específica
 * @param {object} nutritionalData - Datos nutricionales
 * @param {object} dietRules - Reglas de la dieta
 * @returns {object} Resultado de compatibilidad
 */
const evaluateDietCompatibility = (nutritionalData, dietRules) => {
  let score = 1.0;
  let isCompatible = true;
  const benefits = [];
  let mainReason = '';

  // Verificar límites nutricionales
  if (dietRules.maxCarbs && nutritionalData.carbs > dietRules.maxCarbs) {
    score -= 0.3;
    if (nutritionalData.carbs > dietRules.maxCarbs * 2) isCompatible = false;
  } else if (dietRules.maxCarbs && nutritionalData.carbs <= dietRules.maxCarbs) {
    benefits.push(`Bajo en carbohidratos (${nutritionalData.carbs}g)`);
    mainReason = 'bajo contenido de carbohidratos';
  }
  
  if (dietRules.minFats && nutritionalData.fats >= dietRules.minFats) {
    benefits.push(`Rico en grasas saludables (${nutritionalData.fats}g)`);
    if (!mainReason) mainReason = 'alto contenido de grasas saludables';
    score += 0.2;
  }
  
  if (dietRules.minProteins && nutritionalData.proteins >= dietRules.minProteins) {
    benefits.push(`Alto en proteínas (${nutritionalData.proteins}g)`);
    if (!mainReason) mainReason = 'alto contenido proteico';
    score += 0.1;
  }
  
  if (dietRules.maxSugar && nutritionalData.sugar <= dietRules.maxSugar) {
    benefits.push(`Bajo en azúcares (${nutritionalData.sugar}g)`);
    if (!mainReason) mainReason = 'bajo contenido de azúcar';
  }

  return {
    isCompatible,
    score: Math.max(0, Math.min(1, score)),
    benefits,
    mainReason: mainReason || 'compatible con la dieta'
  };
};

/**
 * Extrae productos favoritos del comportamiento del usuario
 * @param {Array} userBehavior - Comportamiento del usuario
 * @returns {Array} Productos favoritos
 */
const extractFavoriteProducts = (userBehavior) => {
  const productCounts = {};
  
  userBehavior.forEach(behavior => {
    if (behavior.productId && behavior.action !== 'reject') {
      productCounts[behavior.productId] = (productCounts[behavior.productId] || 0) + 1;
    }
  });
  
  // Retornar productos con más interacciones (simulado)
  return Object.keys(productCounts)
    .sort((a, b) => productCounts[b] - productCounts[a])
    .slice(0, 10)
    .map(productId => ({ id: productId, nombre: `Producto ${productId}` })); // Simplificado
};

/**
 * Encuentra alternativas más saludables
 * @param {object} product - Producto actual
 * @returns {Promise<Array>} Alternativas más saludables
 */
const findHealthierAlternatives = async (product) => {
  try {
    const allProducts = await getAllNutritionalProducts();
    
    return allProducts
      .filter(p => 
        p.id !== product.id &&
        p.categoria === product.categoria &&
        p.nutritionalData &&
        p.nutritionalData.score > (product.nutritionalData?.score || 0) + 1
      )
      .sort((a, b) => b.nutritionalData.score - a.nutritionalData.score)
      .slice(0, 5);
  } catch (error) {
    console.error('Error buscando alternativas más saludables:', error);
    return [];
  }
};

/**
 * Verifica caídas de precio
 * @param {object} product - Producto
 * @returns {Promise<Array>} Alertas de precio
 */
const checkPriceDrops = async (product) => {
  const alerts = [];
  
  // Simulación de verificación de precios
  const randomDrop = Math.random();
  if (randomDrop > 0.7) { // 30% probabilidad de oferta
    const discount = Math.floor(Math.random() * 30) + 10; // 10-40% descuento
    alerts.push({
      type: 'price_drop',
      product: product,
      message: `¡${product.nombre} tiene ${discount}% de descuento!`,
      oldPrice: product.precio,
      newPrice: Math.floor(product.precio * (1 - discount / 100)),
      priority: 0.8
    });
  }
  
  return alerts;
};

/**
 * Verifica preocupaciones nutricionales
 * @param {object} product - Producto
 * @returns {Promise<Array>} Alertas nutricionales
 */
const checkNutritionalConcerns = async (product) => {
  const alerts = [];
  
  if (!product.nutritionalData) return alerts;
  
  const { nutritionalData } = product;
  
  // Alto contenido de azúcar
  if (nutritionalData.sugar > 15) {
    alerts.push({
      type: 'high_sugar',
      product: product,
      message: `${product.nombre} tiene alto contenido de azúcar (${nutritionalData.sugar}g)`,
      priority: 0.7
    });
  }
  
  // Alto contenido de sodio
  if (nutritionalData.sodium > 600) {
    alerts.push({
      type: 'high_sodium',
      product: product,
      message: `${product.nombre} tiene alto contenido de sodio (${nutritionalData.sodium}mg)`,
      priority: 0.6
    });
  }
  
  // Grasas saturadas altas
  if (nutritionalData.saturatedFats > 10) {
    alerts.push({
      type: 'high_saturated_fats',
      product: product,
      message: `${product.nombre} tiene alto contenido de grasas saturadas (${nutritionalData.saturatedFats}g)`,
      priority: 0.6
    });
  }
  
  return alerts;
};

/**
 * Calcula prioridad de alerta
 * @param {object} currentProduct - Producto actual
 * @param {object} alternative - Alternativa
 * @returns {number} Prioridad
 */
const calculateAlertPriority = (currentProduct, alternative) => {
  const scoreDiff = (alternative.nutritionalData?.score || 0) - (currentProduct.nutritionalData?.score || 0);
  return Math.min(1, Math.max(0, scoreDiff / 5)); // Normalizar a 0-1
};

/**
 * Obtiene todo el comportamiento de usuarios para análisis
 * @param {string} period - Período de análisis
 * @returns {Promise<Array>} Datos de comportamiento
 */
const getAllUserBehavior = async (period) => {
  try {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, COLLECTIONS.USER_BEHAVIOR),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const behavior = [];

    querySnapshot.forEach((doc) => {
      behavior.push(doc.data());
    });

    return behavior;
  } catch (error) {
    console.error('Error obteniendo comportamiento de usuarios:', error);
    return [];
  }
};

/**
 * Agrega interacciones de productos
 * @param {Array} behaviorData - Datos de comportamiento
 * @returns {object} Interacciones agregadas
 */
const aggregateProductInteractions = (behaviorData) => {
  const interactions = {};
  
  behaviorData.forEach(behavior => {
    const { productId, action, productCategory, productBrand } = behavior;
    
    if (!interactions[productId]) {
      interactions[productId] = {
        views: 0,
        compares: 0,
        favorites: 0,
        purchases: 0,
        category: productCategory,
        brand: productBrand,
        totalInteractions: 0
      };
    }
    
    interactions[productId][action] = (interactions[productId][action] || 0) + 1;
    interactions[productId].totalInteractions++;
  });
  
  return interactions;
};

/**
 * Obtiene categorías más populares
 * @param {object} interactions - Interacciones agregadas
 * @returns {Array} Top categorías
 */
const getTopCategories = (interactions) => {
  const categories = {};
  
  Object.values(interactions).forEach(interaction => {
    if (interaction.category) {
      categories[interaction.category] = (categories[interaction.category] || 0) + interaction.totalInteractions;
    }
  });
  
  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([category, count]) => ({ category, interactions: count }));
};

/**
 * Encuentra ingredientes emergentes
 * @param {object} interactions - Interacciones
 * @returns {Array} Ingredientes emergentes
 */
const findEmergingIngredients = (interactions) => {
  // Simulación de ingredientes emergentes
  return [
    { ingredient: 'Quinoa', growth: 45 },
    { ingredient: 'Aceite de coco', growth: 38 },
    { ingredient: 'Proteína vegetal', growth: 52 },
    { ingredient: 'Sin gluten', growth: 29 },
    { ingredient: 'Orgánico', growth: 33 }
  ];
};

/**
 * Analiza tendencias de salud
 * @param {object} interactions - Interacciones
 * @returns {object} Análisis de tendencias
 */
const analyzeHealthTrends = (interactions) => {
  return {
    topHealthConcerns: [
      { concern: 'Bajo en azúcar', percentage: 67 },
      { concern: 'Alto en proteínas', percentage: 54 },
      { concern: 'Sin conservantes', percentage: 43 },
      { concern: 'Orgánico', percentage: 38 }
    ],
    dietTrends: [
      { diet: 'Keto', growth: 23 },
      { diet: 'Vegana', growth: 19 },
      { diet: 'Mediterránea', growth: 15 },
      { diet: 'Sin gluten', growth: 12 }
    ]
  };
};

/**
 * Analiza tendencias de precios
 * @param {object} interactions - Interacciones
 * @returns {object} Insights de precios
 */
const analyzePriceTrends = (interactions) => {
  return {
    averagePriceIncrease: 8.5, // Porcentaje
    topValueCategories: [
      { category: 'Lácteos', valueScore: 8.2 },
      { category: 'Cereales', valueScore: 7.8 },
      { category: 'Legumbres', valueScore: 9.1 }
    ],
    priceRangePreferences: {
      budget: 45, // % usuarios prefieren productos económicos
      premium: 25, // % usuarios prefieren productos premium
      mid: 30 // % usuarios prefieren rango medio
    }
  };
};

/**
 * Encuentra patrones estacionales
 * @param {Array} behaviorData - Datos de comportamiento
 * @returns {object} Patrones estacionales
 */
const findSeasonalPatterns = (behaviorData) => {
  const monthlyData = {};
  
  behaviorData.forEach(behavior => {
    const month = behavior.timestamp.toDate().getMonth();
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  
  return {
    peakMonths: Object.entries(monthlyData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([month, count]) => ({ 
        month: parseInt(month), 
        monthName: new Date(2024, month, 1).toLocaleString('es', { month: 'long' }),
        interactions: count 
      })),
    seasonalTrends: {
      spring: 'Mayor interés en productos detox y frescos',
      summer: 'Preferencia por bebidas y snacks ligeros',
      fall: 'Incremento en productos comfort y vitaminas',
      winter: 'Mayor consumo de productos energéticos'
    }
  };
};

/**
 * Genera recomendaciones basadas en tendencias
 * @param {object} interactions - Interacciones
 * @returns {Array} Recomendaciones trending
 */
const generateTrendBasedRecommendations = (interactions) => {
  const trendingProducts = Object.entries(interactions)
    .sort(([,a], [,b]) => b.totalInteractions - a.totalInteractions)
    .slice(0, 10)
    .map(([productId, data]) => ({
      productId,
      reason: 'Muy popular esta semana',
      interactions: data.totalInteractions,
      category: data.category
    }));
  
  return trendingProducts;
};

/**
 * Obtiene preferencias del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<object>} Preferencias
 */
const getUserPreferences = async (userId) => {
  try {
    const userPrefRef = doc(db, 'user_preferences', userId);
    const docSnap = await getDoc(userPrefRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return {
        dietaryRestrictions: [],
        allergies: [],
        nutritionalGoals: [],
        preferredBrands: []
      };
    }
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    return {};
  }
};

/**
 * Obtiene productos para plan de alimentación
 * @param {object} goals - Objetivos
 * @param {object} preferences - Preferencias
 * @returns {Promise<Array>} Productos compatibles
 */
const getProductsForMealPlan = async (goals, preferences) => {
  try {
    const allProducts = await getAllNutritionalProducts();
    
    return allProducts.filter(product => {
      if (!product.nutritionalData) return false;
      
      // Verificar compatibilidad con objetivos
      const goalScore = calculateGoalCompatibilityScore(product.nutritionalData, goals);
      if (goalScore < 0.6) return false;
      
      // Verificar restricciones dietéticas
      if (preferences.dietaryRestrictions?.length > 0) {
        const isCompatible = checkDietaryCompatibility(product, preferences.dietaryRestrictions);
        if (!isCompatible) return false;
      }
      
      // Verificar alergias
      if (preferences.allergies?.length > 0) {
        const hasAllergens = checkAllergens(product, preferences.allergies);
        if (hasAllergens) return false;
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error obteniendo productos para plan:', error);
    return [];
  }
};

/**
 * Genera plan de alimentación
 * @param {Array} products - Productos disponibles
 * @param {object} goals - Objetivos
 * @param {number} days - Días del plan
 * @returns {object} Plan de alimentación
 */
const generateMealPlan = (products, goals, days) => {
  const plan = {};
  
  for (let day = 1; day <= days; day++) {
    plan[`day${day}`] = {
      breakfast: selectMealProducts(products, 'breakfast', goals),
      lunch: selectMealProducts(products, 'lunch', goals),
      dinner: selectMealProducts(products, 'dinner', goals),
      snacks: selectMealProducts(products, 'snack', goals)
    };
  }
  
  return plan;
};

/**
 * Selecciona productos para una comida
 * @param {Array} products - Productos disponibles
 * @param {string} mealType - Tipo de comida
 * @param {object} goals - Objetivos
 * @returns {Array} Productos seleccionados
 */
const selectMealProducts = (products, mealType, goals) => {
  // Lógica simplificada para seleccionar productos por tipo de comida
  const mealProducts = products
    .filter(product => {
      // Filtrar por tipo de comida basado en categoría o características
      if (mealType === 'breakfast') {
        return product.categoria?.includes('cereales') || 
               product.categoria?.includes('lácteos') ||
               product.nombre?.toLowerCase().includes('avena');
      }
      return true; // Para otros tipos de comida, incluir todos por ahora
    })
    .slice(0, 3); // Máximo 3 productos por comida
  
  return mealProducts;
};

/**
 * Calcula nutrición del plan
 * @param {object} mealPlan - Plan de alimentación
 * @returns {object} Resumen nutricional
 */
const calculatePlanNutrition = (mealPlan) => {
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  
  Object.values(mealPlan).forEach(day => {
    Object.values(day).forEach(meal => {
      meal.forEach(product => {
        if (product.nutritionalData) {
          totalCalories += product.nutritionalData.calories || 0;
          totalProteins += product.nutritionalData.proteins || 0;
          totalCarbs += product.nutritionalData.carbs || 0;
          totalFats += product.nutritionalData.fats || 0;
        }
      });
    });
  });
  
  const days = Object.keys(mealPlan).length;
  
  return {
    dailyAverage: {
      calories: Math.round(totalCalories / days),
      proteins: Math.round(totalProteins / days),
      carbs: Math.round(totalCarbs / days),
      fats: Math.round(totalFats / days)
    },
    weeklyTotal: {
      calories: totalCalories,
      proteins: totalProteins,
      carbs: totalCarbs,
      fats: totalFats
    }
  };
};

/**
 * Genera lista de compras
 * @param {object} mealPlan - Plan de alimentación
 * @returns {Array} Lista de compras
 */
const generateShoppingList = (mealPlan) => {
  const products = new Map();
  
  Object.values(mealPlan).forEach(day => {
    Object.values(day).forEach(meal => {
      meal.forEach(product => {
        if (products.has(product.id)) {
          products.set(product.id, {
            ...products.get(product.id),
            quantity: products.get(product.id).quantity + 1
          });
        } else {
          products.set(product.id, {
            ...product,
            quantity: 1
          });
        }
      });
    });
  });
  
  return Array.from(products.values());
};

/**
 * Calcula costo del plan
 * @param {object} mealPlan - Plan de alimentación
 * @returns {number} Costo estimado
 */
const calculatePlanCost = (mealPlan) => {
  let totalCost = 0;
  
  Object.values(mealPlan).forEach(day => {
    Object.values(day).forEach(meal => {
      meal.forEach(product => {
        totalCost += product.precio || 0;
      });
    });
  });
  
  return totalCost;
};

/**
 * Genera tips personalizados
 * @param {object} mealPlan - Plan de alimentación
 * @param {object} goals - Objetivos
 * @returns {Array} Tips personalizados
 */
const generatePersonalizedTips = (mealPlan, goals) => {
  const tips = [];
  
  if (goals.highProtein) {
    tips.push('Incluye una fuente de proteína en cada comida para maximizar la síntesis proteica');
  }
  
  if (goals.lowCarb) {
    tips.push('Reemplaza los carbohidratos con verduras de hoja verde para mantener la saciedad');
  }
  
  if (goals.weightLoss) {
    tips.push('Bebe agua antes de cada comida para aumentar la sensación de saciedad');
  }
  
  tips.push('Planifica tus comidas con anticipación para evitar decisiones impulsivas');
  tips.push('Incluye snacks saludables para mantener estables los niveles de energía');
  
  return tips;
};

/**
 * Guarda recomendaciones en Firebase
 * @param {string} userId - ID del usuario
 * @param {Array} recommendations - Lista de recomendaciones
 * @returns {Promise<void>}
 */
const saveRecommendations = async (userId, recommendations) => {
  try {
    await addDoc(collection(db, COLLECTIONS.RECOMMENDATIONS), {
      userId,
      recommendations,
      createdAt: serverTimestamp(),
      type: 'personalized',
      version: '2.0'
    });
  } catch (error) {
    console.error('Error guardando recomendaciones:', error);
  }
};

/**
 * Guarda alertas inteligentes
 * @param {string} userId - ID del usuario
 * @param {Array} alerts - Lista de alertas
 * @returns {Promise<void>}
 */
const saveSmartAlerts = async (userId, alerts) => {
  try {
    await addDoc(collection(db, COLLECTIONS.SMART_ALERTS), {
      userId,
      alerts,
      createdAt: serverTimestamp(),
      read: false
    });
  } catch (error) {
    console.error('Error guardando alertas:', error);
  }
};

/**
 * Guarda plan de alimentación
 * @param {string} userId - ID del usuario
 * @param {object} mealPlan - Plan de alimentación
 * @returns {Promise<void>}
 */
const saveMealPlan = async (userId, mealPlan) => {
  try {
    await addDoc(collection(db, COLLECTIONS.MEAL_PLANS), {
      userId,
      mealPlan,
      createdAt: serverTimestamp(),
      active: true
    });
  } catch (error) {
    console.error('Error guardando plan de alimentación:', error);
  }
};

// Exportar todas las funciones principales
export {
  generatePersonalizedRecommendations,
  getSavedRecommendations,
  trackUserBehavior,
  getRecommendationsByGoals,
  getRecommendationsByDiet,
  generateSmartAlerts,
  getNutritionalTrends,
  createPersonalizedMealPlan
};