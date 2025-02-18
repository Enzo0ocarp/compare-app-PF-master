// src/components/ProductCard.js
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  // Si product es undefined, usamos un objeto vacío para evitar errores.
  const { product_name, brands, image_front_small_url, categories } = product || {};
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const openDetails = () => {
    setShowDialog(true);
  };

  const closeDetails = () => {
    setShowDialog(false);
  };

  const handleAddReview = () => {
    // Navega a la página de reseñas con el ID del producto como query param.
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
        title={product_name || "Producto sin nombre"}
        subTitle={brands || "Sin marca"}
        header={
          <img
            alt={product_name || "Producto sin nombre"}
            src={image_front_small_url || '/default-product.jpg'}
            className="product-image"
          />
        }
        className="product-card"
      >
        <p className="product-categories">{categories || "Sin categorías"}</p>
        <div className="product-card-footer">
          <Button label="Ver Detalles" icon="pi pi-info-circle" onClick={openDetails} className="product-btn-details" />
          <Button label="Agregar Reseña" icon="pi pi-pencil" onClick={handleAddReview} className="product-btn-review" />
        </div>
      </Card>

      <Dialog header={product_name || "Detalles del Producto"} visible={showDialog} style={{ width: '400px' }} footer={dialogFooter} onHide={closeDetails} className="product-dialog">
        <div className="dialog-content">
          <img
            alt={product_name || "Producto sin nombre"}
            src={image_front_small_url || '/default-product.jpg'}
            className="dialog-image"
          />
          <h4>{product_name || "Producto sin nombre"}</h4>
          <p><strong>Marca:</strong> {brands || "Sin marca"}</p>
          <p><strong>Categorías:</strong> {categories || "Sin categorías"}</p>
          {/* Aquí puedes agregar más campos si la API lo proporciona */}
        </div>
      </Dialog>
    </>
  );
};

export default ProductCard;
