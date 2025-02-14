// src/pages/Perfil.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../functions/src/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';
import BottomNav from '../components/BottomNav';
import EditProfile from '../components/EditProfile';
import Notification from '../components/Notification';
import '../styles/Perfil.css';

function Perfil() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Datos básicos de Firebase Auth
        let userData = {
          name: user.displayName || 'Usuario sin nombre',
          email: user.email,
          membership: `Miembro desde ${new Date(user.metadata.creationTime).getFullYear()}`,
          photoURL: user.photoURL || '/default-profile.png',
        };
        // Consultar información extra en Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const extraData = docSnap.data();
          userData = { ...userData, ...extraData };
        }
        setUserInfo(userData);
      } else {
        setUserInfo(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    // Lógica de cierre de sesión (sin cambios)
  };

  const handleEditProfile = () => setShowEditForm(true);
  const handleCloseEditForm = () => setShowEditForm(false);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <Header />
      <div className="perfil-page">
        <section className="section profile-section fade-in">
          <h3>Perfil de Usuario</h3>
          <ProfileCard user={userInfo} onEditProfile={handleEditProfile} onLogout={handleLogout} />
          {showEditForm && <EditProfile user={userInfo} onClose={handleCloseEditForm} />}
        </section>
        <BottomNav />
        {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      </div>
    </div>
  );
}

export default Perfil;
