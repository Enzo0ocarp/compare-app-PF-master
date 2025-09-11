// src/pages/Perfil.js - Versión Corregida
import React, { useState, useEffect } from 'react';
import { auth, db } from '../functions/src/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; // Agregado setDoc
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/Notification';

// Importar componentes modulares
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import UserInfoSection from '../components/UserInfoSection';
import UserStatsSection from '../components/UserStatsSection';
import UserProductsSection from '../components/UserProductsSection';
import ContributionsSection from '../components/ContributionsSection';
import AdminSection from '../components/AdminSection';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Estilos
import '../styles/ProfilePage.css';

const Perfil = () => {
  // Estados principales
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Hook de navegación y notificaciones
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Efectos
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
        navigate('/login');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile({
          ...profileData,
          memberSince: profileData.createdAt?.toDate() || new Date(),
          role: profileData.role || 'user'
        });
      } else {
        // Crear perfil básico si no existe
        await createBasicProfile(userId);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      showNotification('Error al cargar el perfil', 'error');
    }
  };

  // Crear perfil básico - CORREGIDO: usar setDoc en lugar de updateDoc
  const createBasicProfile = async (userId) => {
    try {
      const basicProfile = {
        firstName: user?.displayName?.split(' ')[0] || '',
        lastName: user?.displayName?.split(' ')[1] || '',
        email: user?.email || '',
        photoURL: user?.photoURL || '',
        role: 'user',
        bio: '',
        birthDate: '',
        location: '',
        phone: '',
        createdAt: new Date(),
        lastLogin: new Date(),
        preferences: {
          notifications: true,
          newsletter: false,
          language: 'es'
        },
        stats: {
          searchesCount: 0,
          favoritesCount: 0,
          contributionsCount: 0,
          reviewsCount: 0
        },
        isActive: true
      };
      
      // CAMBIO: usar setDoc en lugar de updateDoc para crear documento
      await setDoc(doc(db, 'users', userId), basicProfile);
      setUserProfile(basicProfile);
      
      console.log('Perfil básico creado exitosamente');
      
    } catch (error) {
      console.error('Error creando perfil básico:', error);
      showNotification('Error al crear el perfil', 'error');
    }
  };

  // Función para actualizar perfil
  const handleUpdateProfile = async (updatedData) => {
    try {
      setLoading(true);
      const userId = user.uid;
      
      // Usar updateDoc para actualizar documento existente
      await updateDoc(doc(db, 'users', userId), {
        ...updatedData,
        updatedAt: new Date()
      });
      
      setUserProfile(prev => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      showNotification('Perfil actualizado correctamente', 'success');
      
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      showNotification('Error al actualizar el perfil', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification('Sesión cerrada correctamente', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      showNotification('Error al cerrar sesión', 'error');
    }
  };

  // Función para cambiar tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsEditing(false); // Cancelar edición al cambiar tab
  };

  // Verificar permisos de admin
  const isAdmin = userProfile?.role === 'admin';

  // Estados de carga y error
  if (loading) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  if (!user) {
    return (
      <ErrorMessage 
        title="Acceso Restringido"
        message="Debes iniciar sesión para acceder a tu perfil"
        actionText="Iniciar Sesión"
        onAction={() => navigate('/login')}
      />
    );
  }

  if (!userProfile) {
    return (
      <ErrorMessage 
        title="Error de Perfil"
        message="No se pudo cargar la información del perfil"
        actionText="Reintentar"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="profile-page">
      {/* Header del perfil */}
      <ProfileHeader 
        user={userProfile}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      {/* Contenedor principal */}
      <div className="profile-container">
        {/* Tabs de navegación */}
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isAdmin={isAdmin}
        />

        {/* Contenido según tab activo */}
        <div className="tab-content">
          {activeTab === 'profile' && (
            <UserInfoSection
              user={userProfile}
              isEditing={isEditing}
              onEdit={() => setIsEditing(true)}
              onSave={handleUpdateProfile}
              onCancel={() => setIsEditing(false)}
            />
          )}

          {activeTab === 'stats' && (
            <UserStatsSection 
              user={userProfile}
              stats={userProfile.stats}
            />
          )}

          {activeTab === 'products' && (
            <UserProductsSection 
              userId={user.uid}
            />
          )}

          {activeTab === 'contributions' && (
            <ContributionsSection 
              userId={user.uid}
              userRole={userProfile.role}
            />
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;