import React from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';

const ProductCard = ({ name, image, trend }) => {
    return (
        <Card className="product-card">
            <img src={image} alt={name} className="product-image" />
            <h4>{name}</h4>
            <Badge value={trend} severity="success" />
        </Card>
    );
};

export default ProductCard;
