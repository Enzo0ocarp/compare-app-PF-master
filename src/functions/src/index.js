const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Ruta GET para obtener todas las reseñas
app.get("/reviews", async (req, res) => {
  try {
    const snapshot = await db.collection("reviews").get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error obteniendo reseñas");
  }
});

// Ruta POST para crear una reseña
app.post("/reviews", async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    
    const newReview = {
      productId,
      userId,
      rating: Number(rating),
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      username: (await admin.auth().getUser(userId)).displayName || "Anónimo"
    };

    const docRef = await db.collection("reviews").add(newReview);
    
    res.status(201).json({
      id: docRef.id,
      ...newReview,
      createdAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error creando reseña");
  }
});

exports.api = functions.https.onRequest(app); // <-- ¡Este nombre define el prefijo!