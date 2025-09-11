// src/components/UserStatsSection.js
import React from 'react';

const UserStatsSection = ({ user, stats }) => {
  // Datos de estadísticas predeterminados
  const defaultStats = {
    searchesCount: 0,
    favoritesCount: 0,
    contributionsCount: 0,
    reviewsCount: 0,
    estimatedSavings: 0,
    ...stats
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Reciente';
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long'
    }).format(new Date(date));
  };

  const statsData = [
    {
      id: 'searches',
      label: 'Búsquedas realizadas',
      value: defaultStats.searchesCount,
      icon: 'fas fa-search',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
    },
    {
      id: 'favorites',
      label: 'Productos favoritos',
      value: defaultStats.favoritesCount,
      icon: 'fas fa-heart',
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
    },
    {
      id: 'contributions',
      label: 'Contribuciones aprobadas',
      value: defaultStats.contributionsCount,
      icon: 'fas fa-plus-circle',
      color: '#43e97b',
      gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)'
    },
    {
      id: 'reviews',
      label: 'Reseñas escritas',
      value: defaultStats.reviewsCount,
      icon: 'fas fa-star',
      color: '#ffc107',
      gradient: 'linear-gradient(135deg, #ffc107, #ff8f00)'
    }
  ];

  const achievementLevel = () => {
    const totalActivity = defaultStats.searchesCount + 
                         defaultStats.favoritesCount + 
                         defaultStats.contributionsCount + 
                         defaultStats.reviewsCount;
    
    if (totalActivity < 10) return { level: 'Principiante', icon: 'fas fa-seedling', color: '#10b981' };
    if (totalActivity < 50) return { level: 'Explorador', icon: 'fas fa-compass', color: '#3b82f6' };
    if (totalActivity < 100) return { level: 'Experto', icon: 'fas fa-medal', color: '#f59e0b' };
    return { level: 'Maestro', icon: 'fas fa-crown', color: '#8b5cf6' };
  };

  const achievement = achievementLevel();

  return (
    <div className="user-stats-section">
      <div className="section-header">
        <h2>
          <i className="fas fa-chart-bar"></i>
          Mi Actividad en Compare & Nourish
        </h2>
        <p>Resumen de tu participación y logros en la plataforma</p>
      </div>

      {/* Nivel de logro */}
      <div className="achievement-card">
        <div className="achievement-content">
          <div 
            className="achievement-icon"
            style={{ background: achievement.color }}
          >
            <i className={achievement.icon}></i>
          </div>
          <div className="achievement-info">
            <h3>Nivel: {achievement.level}</h3>
            <p>¡Sigue participando para alcanzar el siguiente nivel!</p>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        {statsData.map(stat => (
          <div key={stat.id} className="stat-card">
            <div 
              className="stat-icon"
              style={{ background: stat.gradient }}
            >
              <i className={stat.icon}></i>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stat.value.toLocaleString()}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="additional-info">
        <div className="info-card">
          <div className="info-header">
            <i className="fas fa-piggy-bank"></i>
            <h3>Ahorro Estimado</h3>
          </div>
          <div className="info-content">
            <span className="savings-amount">
              {formatCurrency(defaultStats.estimatedSavings)}
            </span>
            <p>Dinero ahorrado usando Compare & Nourish</p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-header">
            <i className="fas fa-calendar"></i>
            <h3>Miembro desde</h3>
          </div>
          <div className="info-content">
            <span className="member-since">
              {formatDate(user.memberSince)}
            </span>
            <p>Tiempo siendo parte de nuestra comunidad</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .user-stats-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-size: 2rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .section-header h2 i {
          color: #667eea;
        }

        .section-header p {
          color: #6b7280;
          font-size: 1.125rem;
          margin: 0;
        }

        .achievement-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }

        .achievement-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .achievement-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .achievement-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .achievement-info p {
          color: #6b7280;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #374151;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .additional-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .info-header i {
          color: #667eea;
          font-size: 1.25rem;
        }

        .info-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
          margin: 0;
        }

        .info-content {
          text-align: center;
        }

        .savings-amount,
        .member-since {
          display: block;
          font-size: 1.75rem;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 0.5rem;
        }

        .info-content p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .user-stats-section {
            padding: 1rem;
          }

          .section-header h2 {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 0.5rem;
          }

          .achievement-content {
            flex-direction: column;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
          }

          .additional-info {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .achievement-card,
          .stat-card,
          .info-card {
            padding: 1.5rem;
          }

          .achievement-icon,
          .stat-icon {
            width: 3rem;
            height: 3rem;
            font-size: 1.25rem;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .savings-amount,
          .member-since {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserStatsSection;