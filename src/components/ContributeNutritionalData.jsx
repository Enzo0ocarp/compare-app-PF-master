// src/components/ContributeNutritionalData.jsx
import React, { useState } from 'react';
import { Plus, X, Upload, AlertCircle } from 'lucide-react';
import { addNutritionalContribution } from '../functions/services/nutritionalContributionService';

const ContributeNutritionalData = ({ product, currentUser, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    calories: '',
    proteins: '',
    carbs: '',
    fats: '',
    fiber: '',
    sodium: '',
    sugar: '',
    saturatedFats: '',
    ingredients: '',
    allergens: '',
    isVegan: false,
    isVegetarian: false,
    isGlutenFree: false,
    isOrganic: false,
    source: 'manual'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Debes iniciar sesión para contribuir');
      return;
    }

    // Validación básica
    if (!formData.calories || !formData.proteins || !formData.carbs || !formData.fats) {
      alert('Por favor completa al menos: calorías, proteínas, carbohidratos y grasas');
      return;
    }

    setIsSubmitting(true);
    try {
      await addNutritionalContribution({
        productId: product.id,
        productName: product.nombre,
        productBrand: product.marca,
        nutritionalData: {
          calories: parseFloat(formData.calories) || 0,
          proteins: parseFloat(formData.proteins) || 0,
          carbs: parseFloat(formData.carbs) || 0,
          fats: parseFloat(formData.fats) || 0,
          fiber: parseFloat(formData.fiber) || 0,
          sodium: parseFloat(formData.sodium) || 0,
          sugar: parseFloat(formData.sugar) || 0,
          saturatedFats: parseFloat(formData.saturatedFats) || 0,
          ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
          allergens: formData.allergens.split(',').map(a => a.trim()).filter(Boolean),
          isVegan: formData.isVegan,
          isVegetarian: formData.isVegetarian,
          isGlutenFree: formData.isGlutenFree,
          isOrganic: formData.isOrganic,
          source: formData.source
        },
        contributedBy: currentUser.uid,
        contributorEmail: currentUser.email
      });

      alert('✅ ¡Gracias por tu contribución! Será revisada por un administrador.');
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error enviando contribución:', error);
      alert('Error al enviar contribución: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nutri-modal-overlay-modern" onClick={onClose}>
      <div className="nutri-modal-modern nutri-modal-contribution" onClick={(e) => e.stopPropagation()}>
        <div className="nutri-modal-header-modern">
          <div className="nutri-modal-title-container">
            <h2 className="nutri-modal-title-modern">Contribuir datos nutricionales</h2>
            <p className="nutri-modal-subtitle-modern">
              {product.nombre} - {product.marca}
            </p>
          </div>
          <button onClick={onClose} className="nutri-modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="nutri-modal-body-modern">
          <div className="nutri-info-banner-modern">
            <AlertCircle className="w-5 h-5" />
            <p>
              Tu contribución será revisada por un administrador antes de ser publicada. 
              Por favor, asegúrate de que la información sea precisa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="nutri-form-sections">
            {/* Datos básicos obligatorios */}
            <div className="nutri-form-section">
              <h3 className="nutri-form-section-title">Datos básicos (obligatorios)</h3>
              <div className="nutri-form-grid-modern">
                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">
                    Calorías (kcal/100g) *
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 250"
                    required
                    step="0.1"
                  />
                </div>

                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">
                    Proteínas (g/100g) *
                  </label>
                  <input
                    type="number"
                    name="proteins"
                    value={formData.proteins}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 8.5"
                    required
                    step="0.1"
                  />
                </div>

                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">
                    Carbohidratos (g/100g) *
                  </label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 45"
                    required
                    step="0.1"
                  />
                </div>

                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">
                    Grasas totales (g/100g) *
                  </label>
                  <input
                    type="number"
                    name="fats"
                    value={formData.fats}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 12"
                    required
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Datos adicionales opcionales */}
            <div className="nutri-form-section">
              <h3 className="nutri-form-section-title">Datos adicionales (opcionales)</h3>
              <div className="nutri-form-grid-modern">
                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">Fibra (g/100g)</label>
                  <input
                    type="number"
                    name="fiber"
                    value={formData.fiber}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 3.5"
                    step="0.1"
                  />
                </div>

                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">Sodio (mg/100g)</label>
                  <input
                    type="number"
                    name="sodium"
                    value={formData.sodium}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 350"
                    step="0.1"
                  />
                </div>

                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">Azúcares (g/100g)</label>
                  <input
                    type="number"
                    name="sugar"
                    value={formData.sugar}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 8"
                    step="0.1"
                  />
                </div>

                <div className="nutri-form-group-modern">
                  <label className="nutri-form-label-modern">Grasas saturadas (g/100g)</label>
                  <input
                    type="number"
                    name="saturatedFats"
                    value={formData.saturatedFats}
                    onChange={handleChange}
                    className="nutri-form-input-modern"
                    placeholder="Ej: 2.5"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Ingredientes y alérgenos */}
            <div className="nutri-form-section">
              <h3 className="nutri-form-section-title">Ingredientes y alérgenos</h3>
              
              <div className="nutri-form-group-modern nutri-form-full-width">
                <label className="nutri-form-label-modern">
                  Ingredientes (separados por comas)
                </label>
                <textarea
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  className="nutri-form-textarea-modern"
                  placeholder="Ej: harina de trigo, azúcar, aceite de girasol, sal"
                  rows="3"
                />
              </div>

              <div className="nutri-form-group-modern nutri-form-full-width">
                <label className="nutri-form-label-modern">
                  Alérgenos (separados por comas)
                </label>
                <input
                  type="text"
                  name="allergens"
                  value={formData.allergens}
                  onChange={handleChange}
                  className="nutri-form-input-modern"
                  placeholder="Ej: gluten, leche, soja"
                />
              </div>
            </div>

            {/* Características especiales */}
            <div className="nutri-form-section">
              <h3 className="nutri-form-section-title">Características especiales</h3>
              <div className="nutri-form-grid-modern">
                <label className="nutri-checkbox-label-modern">
                  <input
                    type="checkbox"
                    name="isVegan"
                    checked={formData.isVegan}
                    onChange={handleChange}
                  />
                  <span>Apto vegano</span>
                </label>

                <label className="nutri-checkbox-label-modern">
                  <input
                    type="checkbox"
                    name="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={handleChange}
                  />
                  <span>Apto vegetariano</span>
                </label>

                <label className="nutri-checkbox-label-modern">
                  <input
                    type="checkbox"
                    name="isGlutenFree"
                    checked={formData.isGlutenFree}
                    onChange={handleChange}
                  />
                  <span>Sin gluten</span>
                </label>

                <label className="nutri-checkbox-label-modern">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleChange}
                  />
                  <span>Orgánico</span>
                </label>
              </div>
            </div>

            {/* Fuente de información */}
            <div className="nutri-form-section">
              <h3 className="nutri-form-section-title">Fuente de información</h3>
              <div className="nutri-form-group-modern">
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="nutri-form-select-modern"
                >
                  <option value="manual">Etiqueta del producto</option>
                  <option value="official">Sitio web oficial de la marca</option>
                  <option value="database">Base de datos nutricional</option>
                  <option value="other">Otra fuente</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="nutri-modal-footer-modern">
          <button
            type="button"
            onClick={onClose}
            className="nutri-btn-secondary-modern"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="nutri-btn-primary-modern"
          >
            {isSubmitting ? (
              <>
                <div className="nutri-loading-spinner-small"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Enviar contribución</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributeNutritionalData;