// src/components/ProductCard.js
import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  // Si product es undefined, asignamos un objeto vacío para evitar errores.
  const { product_name, brands, image_front_small_url, categories } = product || {};

  return (
    <Card
      title={product_name || "Producto sin nombre"}
      subTitle={brands || "Sin marca"}
      header={
        <img
          alt={product_name || "Producto sin nombre"}
          src={image_front_small_url || '/default-product.jpg'}
          style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
        />
      }
      className="product-card"
    >
      <p>{categories || "Sin categorías"}</p>
      <Button label="Ver detalles" className="p-button-text" onClick={() => console.log('Ver detalles')} />
    </Card>
  );
};

export default ProductCard;
