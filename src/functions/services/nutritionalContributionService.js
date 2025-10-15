// src/services/nutritionalContributionService.js
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../src/firebaseConfig';

const COLLECTIONS = {
  CONTRIBUTIONS: 'nutritional_contributions',
  NUTRITION_DATA: 'nutrition_data',
  PRODUCTS: 'products'
};

/**
 * Agregar una contribución nutricional pendiente de aprobación
 */
export const addNutritionalContribution = async (contributionData) => {
  try {
    const contribution = {
      productId: contributionData.productId,
      productName: contributionData.productName,
      productBrand: contributionData.productBrand,
      nutritionalData: contributionData.nutritionalData,
      contributedBy: contributionData.contributedBy,
      contributorEmail: contributionData.contributorEmail,
      status: 'pending',
      createdAt: serverTimestamp(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.CONTRIBUTIONS), contribution);
    console.log('✅ Contribución agregada:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('Error agregando contribución:', error);
    throw error;
  }
};

/**
 * Obtener contribuciones pendientes (para Admin)
 */
export const getPendingContributions = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CONTRIBUTIONS),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    const contributions = [];
    
    snapshot.forEach(doc => {
      contributions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return contributions;
    
  } catch (error) {
    console.error('Error obteniendo contribuciones:', error);
    return [];
  }
};

/**
 * Aprobar una contribución nutricional
 */
export const approveNutritionalContribution = async (contributionId, adminId) => {
  try {
    // Obtener la contribución
    const contributionRef = doc(db, COLLECTIONS.CONTRIBUTIONS, contributionId);
    const contributionSnap = await getDocs(query(collection(db, COLLECTIONS.CONTRIBUTIONS), where('__name__', '==', contributionId)));
    
    if (contributionSnap.empty) {
      throw new Error('Contribución no encontrada');
    }

    const contribution = contributionSnap.docs[0].data();
    
    // Crear o actualizar nutrition_data
    const nutritionDoc = {
      producto_id: contribution.productId,
      calorias_100g: contribution.nutritionalData.calories,
      proteinas_g: contribution.nutritionalData.proteins,
      carbohidratos_g: contribution.nutritionalData.carbs,
      grasas_g: contribution.nutritionalData.fats,
      fibra_g: contribution.nutritionalData.fiber || 0,
      sodio_mg: contribution.nutritionalData.sodium || 0,
      azucares_g: contribution.nutritionalData.sugar || 0,
      grasas_saturadas_g: contribution.nutritionalData.saturatedFats || 0,
      ingredientes: contribution.nutritionalData.ingredients || [],
      alergenos: contribution.nutritionalData.allergens || [],
      apto_vegano: contribution.nutritionalData.isVegan || false,
      apto_vegetariano: contribution.nutritionalData.isVegetarian || false,
      sin_gluten: contribution.nutritionalData.isGlutenFree || false,
      organico: contribution.nutritionalData.isOrganic || false,
      fuente: contribution.nutritionalData.source,
      verificado: true,
      confianza: 0.8,
      creado_por: contribution.contributedBy,
      fecha_creacion: serverTimestamp(),
      fecha_actualizacion: serverTimestamp()
    };

    await addDoc(collection(db, COLLECTIONS.NUTRITION_DATA), nutritionDoc);
    
    // Marcar contribución como aprobada
    await updateDoc(contributionRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId
    });
    
    console.log('✅ Contribución aprobada');
    return true;
    
  } catch (error) {
    console.error('Error aprobando contribución:', error);
    throw error;
  }
};

/**
 * Rechazar una contribución
 */
export const rejectNutritionalContribution = async (contributionId, adminId, reason) => {
  try {
    const contributionRef = doc(db, COLLECTIONS.CONTRIBUTIONS, contributionId);
    
    await updateDoc(contributionRef, {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminId,
      rejectionReason: reason
    });
    
    console.log('❌ Contribución rechazada');
    return true;
    
  } catch (error) {
    console.error('Error rechazando contribución:', error);
    throw error;
  }
};