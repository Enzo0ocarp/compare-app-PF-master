// src/components/LazyImage.jsx
import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, placeholder, className, style }) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '/placeholder.png');
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    let observer;
    
    if (imgRef.current) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.01,
          rootMargin: '200px'
        }
      );
      
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${imageLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        opacity: imageLoaded ? 1 : 0.6,
        transition: 'opacity 0.3s ease'
      }}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

export default LazyImage;