// src/components/ProductCard.js
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  // Se desestructuran las propiedades de Fake Store API
  const { title, category, image, price, description } = product || {};
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const openDetails = () => {
    setShowDialog(true);
  };

  const closeDetails = () => {
    setShowDialog(false);
  };

  const handleAddReview = () => {
    // Navega a la página de reseñas con el ID del producto como query param
    navigate(`/reseñas?productId=${product.id}`);
  };

  const dialogFooter = (
    <div className="dialog-footer">
      <Button label="Agregar Reseña" icon="pi pi-pencil" onClick={handleAddReview} className="product-btn-review" />
      <Button label="Cerrar" icon="pi pi-times" onClick={closeDetails} className="p-button-secondary" />
    </div>
  );

  return (
    <>
      <Card
        title={title || "Producto sin nombre"}
        subTitle={category || "Sin categoría"}
        header={
          <img
            alt={title || "Producto sin nombre"}
            src={image || '/default-product.jpg'}
            className="product-image"
          />
        }
        className="product-card"
      >
        <p className="product-price">${price}</p>
        <div className="product-card-footer">
          <Button label="Ver Detalles" icon="pi pi-info-circle" onClick={openDetails} className="product-btn-details" />
          <Button label="Agregar Reseña" icon="pi pi-pencil" onClick={handleAddReview} className="product-btn-review" />
        </div>
      </Card>

      <Dialog header={title || "Detalles del Producto"} visible={showDialog} style={{ width: '400px' }} footer={dialogFooter} onHide={closeDetails} className="product-dialog">
        <div className="dialog-content">
          <img
            alt={title || "Producto sin nombre"}
            src={image || '/default-product.jpg'}
            className="dialog-image"
          />
          <h4>{title || "Producto sin nombre"}</h4>
          <p><strong>Categoría:</strong> {category || "Sin categoría"}</p>
          <p><strong>Precio:</strong> ${price}</p>
          <p><strong>Descripción:</strong> {description || "Sin descripción"}</p>
        </div>
      </Dialog>
    </>
  );
};

export default ProductCard;
