import React from 'react';
import Header from '../components/Header';
import PopularProducts from '../components/PopularProducts';
import CategoryCard from '../components/CategoryCard';
import AlertList from '../components/AlertList';
import BottomNav from '../components/BottomNav';
import '../styles/HomeStyles.css';

function Home() {
    const popularProducts = [
        { name: 'Quesos Artesanales', image: 'https://thefoodtech.com/wp-content/uploads/2020/12/aumenta-demanda-de-queso-artesanal.jpg', trend: 'Tendencia' },
        { name: 'Panificados Artesanales', image: 'https://estaticos-cdn.prensaiberica.es/clip/81ce7545-a02a-4372-a86e-3452a793e694_16-9-discover-aspect-ratio_default_0.jpg', trend: 'Tendencia' }
    ];

    const categories = [
        { name: 'Ofertas', icon: 'pi pi-tag', updated: 'Renovado' },
        { name: 'Saludables', icon: 'pi pi-heart', updated: 'Renovado' },
        { name: 'Vegetarianos', icon: 'pi pi-apple', updated: 'Renovado' },
        { name: 'Actualizaciones', icon: 'pi pi-refresh', updated: 'Renovado' }
    ];

    const alerts = [
        'Oferta en carnes en Coto - $6500 el kg de asado',
        'Oferta panificados en La Anónima - 25% en toda la compra'
    ];

    return (
        <div className="home-container">
            <Header />

            {/* Productos Populares */}
                <PopularProducts  popularProducts={popularProducts}/>

            {/* Categorías */}
            <section className="section categories-section">
                <div className="section-header">
                    <h3>Categorías</h3>
                    <button className="view-all-btn">Ver Todo</button>
                </div>
                <div className="categories-grid">
                    {categories.map((category, index) => (
                        <CategoryCard key={index} name={category.name} icon={category.icon} updated={category.updated} />
                    ))}
                </div>
            </section>

            {/* Alertas del Día */}
            <section className="section alerts-section">
                <div className="section-header">
                    <h3>Alertas del Día</h3>
                </div>
                <AlertList alerts={alerts} />
            </section>

                {/* Barra de Navegación */}
                <BottomNav />
        
        </div>
    );
}

export default Home;
