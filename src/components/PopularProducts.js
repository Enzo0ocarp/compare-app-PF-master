import '../styles/carrusel.css'
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ProductCard from './ProductCard';

const PopularProducts = ({ popularProducts }) => {
    // Configuraciones del carrusel
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 2, // Muestra 4 productos a la vez (ajusta según tu diseño)
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <section className="section popular-products">
            <div className="section-header">
                <h3>Productos Populares</h3>
                <button className="view-all-btn">Ver Todo</button>
            </div>
            {/* Aquí envuelves el contenido en el componente Slider */}
            <Slider {...settings} className="products-carousel">
                {popularProducts.map((product, index) => (
                    <ProductCard
                        key={index}
                        name={product.name}
                        image={product.image}
                        trend={product.trend}
                    />
                ))}
            </Slider>
        </section>
    );
};

export default PopularProducts;