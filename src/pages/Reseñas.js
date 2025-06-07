// src/pages/Reseñas.js - Versión Corregida para App.js actual
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

// Importar componentes (SIN Header y BottomNav ya que App.js los maneja)
import ReviewList from '../components/ReviewList';
import AddReview from '../components/AddReview';

// Importar servicios - ACTUALIZADO para usar la nueva API
import { getAuth } from 'firebase/auth';
import { getAllStoreProducts, addReview, getReviews } from '../functions/services/api';

// Importar estilos
import '../styles/ReseñasStyles.css';

function Reseñas() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState(0);

  // Ref para el Toast
  const toast = useRef(null);

  const currentUser = getAuth().currentUser;

  // Opciones de filtros
  const ratingOptions = [
    { label: 'Todas las calificaciones', value: null },
    { label: '5 estrellas', value: 5 },
    { label: '4 estrellas', value: 4 },
    { label: '3 estrellas', value: 3 },
    { label: '2 estrellas', value: 2 },
    { label: '1 estrella', value: 1 }
  ];

  const sortOptions = [
    { label: 'Más recientes', value: 'newest' },
    { label: 'Más antiguas', value: 'oldest' },
    { label: 'Mejor calificadas', value: 'highest' },
    { label: 'Peor calificadas', value: 'lowest' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, searchTerm, filterRating, sortBy]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Usar la función legacy que mantiene compatibilidad
      const [allProducts, apiReviews] = await Promise.all([
        getAllStoreProducts(),
        getReviews()
      ]);
      
      setProducts(allProducts);
      setReviews(Array.isArray(apiReviews) ? apiReviews : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast('error', 'Error', 'No se pudieron cargar los datos');
      // Fallback con datos vacíos
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

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(review => {
        const commentMatch = review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
        const productMatch = getProductTitle(review.productId).toLowerCase().includes(searchTerm.toLowerCase());
        return commentMatch || productMatch;
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

  const handleAddReview = async () => {
    if (!selectedProductId || !newReviewText.trim() || !rating) {
      showToast('warn', 'Campos incompletos', 'Por favor complete todos los campos');
      return;
    }

    if (rating < 1 || rating > 5) {
      showToast('warn', 'Calificación inválida', 'La calificación debe ser entre 1 y 5 estrellas');
      return;
    }

    setSubmitting(true);
    
    const reviewPayload = {
      productId: selectedProductId,
      comment: newReviewText.trim(),
      rating,
      userId: currentUser ? currentUser.uid : null
    };

    try {
      const savedReview = await addReview(reviewPayload);
      setReviews(prev => [savedReview, ...prev]);
      setShowForm(false);
      resetForm();
      showToast('success', '¡Éxito!', 'Reseña enviada correctamente');
    } catch (error) {
      console.error('Error al guardar reseña:', error);
      
      // Fallback local
      const localReview = {
        id: `local_${Date.now()}`,
        productId: selectedProductId,
        comment: newReviewText.trim(),
        rating,
        userId: currentUser ? currentUser.uid : null,
        username: currentUser ? currentUser.displayName || 'Usuario' : 'Anónimo',
        createdAt: new Date().toISOString(),
        verified: false
      };
      
      setReviews(prev => [localReview, ...prev]);
      setShowForm(false);
      resetForm();
      showToast('info', 'Guardado localmente', 'Reseña guardada temporalmente');
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
    return product ? product.title : 'Producto no encontrado';
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

  const dialogFooter = (
    <div className="form-actions">
      <Button 
        label={submitting ? "Enviando..." : "Enviar Reseña"}
        icon={submitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={handleAddReview}
        disabled={submitting}
        className="p-button-success"
      />
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={handleCloseForm}
        disabled={submitting}
        className="p-button-text"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="reseñas-page">
        <Toast ref={toast} />
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="pi pi-spin pi-spinner"></i>
            <h3>Cargando reseñas...</h3>
            <p>Obteniendo las opiniones de nuestros usuarios</p>
          </div>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const averageRating = getAverageRating();

  return (
    <div className="reseñas-page">
      <Toast ref={toast} />
      
      <div className="reseñas-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <i className="pi pi-star-fill"></i>
              Reseñas de Clientes
            </h1>
            <p className="hero-subtitle">
              Descubre las experiencias reales de nuestra comunidad
            </p>
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">{reviews.length}</div>
                <div className="stat-label">Reseñas Totales</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{averageRating}</div>
                <div className="stat-label">Calificación Promedio</div>
                <Rating value={parseFloat(averageRating)} readOnly cancel={false} />
              </div>
              <div className="stat-card">
                <div className="stat-number">{products.length}</div>
                <div className="stat-label">Productos Disponibles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles y Filtros */}
        <div className="controls-section">
          <div className="search-filters">
            <div className="search-box">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar en reseñas..."
                  className="search-input"
                />
              </span>
            </div>
            
            <div className="filter-controls">
              <Dropdown
                value={filterRating}
                options={ratingOptions}
                onChange={(e) => setFilterRating(e.value)}
                placeholder="Filtrar por calificación"
                className="filter-dropdown"
              />
              
              <Dropdown
                value={sortBy}
                options={sortOptions}
                onChange={(e) => setSortBy(e.value)}
                className="sort-dropdown"
              />
              
              <Button
                icon="pi pi-filter-slash"
                onClick={clearFilters}
                className="p-button-outlined clear-filters-btn"
                tooltip="Limpiar filtros"
              />
            </div>
          </div>

          <Button
            label="Escribir Reseña"
            icon="pi pi-plus"
            onClick={handleOpenForm}
            disabled={!currentUser}
            className="add-review-btn"
          />
        </div>

        {/* Tabs de contenido */}
        <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
          {/* Tab de Reseñas */}
          <TabPanel 
            header={`Todas las Reseñas (${filteredReviews.length})`}
            leftIcon="pi pi-list"
          >
            {filteredReviews.length > 0 ? (
              <div className="reviews-section">
                <div className="applied-filters">
                  {searchTerm && (
                    <Chip 
                      label={`Búsqueda: "${searchTerm}"`} 
                      removable 
                      onRemove={() => setSearchTerm('')}
                    />
                  )}
                  {filterRating && (
                    <Chip 
                      label={`${filterRating} estrellas`} 
                      removable 
                      onRemove={() => setFilterRating(null)}
                    />
                  )}
                </div>
                
                <ReviewList 
                  reviews={filteredReviews} 
                  products={products}
                  showProductInfo={true}
                  currentUserId={currentUser?.uid}
                />
              </div>
            ) : (
              <div className="no-reviews-found">
                <i className="pi pi-search"></i>
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

          {/* Tab de Estadísticas */}
          <TabPanel 
            header="Estadísticas"
            leftIcon="pi pi-chart-bar"
          >
            <div className="stats-section">
              <div className="rating-breakdown">
                <h3>Distribución de Calificaciones</h3>
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="rating-row">
                    <div className="rating-stars">
                      {star} <i className="pi pi-star-fill"></i>
                    </div>
                    <ProgressBar 
                      value={reviews.length > 0 ? (ratingDistribution[star] / reviews.length) * 100 : 0}
                      className="rating-progress"
                    />
                    <span className="rating-count">
                      {ratingDistribution[star]} reseñas
                    </span>
                  </div>
                ))}
              </div>

              <div className="insights-grid">
                <div className="insight-card">
                  <i className="pi pi-thumbs-up insight-icon"></i>
                  <h4>Satisfacción General</h4>
                  <div className="insight-value">
                    {reviews.length > 0 
                      ? `${(((ratingDistribution[4] + ratingDistribution[5]) / reviews.length) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                  <p>de usuarios satisfechos (4-5 estrellas)</p>
                </div>

                <div className="insight-card">
                  <i className="pi pi-heart insight-icon"></i>
                  <h4>Reseñas Positivas</h4>
                  <div className="insight-value">{ratingDistribution[5]}</div>
                  <p>calificaciones de 5 estrellas</p>
                </div>

                <div className="insight-card">
                  <i className="pi pi-chart-line insight-icon"></i>
                  <h4>Participación</h4>
                  <div className="insight-value">
                    {products.length > 0 
                      ? `${((reviews.length / products.length) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </div>
                  <p>de productos con reseñas</p>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Tab de Información */}
          <TabPanel 
            header="Información"
            leftIcon="pi pi-info-circle"
          >
            <div className="info-section">
              <div className="info-grid">
                <div className="info-card">
                  <i className="pi pi-shield info-icon"></i>
                  <h4>Reseñas Verificadas</h4>
                  <p>Todas nuestras reseñas pasan por un proceso de moderación para garantizar su autenticidad y calidad.</p>
                </div>

                <div className="info-card">
                  <i className="pi pi-users info-icon"></i>
                  <h4>Comunidad Real</h4>
                  <p>Solo usuarios registrados pueden escribir reseñas, asegurando opiniones genuinas de compradores reales.</p>
                </div>

                <div className="info-card">
                  <i className="pi pi-heart info-icon"></i>
                  <h4>Ayuda a Otros</h4>
                  <p>Tu opinión es valiosa. Ayuda a otros usuarios a tomar decisiones informadas compartiendo tu experiencia.</p>
                </div>

                <div className="info-card">
                  <i className="pi pi-comment info-icon"></i>
                  <h4>Feedback Constructivo</h4>
                  <p>Escribe reseñas honestas y detalladas que destaquen tanto aspectos positivos como áreas de mejora.</p>
                </div>
              </div>

              <div className="guidelines">
                <h4>Guías para Escribir Reseñas</h4>
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

      {/* Modal para nueva reseña */}
      <Dialog
        header={
          <div className="modal-header">
            <i className="pi pi-star-fill"></i>
            <span>Escribir Nueva Reseña</span>
          </div>
        }
        visible={showForm}
        style={{ width: '90vw', maxWidth: '600px' }}
        footer={dialogFooter}
        onHide={handleCloseForm}
        className="review-dialog"
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