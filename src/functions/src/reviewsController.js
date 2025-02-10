// functions/reviewsController.js
const admin = require("firebase-admin");

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Agregar una reseña (corregir nombres de campos)
exports.addReview = async (req, res) => {
  try {
    const { productId, userId, rating, reviewText } = req.body; // Cambiado comment por reviewText
    
    const newReview = {
      productId,
      userId,
      rating,
      comment: reviewText, // Mapear reviewText a comment
      username: admin.auth().getUser(userId).then((user) => user.displayName) || 'Anónimo',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("reviews").add(newReview);
    res.status(201).json({ id: docRef.id, ...newReview });
    
  } catch (error) {
    console.error('Error al agregar reseña:', error);
    res.status(500).json({ error: "Error al agregar reseña", details: error.message });
  }
};

// Obtener reseñas (manejar con/sin productId)
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    let query = db.collection("reviews");

    if (productId) {
      query = query.where("productId", "==", productId);
    }

    const snapshot = await query.get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convertir Firestore Timestamp a ISO string
      createdAt: doc.data().createdAt.toDate().toISOString()
    }));

    res.json(reviews);
    
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ error: "Error obteniendo reseñas", details: error.message });
  }
};