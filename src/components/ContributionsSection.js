// src/components/ContributionsSection.js
import React, { useState, useEffect } from 'react';

const ContributionsSection = ({ userId, userRole }) => {
  const [contributions, setContributions] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadContributions();
  }, [userId]);

  const loadContributions = async () => {
    // Simular carga de contribuciones
    const mockContributions = [
      {
        id: 1,
        productName: 'Avena Quaker',
        status: 'approved',
        submissionDate: new Date('2025-01-05'),
        type: 'nutritional_data'
      },
      {
        id: 2,
        productName: 'Leche Sancor',
        status: 'pending',
        submissionDate: new Date('2025-01-12'),
        type: 'new_product'
      }
    ];
    setContributions(mockContributions);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'pending', icon: 'fas fa-clock' },
      approved: { label: 'Aprobada', class: 'approved', icon: 'fas fa-check' },
      rejected: { label: 'Rechazada', class: 'rejected', icon: 'fas fa-times' }
    };
    const config = statusConfig[status];
    return (
      <span className={`status-badge ${config.class}`}>
        <i className={config.icon}></i>
        {config.label}
      </span>
    );
  };

  return (
    <div className="contributions-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-plus-circle"></i>
          Mis Contribuciones
        </h2>
        <p>Ayuda a mejorar la base de datos agregando información</p>
      </div>

      <div className="contribution-actions">
        <button 
          className="add-contribution-btn"
          onClick={() => setShowForm(true)}
        >
          <i className="fas fa-plus"></i>
          Nueva Contribución
        </button>
      </div>

      <div className="contributions-list">
        {contributions.map(contribution => (
          <div key={contribution.id} className="contribution-item">
            <div className="contribution-info">
              <h4>{contribution.productName}</h4>
              <span className="submission-date">
                {contribution.submissionDate.toLocaleDateString()}
              </span>
            </div>
            <div className="contribution-status">
              {getStatusBadge(contribution.status)}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="contribution-form-modal">
          <div className="form-content">
            <h3>Nueva Contribución</h3>
            <form>
              <input type="text" placeholder="Nombre del producto" />
              <input type="text" placeholder="Marca" />
              <textarea placeholder="Información nutricional"></textarea>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionsSection;