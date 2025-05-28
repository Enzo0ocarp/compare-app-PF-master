// src/components/BranchCard.js
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import '../styles/BranchCard.css';

function BranchCard({ branch }) {
  const handleViewLocation = () => {
    if (branch.lat && branch.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${branch.lat},${branch.lng}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleGetDirections = () => {
    if (branch.lat && branch.lng) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`;
      window.open(directionsUrl, '_blank');
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Dirección no disponible';
    // Limpiar y formatear la dirección
    return address.replace(/^Cl\s+/, '').replace(/\s+/g, ' ').trim();
  };

  const getBadgeColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'supermercado':
        return 'success';
      case 'autoservicio':
        return 'info';
      case 'hipermercado':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const header = (
    <div className="branch-header">
      <div className="branch-logo">
        <i className="pi pi-building" style={{ fontSize: '2rem', color: '#4CAF50' }}></i>
      </div>
      <div className="branch-badges">
        {branch.sucursalTipo && (
          <Badge 
            value={branch.sucursalTipo} 
            severity={getBadgeColor(branch.sucursalTipo)}
            className="type-badge"
          />
        )}
      </div>
    </div>
  );

  const footer = (
    <div className="branch-actions">
      <Button
        label="Ver en Mapa"
        icon="pi pi-map-marker"
        className="p-button-sm p-button-outlined"
        onClick={handleViewLocation}
        disabled={!branch.lat || !branch.lng}
        tooltip="Ver ubicación en Google Maps"
      />
      <Button
        label="Cómo llegar"
        icon="pi pi-directions"
        className="p-button-sm p-button-success"
        onClick={handleGetDirections}
        disabled={!branch.lat || !branch.lng}
        tooltip="Obtener direcciones"
      />
    </div>
  );

  return (
    <Card 
      className="branch-card"
      header={header}
      footer={footer}
    >
      <div className="branch-content">
        <h4 className="branch-name">
          {branch.sucursalNombre || 'Sucursal sin nombre'}
        </h4>
        
        <div className="branch-details">
          <div className="detail-item">
            <i className="pi pi-building detail-icon"></i>
            <span className="detail-text">
              {branch.banderaDescripcion || 'Comercio'}
            </span>
          </div>
          
          <div className="detail-item">
            <i className="pi pi-map-marker detail-icon"></i>
            <span className="detail-text">
              {formatAddress(branch.direccion)}
            </span>
          </div>
          
          {branch.localidad && (
            <div className="detail-item">
              <i className="pi pi-globe detail-icon"></i>
              <span className="detail-text">
                {branch.localidad}
                {branch.provincia && ` - ${branch.provincia}`}
              </span>
            </div>
          )}
          
          {branch.comercioRazonSocial && (
            <div className="detail-item">
              <i className="pi pi-briefcase detail-icon"></i>
              <span className="detail-text small">
                {branch.comercioRazonSocial}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default BranchCard;