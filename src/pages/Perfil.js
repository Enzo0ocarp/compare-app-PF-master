// src/pages/Perfil.js - VERSIÓN FINAL COMPLETA Y CORREGIDA
import React, { useState, useEffect } from 'react';
import { auth, db, uploadProfilePhoto, getFirebaseErrorMessage } from '../functions/src/firebaseConfig';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  // Función para cargar el perfil del usuario CON DATOS REALES
  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        
        // Cargar estadísticas reales compatibles con tu estructura
        const stats = await loadUserStats(userId);
        
        setUserProfile({
          ...profileData,
          memberSince: profileData.createdAt?.toDate() || new Date(),
          role: profileData.role || 'user',
          stats: stats
        });
      } else {
        await createBasicProfile(userId);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      showNotification('Error al cargar el perfil', 'error');
    }
  };

  // Cargar estadísticas reales compatibles con tu estructura actual
  const loadUserStats = async (userId) => {
    try {
      const stats = {
        searchesCount: 0,
        favoritesCount: 0,
        contributionsCount: 0,
        reviewsCount: 0,
        estimatedSavings: 0
      };

      // Cargar reseñas del usuario usando tu estructura existente
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('userId', '==', userId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        stats.reviewsCount = reviewsSnapshot.size;
      } catch (error) {
        console.warn('No se pudieron cargar las reseñas:', error);
      }

      // Cargar contribuciones nutricionales si existen
      try {
        const contributionsQuery = query(
          collection(db, 'nutritional_contributions'),
          where('userId', '==', userId)
        );
        const contributionsSnapshot = await getDocs(contributionsQuery);
        stats.contributionsCount = contributionsSnapshot.size;
      } catch (error) {
        console.warn('No se pudieron cargar las contribuciones:', error);
      }

      // Cargar estadísticas del documento del usuario
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (userData?.stats) {
        stats.searchesCount = userData.stats.searchesCount || 0;
        stats.favoritesCount = userData.stats.favoritesCount || 0;
        stats.estimatedSavings = userData.stats.estimatedSavings || 0;
      }

      return stats;
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      return {
        searchesCount: 0,
        favoritesCount: 0,
        contributionsCount: 0,
        reviewsCount: 0,
        estimatedSavings: 0
      };
    }
  };

  // Crear perfil básico compatible con tu estructura
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
          reviewsCount: 0,
          estimatedSavings: 0
        },
        isActive: true
      };
      
      await setDoc(doc(db, 'users', userId), basicProfile);
      setUserProfile(basicProfile);
      
      console.log('Perfil básico creado exitosamente');
      
    } catch (error) {
      console.error('Error creando perfil básico:', error);
      showNotification('Error al crear el perfil', 'error');
    }
  };

  // FUNCIÓN MEJORADA: Cambiar foto de perfil compatible con tu Firebase
  const handlePhotoUpload = async (file) => {
    if (!file || !user) return;

    setUploadingPhoto(true);

    try {
      // Subir usando la función compatible
      const uploadResult = await uploadProfilePhoto(file, user.uid);

      // Actualizar en Auth
      await updateProfile(user, { 
        photoURL: uploadResult.url 
      });

      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: uploadResult.url,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setUserProfile(prev => ({ 
        ...prev, 
        photoURL: uploadResult.url 
      }));
      
      setUser({ 
        ...user, 
        photoURL: uploadResult.url 
      });

      showNotification('Foto de perfil actualizada correctamente', 'success');

    } catch (error) {
      console.error('Error subiendo foto:', error);
      const errorMessage = getFirebaseErrorMessage(error.code) || error.message;
      showNotification(errorMessage, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Función para actualizar perfil MEJORADA
  const handleUpdateProfile = async (updatedData) => {
    try {
      setLoading(true);
      const userId = user.uid;
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', userId), {
        ...updatedData,
        updatedAt: new Date()
      });

      // Si se cambió el nombre, actualizar también en Auth
      if (updatedData.firstName || updatedData.lastName) {
        const displayName = `${updatedData.firstName || userProfile.firstName} ${updatedData.lastName || userProfile.lastName}`;
        await updateProfile(user, { displayName });
      }
      
      // Recargar estadísticas después de actualizar
      const newStats = await loadUserStats(userId);
      
      setUserProfile(prev => ({ 
        ...prev, 
        ...updatedData,
        stats: newStats
      }));
      setIsEditing(false);
      showNotification('Perfil actualizado correctamente', 'success');
      
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      const errorMessage = getFirebaseErrorMessage(error.code) || error.message;
      showNotification(`Error al actualizar el perfil: ${errorMessage}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para incrementar estadísticas (útil para cuando el usuario realice acciones)
  const incrementUserStat = async (statField, increment = 1) => {
    try {
      const userId = user.uid;
      const userRef = doc(db, 'users', userId);
      
      // Obtener datos actuales
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.data();
      const currentStats = currentData?.stats || {};
      
      // Calcular nuevo valor
      const newValue = (currentStats[statField] || 0) + increment;
      
      // Actualizar en Firestore
      await updateDoc(userRef, {
        [`stats.${statField}`]: newValue,
        updatedAt: new Date()
      });
      
      // Actualizar estado local
      setUserProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statField]: newValue
        }
      }));
      
    } catch (error) {
      console.error('Error incrementando estadística:', error);
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
      const errorMessage = getFirebaseErrorMessage(error.code) || error.message;
      showNotification(`Error al cerrar sesión: ${errorMessage}`, 'error');
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
    <div className="profile-page app-nav-offset">
      {/* Header del perfil */}
      <ProfileHeader 
        user={userProfile}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        onPhotoUpload={handlePhotoUpload}
        uploadingPhoto={uploadingPhoto}
      />

      {/* Contenedor principal con espaciado mejorado */}
      <div className="profile-container app-bottom-offset">
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
              onIncrementStat={incrementUserStat}
            />
          )}

          {activeTab === 'products' && (
            <UserProductsSection 
              userId={user.uid}
              onStatUpdate={incrementUserStat}
            />
          )}

          {activeTab === 'contributions' && (
            <ContributionsSection 
              userId={user.uid}
              userRole={userProfile.role}
              onContributionSubmitted={() => {
                // Recargar estadísticas cuando se envíe una contribución
                loadUserStats(user.uid).then(newStats => {
                  setUserProfile(prev => ({ ...prev, stats: newStats }));
                });
              }}
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