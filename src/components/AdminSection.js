// src/components/AdminSection.js
import React, { useState } from 'react';

const AdminSection = () => {
  const [pendingReviews, setPendingReviews] = useState(3);
  const [userCount, setUserCount] = useState(1247);
  const [productCount, setProductCount] = useState(8932);

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-shield-alt"></i>
          Panel de Administración
        </h2>
        <p>Herramientas de administración y moderación</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <i className="fas fa-users"></i>
          <div>
            <span className="stat-number">{userCount.toLocaleString()}</span>
            <span className="stat-label">Usuarios activos</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <i className="fas fa-box"></i>
          <div>
            <span className="stat-number">{productCount.toLocaleString()}</span>
            <span className="stat-label">Productos en base</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <i className="fas fa-clock"></i>
          <div>
            <span className="stat-number">{pendingReviews}</span>
            <span className="stat-label">Revisiones pendientes</span>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <div className="admin-card">
          <h4>Gestión de Usuarios</h4>
          <p>Administrar usuarios y permisos</p>
          <button className="admin-btn">
            <i className="fas fa-users-cog"></i>
            Gestionar Usuarios
          </button>
        </div>

        <div className="admin-card">
          <h4>Revisión de Contenido</h4>
          <p>Revisar contribuciones pendientes</p>
          <button className="admin-btn">
            <i className="fas fa-check-double"></i>
            Revisar Contenido
          </button>
        </div>

        <div className="admin-card">
          <h4>Estadísticas del Sistema</h4>
          <p>Ver métricas y analytics</p>
          <button className="admin-btn">
            <i className="fas fa-chart-line"></i>
            Ver Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;