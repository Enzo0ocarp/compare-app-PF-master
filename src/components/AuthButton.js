// src/components/AuthButton.js
import React from 'react';

const AuthButton = ({
  children,
  type = 'button',
  loading = false,
  disabled = false,
  icon,
  loadingText = 'Cargando...',
  variant = 'primary',
  size = 'medium',
  onClick,
  className = ''
}) => {
  const isDisabled = disabled || loading;

  const getButtonClasses = () => {
    const baseClasses = 'auth-button';
    const variantClass = `auth-button--${variant}`;
    const sizeClass = `auth-button--${size}`;
    const stateClasses = [
      loading && 'auth-button--loading',
      isDisabled && 'auth-button--disabled'
    ].filter(Boolean).join(' ');

    return [baseClasses, variantClass, sizeClass, stateClasses, className]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={getButtonClasses()}
      aria-label={loading ? loadingText : children}
    >
      <span className="auth-button__content">
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin auth-button__icon"></i>
            <span className="auth-button__text">{loadingText}</span>
          </>
        ) : (
          <>
            {icon && <i className={`${icon} auth-button__icon`}></i>}
            <span className="auth-button__text">{children}</span>
          </>
        )}
      </span>
    </button>
  );
};

export default AuthButton;