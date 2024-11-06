import React, { useState, useEffect } from 'react';
import { auth, signOut } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';
import BottomNav from '../components/BottomNav';
import EditProfile from '../components/EditProfile';

function Perfil() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false); // Estado para controlar el formulario de edición

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
      await signOut(auth);  // Ahora ya está definido
      alert("¡Has cerrado sesión exitosamente!");
    } catch (error) {
      alert("Error al cerrar sesión: " + error.message);
    }
  };

  const handleEditProfile = () => {
    setShowEditForm(true); // Mostrar el formulario de edición
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false); // Cerrar el formulario de edición
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!userInfo) {
    return (
      <div>
        <p>No estás autenticado. <a href="/login">Inicia sesión aquí</a></p>
      </div>
    );
  }

  return (
    <div className="perfil-page">
      <Header />
      <section className="section profile-section">
        <h3>Perfil de Usuario</h3>
        <ProfileCard user={userInfo} onEditProfile={handleEditProfile} onLogout={handleLogout} />
        {showEditForm && <EditProfile user={userInfo} onClose={handleCloseEditForm} />}
      </section>
      <BottomNav />
    </div>
  );
}

export default Perfil;
