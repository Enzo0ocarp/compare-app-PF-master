// src/components/ProductComparison.jsx - COMPONENTE DE COMPARACIÓN DE PRODUCTOS
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, X, Award, TrendingUp, TrendingDown, 
  Minus, AlertTriangle, CheckCircle, Info
} from 'lucide-react';

const ProductComparison = ({ 
  selectedProducts = [], 
  products = [], 
  onClose, 
  onRemoveProduct 
}) => {
  const [comparisonData, setComparisonData] = useState([]);
  const [focusMetric, setFocusMetric] = useState('calories');

  useEffect(() => {
    if (selectedProducts.length > 0) {
      const data = selectedProducts.map(productId => {
        const product = products.find(p => p.id === productId);
        return product;
      }).filter(Boolean);
      
      setComparisonData(data);
    }
  }, [selectedProducts, products]);

  // Métricas nutricionales para comparar
  const nutritionalMetrics = [
    { 
      key: 'calories', 
      label: 'Calorías', 
      unit: 'kcal', 
      type: 'neutral',
      description: 'Energía por 100g'
    },
    { 
      key: 'proteins', 
      label: 'Proteínas', 
      unit: 'g', 
      type: 'positive',
      description: 'Proteínas por 100g'
    },
    { 
      key: 'carbs', 
      label: 'Carbohidratos', 
      unit: 'g', 
      type: 'neutral',
      description: 'Carbohidratos por 100g'
    },
    { 
      key: 'fats', 
      label: 'Grasas', 
      unit: 'g', 
      type: 'neutral',
      description: 'Grasas totales por 100g'
    },
    { 
      key: 'fiber', 
      label: 'Fibra', 
      unit: 'g', 
      type: 'positive',
      description: 'Fibra dietética por 100g'
    },
    { 
      key: 'sodium', 
      label: 'Sodio', 
      unit: 'mg', 
      type: 'negative',
      description: 'Sodio por 100g'
    },
    { 
      key: 'sugar', 
      label: 'Azúcares', 
      unit: 'g', 
      type: 'negative',
      description: 'Azúcares por 100g'
    },
    { 
      key: 'saturatedFats', 
      label: 'Grasas Saturadas', 
      unit: 'g', 
      type: 'negative',
      description: 'Grasas saturadas por 100g'
    }
  ];

  // Función para obtener el mejor y peor producto en una métrica
  const getMetricComparison = (metric) => {
    if (!comparisonData.length || !comparisonData[0]?.nutritionalData) return null;

    const values = comparisonData
      .filter(p => p.nutritionalData)
      .map(product => ({
        product,
        value: product.nutritionalData[metric.key] || 0
      }));

    if (values.length === 0) return null;

    let best, worst;
    
    if (metric.type === 'positive') {
      // Para métricas positivas (proteínas, fibra), más es mejor
      best = values.reduce((a, b) => a.value > b.value ? a : b);
      worst = values.reduce((a, b) => a.value < b.value ? a : b);
    } else if (metric.type === 'negative') {
      // Para métricas negativas (sodio, azúcar), menos es mejor
      best = values.reduce((a, b) => a.value < b.value ? a : b);
      worst = values.reduce((a, b) => a.value > b.value ? a : b);
    } else {
      // Para métricas neutrales, solo mostramos los valores
      return { values };
    }

    return { best, worst, values };
  };

  // Función para obtener el color de la barra según el tipo de métrica
  const getBarColor = (value, metric, comparison) => {
    if (!comparison || metric.type === 'neutral') {
      return 'bg-blue-500';
    }

    const { best, worst } = comparison;
    
    if (metric.type === 'positive') {
      if (value === best.value) return 'bg-green-500';
      if (value === worst.value) return 'bg-red-500';
      return 'bg-yellow-500';
    } else {
      if (value === best.value) return 'bg-green-500';
      if (value === worst.value) return 'bg-red-500';
      return 'bg-yellow-500';
    }
  };

  // Función para obtener el score general de un producto
  const getOverallScore = (product) => {
    if (!product.nutritionalData) return 0;
    return product.nutritionalData.score || 0;
  };

  if (comparisonData.length === 0) {
    return (
      <div className="nutri-comparison-empty">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No hay productos para comparar
        </h3>
        <p className="text-gray-500 text-center">
          Selecciona al menos 2 productos para empezar a comparar
        </p>
      </div>
    );
  }

  return (
    <div className="nutri-comparison-container">
      {/* Header */}
      <div className="nutri-comparison-header">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">
            Comparación Nutricional
          </h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {comparisonData.length} productos
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="nutri-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Resumen de scores */}
      <div className="nutri-scores-summary">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Score Nutricional General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonData.map((product, index) => {
            const score = getOverallScore(product);
            const scoreColor = score >= 8 ? 'text-green-600' : score >= 6 ? 'text-yellow-600' : 'text-red-600';
            const bgColor = score >= 8 ? 'bg-green-50 border-green-200' : score >= 6 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
            
            return (
              <div key={product.id} className={`nutri-score-card ${bgColor}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                    {product.nombre}
                  </h4>
                  {onRemoveProduct && (
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-3">{product.marca}</p>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${scoreColor}`}>
                    {score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">/ 10</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selector de métrica a destacar */}
      <div className="nutri-metric-selector">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destacar métrica:
        </label>
        <select
          value={focusMetric}
          onChange={(e) => setFocusMetric(e.target.value)}
          className="nutri-select"
        >
          {nutritionalMetrics.map(metric => (
            <option key={metric.key} value={metric.key}>
              {metric.label} ({metric.unit})
            </option>
          ))}
        </select>
      </div>

      {/* Comparación detallada */}
      <div className="nutri-detailed-comparison">
        <h3 className="text-lg font-semibold mb-4">Comparación Detallada</h3>
        
        {nutritionalMetrics.map(metric => {
          const comparison = getMetricComparison(metric);
          if (!comparison) return null;

          const maxValue = Math.max(...comparison.values.map(v => v.value));
          const isFocusMetric = metric.key === focusMetric;

          return (
            <div 
              key={metric.key} 
              className={`nutri-metric-comparison ${isFocusMetric ? 'nutri-metric-focused' : ''}`}
            >
              <div className="nutri-metric-header">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{metric.label}</h4>
                  <span className="text-sm text-gray-500">({metric.unit})</span>
                  {metric.type === 'positive' && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {metric.type === 'negative' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  {metric.type === 'neutral' && <Minus className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="nutri-metric-description">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{metric.description}</span>
                </div>
              </div>

              <div className="nutri-metric-bars">
                {comparison.values.map(({ product, value }) => (
                  <div key={product.id} className="nutri-metric-bar-container">
                    <div className="nutri-metric-bar-label">
                      <span className="font-medium text-sm">{product.marca}</span>
                      <span className="text-xs text-gray-500">{product.nombre.substring(0, 30)}...</span>
                    </div>
                    <div className="nutri-metric-bar-wrapper">
                      <div className="nutri-metric-bar-bg">
                        <div 
                          className={`nutri-metric-bar ${getBarColor(value, metric, comparison)}`}
                          style={{
                            width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="nutri-metric-value">
                        {value} {metric.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insights de la métrica */}
              {comparison.best && comparison.worst && comparison.best.value !== comparison.worst.value && (
                <div className="nutri-metric-insights">
                  {metric.type === 'positive' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700">
                        <strong>{comparison.best.product.marca}</strong> tiene {(comparison.best.value - comparison.worst.value).toFixed(1)}{metric.unit} más de {metric.label.toLowerCase()}
                      </span>
                    </div>
                  ) : metric.type === 'negative' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-700">
                        <strong>{comparison.best.product.marca}</strong> tiene {(comparison.worst.value - comparison.best.value).toFixed(1)}{metric.unit} menos de {metric.label.toLowerCase()}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="nutri-additional-info">
        <h3 className="text-lg font-semibold mb-3">Información Adicional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonData.map(product => (
            <div key={product.id} className="nutri-info-card">
              <h4 className="font-semibold mb-2">{product.marca}</h4>
              <div className="space-y-2">
                {product.nutritionalData && (
                  <>
                    {/* Alergenos */}
                    {product.nutritionalData.allergens && product.nutritionalData.allergens.length > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs">
                          Contiene: {product.nutritionalData.allergens.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {/* Características especiales */}
                    <div className="flex flex-wrap gap-1">
                      {product.nutritionalData.isVegan && (
                        <span className="nutri-tag nutri-tag-green">Vegano</span>
                      )}
                      {product.nutritionalData.isVegetarian && (
                        <span className="nutri-tag nutri-tag-green">Vegetariano</span>
                      )}
                      {product.nutritionalData.isGlutenFree && (
                        <span className="nutri-tag nutri-tag-blue">Sin Gluten</span>
                      )}
                      {product.nutritionalData.isOrganic && (
                        <span className="nutri-tag nutri-tag-purple">Orgánico</span>
                      )}
                    </div>
                    
                    {/* Nivel de confianza */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Confianza:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(product.nutritionalData.confidence || 0) * 100}%` }}
                        />
                      </div>
                      <span>{Math.round((product.nutritionalData.confidence || 0) * 100)}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;