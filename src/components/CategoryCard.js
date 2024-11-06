import React from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';

const CategoryCard = ({ name, icon, updated }) => {
    return (
        <Card className="category-card">
            <i className={`${icon} category-icon`}></i>
            <h4>{name}</h4>
            <Badge value={updated} severity="info" />
        </Card>
    );
};

export default CategoryCard;
