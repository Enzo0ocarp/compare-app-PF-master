// index.js (Firebase Functions)
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Ruta GET para obtener todas (o por producto) las reseñas
app.get("/reviews", async (req, res) => {
  try {
    // Si se envía productId como query parameter, filtra por él
    const { productId } = req.query;
    let query = db.collection("reviews");
    if (productId) {
      query = query.where("productId", "==", productId);
    }

    const snapshot = await query.get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null
    }));

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error obteniendo reseñas:", error);
    res.status(500).send("Error obteniendo reseñas");
  }
});

// Ruta POST para crear una reseña
app.post("/reviews", async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    
    // Validar campos mínimos
    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    let username = "Anónimo";
    if (userId) {
      try {
        // Espera la obtención de los datos del usuario y asigna displayName
        const userRecord = await admin.auth().getUser(userId);
        username = userRecord.displayName || "Anónimo";
      } catch (error) {
        console.error("Error obteniendo información del usuario:", error);
        // Si falla, se asigna "Anónimo"
      }
    }
    
    const newReview = {
      productId,
      userId: userId || null,
      rating: Number(rating),
      comment,
      username,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("reviews").add(newReview);

    // Respuesta rápida, se formatea createdAt como ISO si es posible
    res.status(201).json({
      id: docRef.id,
      ...newReview,
      createdAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error creando reseña:", error);
    res.status(500).json({ error: "Error creando reseña", details: error.message });
  }
});

exports.api = functions.https.onRequest(app);
