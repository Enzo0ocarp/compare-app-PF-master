// src/firebaseConfig.js - CONFIGURACIÓN FIREBASE ACTUALIZADA
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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

// Obtener servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Solo para desarrollo - conectar al emulador si está disponible
if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
  try {
    // Conectar al emulador de Firestore si está corriendo
    // connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Modo desarrollo - usando Firebase real');
  } catch (error) {
    console.log('Firebase emulator no disponible, usando Firebase real');
  }
}

export { auth, signOut, db };