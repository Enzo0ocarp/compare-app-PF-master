import React, { useState, useEffect } from 'react';
import { auth } from '../backend/functions/firebaseConfig'; 
import { onAuthStateChanged, signOut } from 'firebase/auth'; // 🔥 Importación necesaria
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({
          name: user.displayName || 'Usuario sin nombre',
          email: user.email,
          membership: `Miembro desde ${new Date(user.metadata.creationTime).getFullYear()}`,
          photoURL: user.photoURL || '/default-profile.png',
        });
        setLoading(false);
      } else {
        setUserInfo(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // ✅ Ahora está definido
      setNotification({ type: 'success', message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      setNotification({ type: 'error', message: `Error al cerrar sesión: ${error.message}` });
    }
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
