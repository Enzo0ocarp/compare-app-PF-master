// FirebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importa Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBnsDVZSQSkFYuZyBLdT96CgLbZB_lcYyg",
  authDomain: "compareapp-43d31.firebaseapp.com",
  projectId: "compareapp-43d31",
  storageBucket: "compareapp-43d31.firebasestorage.app",
  messagingSenderId: "262262721422",
  appId: "1:262262721422:web:6642d97a4911a346c4b2df",
  measurementId: "G-LVSEWZG97T"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener el servicio de autenticación
const auth = getAuth(app);

// Inicializar Firestore
const db = getFirestore(app);

export { auth, signOut, db }; // Exporta db junto con auth y signOut
