// src/components/SocialAuthButtons.js
import React from 'react';
import AuthButton from './AuthButton';

const SocialAuthButtons = ({ 
  onGoogleLogin, 
  loading = false, 
  isRegister = false 
}) => {
  const buttonText = isRegister ? 'Registrarse con Google' : 'Continuar con Google';

  return (
    <div className="social-auth-buttons">
      <AuthButton
        onClick={onGoogleLogin}
        disabled={loading}
        variant="google"
        size="large"
        icon="fab fa-google"
        className="google-auth-button"
      >
        {buttonText}
      </AuthButton>
      
      {/* Puedes agregar más proveedores aquí */}
      {/* 
      <AuthButton
        onClick={onFacebookLogin}
        disabled={loading}
        variant="facebook"
        size="large"
        icon="fab fa-facebook-f"
        className="facebook-auth-button"
      >
        {isRegister ? 'Registrarse con Facebook' : 'Continuar con Facebook'}
      </AuthButton>
      */}
    </div>
  );
};

export default SocialAuthButtons;