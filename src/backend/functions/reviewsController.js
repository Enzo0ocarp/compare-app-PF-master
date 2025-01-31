const admin = require("firebase-admin");
const db = admin.firestore();

// Agregar una reseña
exports.addReview = async (req, res) => {
  const { productId, userId, username, rating, comment } = req.body;
  try {
    await db.collection("reviews").add({
      productId,
      userId,
      username,
      rating,
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Reseña agregada" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar reseña" });
  }
};

// Obtener reseñas de un producto
exports.getReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    const snapshot = await db.collection("reviews").where("productId", "==", productId).get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo reseñas" });
  }
};

// Agregar opinión a una reseña
exports.addOpinion = async (req, res) => {
  const { reviewId } = req.params;
  const { userId, username, comment } = req.body;
  try {
    await db.collection("reviews").doc(reviewId).collection("opinions").add({
      userId,
      username,
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ message: "Opinión agregada" });
  } catch (error) {
    res.status(500).json({ error: "Error agregando opinión" });
  }
};
