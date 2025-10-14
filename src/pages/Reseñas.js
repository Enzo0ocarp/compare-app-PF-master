// src/pages/Reseñas.js - VERSIÓN 100% FIREBASE SIN IMÁGENES
import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { Rating } from 'primereact/rating';
import { ProgressBar } from 'primereact/progressbar';
import { Chip } from 'primereact/chip';
import { Toast } from 'primereact/toast';

// Componentes
import ReviewList from '../components/ReviewList';
import AddReview from '../components/AddReview';

// Firebase - DIRECTO
import { getAuth } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../functions/src/firebaseConfig';

// Estilos
import '../styles/ReseñasStyles.css';

function Reseñas() {
  // Estados principales
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados de formulario
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [rating, setRating] = useState(0);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState(0);

  const toast = useRef(null);
  const currentUser = getAuth().currentUser;

  // Opciones de filtros
  const ratingOptions = [
    { label: 'Todas las calificaciones', value: null },
    { label: '⭐⭐⭐⭐⭐ 5 estrellas', value: 5 },
    { label: '⭐⭐⭐⭐ 4 estrellas', value: 4 },
    { label: '⭐⭐⭐ 3 estrellas', value: 3 },
    { label: '⭐⭐ 2 estrellas', value: 2 },
    { label: '⭐ 1 estrella', value: 1 }
  ];

  const sortOptions = [
    { label: '🕐 Más recientes', value: 'newest' },
    { label: '🕑 Más antiguas', value: 'oldest' },
    { label: '⭐ Mejor calificadas', value: 'highest' },
    { label: '📉 Peor calificadas', value: 'lowest' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtrar y ordenar
  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, searchTerm, filterRating, sortBy]);

  /**
   * FUNCIÓN PRINCIPAL: Cargar productos y reseñas desde Firebase
   */
  const loadInitialData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando datos desde Firebase...');

      // 1️⃣ CARGAR PRODUCTOS desde Firestore
      const productsQuery = query(
        collection(db, 'products'),
        where('activo', '==', true),
        orderBy('nombre'),
        limit(500) // Limitar a 500 productos activos para mejor performance
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // ID de Firestore
          title: data.nombre || 'Producto sin nombre',
          name: data.nombre || 'Producto sin nombre',
          brand: data.marca || 'Sin marca',
          marca: data.marca || 'Sin marca',
          price: data.precio || 0,
          presentation: data.presentacion || '',
          category: data.categoria_principal || 'general',
          subcategory: data.subcategoria_volumen || '',
          weight: data.peso_gramos || 0,
          active: data.activo || false,
          // SIN IMAGEN - eliminado
          createdAt: data.fecha_creacion?.toDate() || null,
          updatedAt: data.fecha_actualizacion?.toDate() || null
        };
      });

      console.log(`✅ ${productsData.length} productos cargados desde Firebase`);
      setProducts(productsData);

      // 2️⃣ CARGAR RESEÑAS desde Firestore
      const reviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc')
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productId: data.productId,
          userId: data.userId,
          username: data.username || 'Usuario',
          rating: data.rating || 0,
          comment: data.comment || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          verified: data.verified || false,
          helpfulCount: data.helpfulCount || 0
        };
      });

      console.log(`✅ ${reviewsData.length} reseñas cargadas desde Firebase`);
      setReviews(reviewsData);

      showToast('success', 'Datos cargados', `${productsData.length} productos y ${reviewsData.length} reseñas disponibles`);
      
    } catch (error) {
      console.error('❌ Error cargando datos desde Firebase:', error);
      showToast('error', 'Error', `No se pudieron cargar los datos: ${error.message}`);
      setProducts([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReviews = () => {
    if (!Array.isArray(reviews)) {
      setFilteredReviews([]);
      return;
    }

    let filtered = [...reviews];

    // Filtrar por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(review => {
        const commentMatch = review.comment?.toLowerCase().includes(searchLower);
        const productMatch = getProductTitle(review.productId).toLowerCase().includes(searchLower);
        const usernameMatch = review.username?.toLowerCase().includes(searchLower);
        return commentMatch || productMatch || usernameMatch;
      });
    }

    // Filtrar por calificación
    if (filterRating) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'highest':
          return (b.rating || 0) - (a.rating || 0);
        case 'lowest':
          return (a.rating || 0) - (b.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  };

  /**
   * GUARDAR RESEÑA - 100% Firebase
   */
  const handleAddReview = async () => {
    // Validaciones
    if (!currentUser) {
      showToast('warn', 'Autenticación requerida', 'Debes iniciar sesión para escribir reseñas');
      return;
    }

    if (!selectedProductId || !newReviewText.trim() || !rating) {
      showToast('warn', 'Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    if (rating < 1 || rating > 5) {
      showToast('warn', 'Calificación inválida', 'La calificación debe ser entre 1 y 5 estrellas');
      return;
    }

    if (newReviewText.trim().length < 10) {
      showToast('warn', 'Reseña muy corta', 'Escribe al menos 10 caracteres');
      return;
    }

    if (newReviewText.trim().length > 500) {
      showToast('warn', 'Reseña muy larga', 'Máximo 500 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      console.log('💾 Guardando reseña en Firebase...');

      // Crear reseña en Firebase
      const reviewData = {
        productId: selectedProductId, // String del ID del producto
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.email || 'Usuario',
        rating: Number(rating),
        comment: newReviewText.trim(),
        createdAt: serverTimestamp(),
        verified: false,
        helpfulCount: 0
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      console.log('✅ Reseña guardada con ID:', docRef.id);

      // Agregar a la lista local
      const newReview = {
        id: docRef.id,
        ...reviewData,
        createdAt: new Date() // Temporal hasta que se actualice
      };

      setReviews(prev => [newReview, ...prev]);
      
      // Cerrar formulario y resetear
      setShowForm(false);
      resetForm();
      
      showToast('success', '¡Reseña publicada!', 'Tu opinión ha sido compartida con la comunidad');

    } catch (error) {
      console.error('❌ Error al guardar reseña:', error);
      showToast('error', 'Error', `No se pudo guardar la reseña: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setNewReviewText('');
    setRating(0);
  };

  const handleCloseForm = () => {
    if (submitting) return;
    setShowForm(false);
    resetForm();
  };

  const handleOpenForm = () => {
    if (!currentUser) {
      showToast('warn', 'Autenticación requerida', 'Debes iniciar sesión para escribir reseñas');
      return;
    }
    setShowForm(true);
  };

  const getProductTitle = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.title || product?.name || 'Producto no encontrado';
  };

  const getProductBrand = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.brand || product?.marca || '';
  };

  const getAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (Array.isArray(reviews)) {
      reviews.forEach(review => {
        const rating = review.rating;
        if (rating >= 1 && rating <= 5) {
          distribution[rating]++;
        }
      });
    }
    return distribution;
  };

  const showToast = (severity, summary, detail) => {
    if (toast.current) {
      toast.current.show({ severity, summary, detail, life: 3000 });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRating(null);
    setSortBy('newest');
  };

  // Footer del diálogo
  const dialogFooter = (
    <div className="resenas-dialog-footer">
      <Button 
        label={submitting ? "Publicando..." : "Publicar Reseña"}
        icon={submitting ? "pi pi-spin pi-spinner" : "pi pi-send"}
        onClick={handleAddReview}
        disabled={submitting}
        className="p-button-rounded"
      />
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={handleCloseForm}
        disabled={submitting}
        className="p-button-text p-button-rounded"
      />
    </div>
  );

  // Loading
  if (loading) {
    return (
      <div className="resenas-page">
        <Toast ref={toast} />
        <div className="resenas-loading">
          <div className="loading-content">
            <i className="pi pi-spin pi-spinner"></i>
            <h3>Cargando desde Firebase</h3>
            <p>Obteniendo productos y reseñas...</p>
          </div>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const averageRating = getAverageRating();
  const totalReviews = reviews.length;

  return (
    <div className="resenas-page">
      <Toast ref={toast} />
      
      <div className="resenas-container">
        
        {/* Hero Minimalista */}
        <div className="resenas-hero">
          <div className="hero-content-minimal">
            <div className="hero-icon">
              <i className="pi pi-star-fill"></i>
            </div>
            <h1>Reseñas de la Comunidad</h1>
            <p>Experiencias reales, decisiones informadas</p>
            
            <div className="hero-stats-minimal">
              <div className="stat-minimal">
                <span className="stat-value">{totalReviews}</span>
                <span className="stat-label">Reseñas</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-minimal">
                <span className="stat-value">{averageRating}</span>
                <Rating value={parseFloat(averageRating)} readOnly cancel={false} stars={5} />
              </div>
              <div className="stat-divider"></div>
              <div className="stat-minimal">
                <span className="stat-value">{products.length}</span>
                <span className="stat-label">Productos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="resenas-controls">
          <div className="controls-left">
            <span className="p-input-icon-left search-wrapper">
              <i className="pi pi-search" />
              <InputText
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar reseñas..."
                className="search-input-minimal"
              />
            </span>
            
            <Dropdown
              value={filterRating}
              options={ratingOptions}
              onChange={(e) => setFilterRating(e.value)}
              placeholder="Filtrar por estrellas"
              className="filter-minimal"
            />
            
            <Dropdown
              value={sortBy}
              options={sortOptions}
              onChange={(e) => setSortBy(e.value)}
              className="filter-minimal"
            />
            
            {(searchTerm || filterRating) && (
              <Button
                icon="pi pi-times"
                onClick={clearFilters}
                className="p-button-text p-button-rounded"
                tooltip="Limpiar filtros"
              />
            )}
          </div>

          <Button
            label="Escribir Reseña"
            icon="pi pi-pencil"
            onClick={handleOpenForm}
            disabled={!currentUser}
            className="p-button-rounded btn-write-review"
            tooltip={!currentUser ? "Debes iniciar sesión" : ""}
          />
        </div>

        {/* Tabs */}
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)} className="resenas-tabs">
          
          {/* Tab Reseñas */}
          <TabPanel header={`Reseñas (${filteredReviews.length})`} leftIcon="pi pi-comments">
            {filteredReviews.length > 0 ? (
              <div className="reviews-container">
                {(searchTerm || filterRating) && (
                  <div className="applied-filters">
                    {searchTerm && (
                      <Chip 
                        label={`"${searchTerm}"`} 
                        removable 
                        onRemove={() => setSearchTerm('')}
                        icon="pi pi-search"
                      />
                    )}
                    {filterRating && (
                      <Chip 
                        label={`${filterRating} ⭐`} 
                        removable 
                        onRemove={() => setFilterRating(null)}
                      />
                    )}
                  </div>
                )}
                
                <ReviewList 
                  reviews={filteredReviews} 
                  products={products}
                  showProductInfo={true}
                  currentUserId={currentUser?.uid}
                />
              </div>
            ) : (
              <div className="no-results">
                <i className="pi pi-inbox"></i>
                <h3>No se encontraron reseñas</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
                <Button
                  label="Limpiar filtros"
                  icon="pi pi-refresh"
                  onClick={clearFilters}
                  className="p-button-text"
                />
              </div>
            )}
          </TabPanel>

          {/* Tab Estadísticas */}
          <TabPanel header="Estadísticas" leftIcon="pi pi-chart-bar">
            <div className="stats-container">
              
              {/* Distribución */}
              <div className="rating-distribution">
                <h3>Distribución de Calificaciones</h3>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingDistribution[star];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <div key={star} className="rating-bar">
                      <div className="rating-label">
                        <span>{star}</span>
                        <i className="pi pi-star-fill"></i>
                      </div>
                      <ProgressBar 
                        value={percentage}
                        showValue={false}
                        className="rating-progress"
                      />
                      <span className="rating-count">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Insights */}
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon success">
                    <i className="pi pi-thumbs-up"></i>
                  </div>
                  <div className="insight-content">
                    <h4>Satisfacción</h4>
                    <div className="insight-value">
                      {totalReviews > 0 
                        ? `${(((ratingDistribution[4] + ratingDistribution[5]) / totalReviews) * 100).toFixed(0)}%`
                        : '0%'
                      }
                    </div>
                    <p>Usuarios satisfechos (4-5★)</p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-icon info">
                    <i className="pi pi-heart"></i>
                  </div>
                  <div className="insight-content">
                    <h4>Excelentes</h4>
                    <div className="insight-value">{ratingDistribution[5]}</div>
                    <p>Calificaciones de 5 estrellas</p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="insight-icon warning">
                    <i className="pi pi-chart-line"></i>
                  </div>
                  <div className="insight-content">
                    <h4>Promedio</h4>
                    <div className="insight-value">{averageRating}</div>
                    <p>Calificación promedio general</p>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Tab Info */}
          <TabPanel header="Información" leftIcon="pi pi-info-circle">
            <div className="info-container">
              <div className="info-cards">
                <div className="info-card">
                  <i className="pi pi-shield"></i>
                  <h4>Reseñas Verificadas</h4>
                  <p>Sistema de moderación para garantizar autenticidad y calidad en todas las opiniones.</p>
                </div>

                <div className="info-card">
                  <i className="pi pi-users"></i>
                  <h4>Comunidad Real</h4>
                  <p>Solo usuarios registrados pueden escribir reseñas, asegurando opiniones genuinas.</p>
                </div>

                <div className="info-card">
                  <i className="pi pi-heart"></i>
                  <h4>Ayuda a Otros</h4>
                  <p>Tu opinión es valiosa. Ayuda a otros a tomar decisiones informadas.</p>
                </div>

                <div className="info-card">
                  <i className="pi pi-comment"></i>
                  <h4>Feedback Constructivo</h4>
                  <p>Escribe reseñas honestas que destaquen aspectos positivos y áreas de mejora.</p>
                </div>
              </div>

              <div className="guidelines">
                <h4>💡 Consejos para escribir buenas reseñas</h4>
                <ul>
                  <li>Sé específico sobre tu experiencia con el producto</li>
                  <li>Menciona características que te gustaron o no</li>
                  <li>Compara con expectativas o productos similares</li>
                  <li>Incluye contexto sobre cómo usaste el producto</li>
                  <li>Mantén un tono respetuoso y constructivo</li>
                </ul>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>

      {/* Modal Nueva Reseña */}
      <Dialog
        header={
          <div className="dialog-header-minimal">
            <i className="pi pi-star-fill"></i>
            <span>Nueva Reseña</span>
          </div>
        }
        visible={showForm}
        style={{ width: '90vw', maxWidth: '600px' }}
        footer={dialogFooter}
        onHide={handleCloseForm}
        className="resenas-dialog"
        closable={!submitting}
        closeOnEscape={!submitting}
        modal
      >
        <AddReview
          products={products}
          selectedProductId={selectedProductId}
          onProductIdChange={setSelectedProductId}
          newReviewText={newReviewText}
          onReviewTextChange={setNewReviewText}
          rating={rating}
          onRatingChange={setRating}
          disabled={submitting}
        />
      </Dialog>
    </div>
  );
}

export default Reseñas;