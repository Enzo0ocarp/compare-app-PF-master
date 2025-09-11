// src/components/FormInput.js
import React, { useState } from 'react';

const FormInput = ({
  label,
  type = 'text',
  placeholder,
  icon,
  register,
  error,
  disabled = false,
  autoComplete,
  showPasswordToggle = false,
  maxLength,
  max,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`form-group ${className} ${error ? 'has-error' : ''} ${isFocused ? 'is-focused' : ''}`}>
      {label && (
        <label className="form-label">
          {icon && <i className={icon}></i>}
          {label}
          {register?.required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {type === 'textarea' ? (
          <textarea
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...register}
            className="form-input"
            rows={3}
          />
        ) : (
          <input
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            maxLength={maxLength}
            max={max}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...register}
            className="form-input"
          />
        )}
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className="password-toggle"
            onClick={handleTogglePassword}
            disabled={disabled}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error.message}
        </div>
      )}
    </div>
  );
};

export default FormInput;