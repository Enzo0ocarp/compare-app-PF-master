// src/components/PasswordStrengthIndicator.js
import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)
    };

    // Calcular puntuación
    if (checks.length) score += 2;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.symbols) score += 1;

    // Determinar nivel
    if (score < 3) {
      return { score: 1, label: 'Débil', color: '#ef4444', checks };
    } else if (score < 5) {
      return { score: 2, label: 'Media', color: '#f59e0b', checks };
    } else {
      return { score: 3, label: 'Fuerte', color: '#10b981', checks };
    }
  };

  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-header">
        <span className="strength-label">Seguridad de la contraseña:</span>
        <span className="strength-level" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      
      <div className="strength-bar">
        <div 
          className="strength-fill"
          style={{ 
            width: `${(strength.score / 3) * 100}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
      
      <div className="strength-requirements">
        <div className={`requirement ${strength.checks?.length ? 'met' : ''}`}>
          <i className={`fas ${strength.checks?.length ? 'fa-check' : 'fa-times'}`}></i>
          Al menos 8 caracteres
        </div>
        <div className={`requirement ${strength.checks?.lowercase ? 'met' : ''}`}>
          <i className={`fas ${strength.checks?.lowercase ? 'fa-check' : 'fa-times'}`}></i>
          Una letra minúscula
        </div>
        <div className={`requirement ${strength.checks?.uppercase ? 'met' : ''}`}>
          <i className={`fas ${strength.checks?.uppercase ? 'fa-check' : 'fa-times'}`}></i>
          Una letra mayúscula
        </div>
        <div className={`requirement ${strength.checks?.numbers ? 'met' : ''}`}>
          <i className={`fas ${strength.checks?.numbers ? 'fa-check' : 'fa-times'}`}></i>
          Un número
        </div>
        <div className={`requirement ${strength.checks?.symbols ? 'met' : ''}`}>
          <i className={`fas ${strength.checks?.symbols ? 'fa-check' : 'fa-times'}`}></i>
          Un símbolo especial (opcional)
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;