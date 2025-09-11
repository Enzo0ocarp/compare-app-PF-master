// src/components/ProfileTabs.js
import React from 'react';

const ProfileTabs = ({ activeTab, onTabChange, isAdmin }) => {
  const tabs = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: 'fas fa-user',
      description: 'Información personal'
    },
    {
      id: 'stats',
      label: 'Estadísticas',
      icon: 'fas fa-chart-bar',
      description: 'Mi actividad'
    },
    {
      id: 'products',
      label: 'Mis Productos',
      icon: 'fas fa-shopping-basket',
      description: 'Productos guardados'
    },
    {
      id: 'contributions',
      label: 'Contribuciones',
      icon: 'fas fa-plus-circle',
      description: 'Mis aportes'
    }
  ];

  // Agregar tab de admin si es necesario
  if (isAdmin) {
    tabs.push({
      id: 'admin',
      label: 'Administración',
      icon: 'fas fa-shield-alt',
      description: 'Panel de admin'
    });
  }

  return (
    <div className="profile-tabs">
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <div className="tab-content">
              <i className={tab.icon}></i>
              <div className="tab-text">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
              </div>
            </div>
            <div className="tab-indicator"></div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .profile-tabs {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          margin: 2rem auto;
          max-width: 1200px;
          overflow: hidden;
        }

        .tabs-container {
          display: flex;
          flex-wrap: wrap;
        }

        .tab-button {
          flex: 1;
          min-width: 200px;
          background: white;
          border: none;
          padding: 1.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          border-bottom: 3px solid transparent;
        }

        .tab-button:hover {
          background: #f8faff;
        }

        .tab-button.active {
          background: #f0f7ff;
          border-bottom-color: #667eea;
        }

        .tab-button.active .tab-indicator {
          transform: scaleX(1);
        }

        .tab-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: center;
        }

        .tab-content i {
          font-size: 1.5rem;
          color: #6b7280;
          transition: color 0.3s ease;
        }

        .tab-button.active .tab-content i {
          color: #667eea;
        }

        .tab-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .tab-label {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          transition: color 0.3s ease;
        }

        .tab-button.active .tab-label {
          color: #667eea;
        }

        .tab-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #667eea;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        @media (max-width: 768px) {
          .tabs-container {
            flex-direction: column;
          }

          .tab-button {
            min-width: auto;
            border-bottom: 1px solid #e5e7eb;
            border-right: none;
          }

          .tab-button:last-child {
            border-bottom: none;
          }

          .tab-button.active {
            border-bottom-color: #e5e7eb;
            border-left: 3px solid #667eea;
          }

          .tab-indicator {
            top: 0;
            bottom: auto;
            left: 0;
            right: auto;
            width: 3px;
            height: 100%;
            transform: scaleY(0);
          }

          .tab-button.active .tab-indicator {
            transform: scaleY(1);
          }
        }

        @media (max-width: 480px) {
          .tab-content {
            flex-direction: column;
            gap: 0.5rem;
          }

          .tab-text {
            align-items: center;
            text-align: center;
          }

          .tab-description {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileTabs;