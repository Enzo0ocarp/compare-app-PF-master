const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const { getProducts } = require("./productsController");
const { addReview, getReviews, addOpinion } = require("./reviewsController");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Rutas
app.get("/products", getProducts);
app.post("/reviews", addReview);
app.get("/reviews/:productId", getReviews);
app.post("/reviews/:reviewId/opinion", addOpinion);

exports.api = functions.https.onRequest(app);
