import React, { useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import '../styles/ProductosStyles.css';

function Productos() {
    const products = [
        { name: 'Frutas Frescas', image: 'https://via.placeholder.com/150', trend: 'Novedad', price: '$5.00', category: 'Frutas', description: 'Frutas frescas y orgánicas directamente de la granja.' },
        { name: 'Verduras Orgánicas', image: 'https://via.placeholder.com/150', trend: 'Popular', price: '$3.50', category: 'Verduras', description: 'Verduras de calidad y libres de pesticidas.' },
        { name: 'Cereales Naturales', image: 'https://via.placeholder.com/150', trend: 'Novedad', price: '$7.00', category: 'Cereales', description: 'Cereales saludables y ricos en fibra.' }
    ];

    const categories = [
        { label: 'Todos', value: null },
        { label: 'Frutas', value: 'Frutas' },
        { label: 'Verduras', value: 'Verduras' },
        { label: 'Cereales', value: 'Cereales' }
    ];

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const openProductDialog = (product) => {
        setSelectedProduct(product);
        setVisible(true);
    };

    const filteredProducts = selectedCategory ? products.filter(p => p.category === selectedCategory) : products;

    const footerContent = (
        <div>
            <Button label="Cerrar" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
            <Button label="Agregar al Carrito" icon="pi pi-shopping-cart" onClick={() => console.log('Añadido al carrito')} autoFocus />
        </div>
    );

    return (
        <div className="productos-page">
            <Header />

            <section className="products-section">
                <div className="section-header">
                    <h3>Catálogo de Productos</h3>
                    <Dropdown
                        value={selectedCategory}
                        options={categories}
                        onChange={(e) => setSelectedCategory(e.value)}
                        placeholder="Filtrar por categoría"
                        className="category-dropdown"
                    />
                </div>

                <div className="products-grid">
                    {filteredProducts.map((product, index) => (
                        <Card
                            key={index}
                            className="product-card"
                            title={product.name}
                            subTitle={<Tag value={product.trend} severity="info" />}
                            header={<img alt={product.name} src={product.image} className="product-image" />}
                            footer={
                                <div className="product-footer">
                                    <Button
                                        icon="pi pi-eye"
                                        label="Detalles"
                                        onClick={() => openProductDialog(product)}
                                        className="p-button-rounded p-button-outlined p-button-info view-details-btn"
                                    />
                                    <Button
                                        icon="pi pi-shopping-cart"
                                        label="Agregar"
                                        onClick={() => console.log('Añadido al carrito')}
                                        className="p-button-rounded p-button-success p-button-outlined"
                                    />
                                </div>
                            }
                        >
                            <Tooltip target=".product-card" content={product.description} position="top" />
                            <p className="product-price">{product.price}</p>
                        </Card>
                    ))}
                </div>
            </section>

            <Dialog
                header={selectedProduct ? selectedProduct.name : ''}
                visible={visible}
                style={{ width: '400px' }}
                footer={footerContent}
                onHide={() => setVisible(false)}
                className="product-dialog"
            >
                {selectedProduct && (
                    <div>
                        <img alt={selectedProduct.name} src={selectedProduct.image} className="dialog-image" />
                        <p><strong>Precio:</strong> {selectedProduct.price}</p>
                        <p><strong>Categoría:</strong> {selectedProduct.category}</p>
                        <p>{selectedProduct.description}</p>
                    </div>
                )}
            </Dialog>

            <BottomNav />
        </div>
    );
}

export default Productos;
