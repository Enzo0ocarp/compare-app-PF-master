// src/pages/Nutricional.js
import React from 'react';
import Header from '../components/Header';
import CategoryCard from '../components/CategoryCard';
import AlertList from '../components/AlertList';
import BottomNav from '../components/BottomNav';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Badge } from 'primereact/badge';
import '../styles/NutricionalStyles.css';

function Nutricional() {
    const categories = [
        { name: 'Alimentos Balanceados', icon: 'pi pi-apple', updated: 'Nuevo' },
        { name: 'Ricos en Proteínas', icon: 'pi pi-bolt', updated: 'Actualizado' },
        { name: 'Vitaminas y Minerales', icon: 'pi pi-sun', updated: 'Recomendado' },
        { name: 'Bajos en Calorías', icon: 'pi pi-thumbs-up', updated: 'Populares' },
    ];

    const alerts = [
        'Nuevos alimentos ricos en proteínas disponibles',
        'Alerta de productos balanceados a menor precio',
        'Revisión de suplementos vitamínicos y minerales',
        'Descubre productos bajos en calorías con descuento',
    ];

    return (
        <div className="nutricional-page">
            <Header />

            {/* Categorías de Productos Nutricionales */}
            <section className="section categories-section">
                <div className="section-header">
                    <h2 className="section-title">
                        Categorías Nutricionales 
                        <Badge value="Nuevo" severity="success" className="ml-2" />
                    </h2>
                    <Divider />
                </div>
                <div className="categories-grid">
                    {categories.map((category, index) => (
                        <React.Fragment key={index}>
                            <Tooltip target={`#category-${index}`} content={`Explora ${category.name}`} position="top" />
                            <CategoryCard
                                id={`category-${index}`}
                                name={category.name}
                                icon={category.icon}
                                updated={category.updated}
                                className="category-card"
                            />
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* Alertas Nutricionales */}
            <section className="section alerts-section">
                <h2 className="section-title">Alertas Nutricionales</h2>
                <Divider />
                <Card className="alerts-card">
                    <AlertList alerts={alerts} />
                    <Button
                        label="Ver Todo"
                        icon="pi pi-external-link"
                        className="p-button-outlined p-button-success view-more-btn animated-button"
                        onClick={() => alert('Más alertas próximamente')}
                    />
                </Card>
            </section>

            <BottomNav />
        </div>
    );
}

export default Nutricional;
