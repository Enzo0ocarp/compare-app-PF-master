// src/components/Register.js - VERSIÓN CORREGIDA
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../functions/src/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from './Notification';
import FormInput from './FormInput';
import AuthButton from './AuthButton';
import SocialAuthButtons from './SocialAuthButtons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import '../styles/AuthStyles.css';

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const watchedFields = watch();
  const password = watch('password');
  const isFormValid = 
    watchedFields.email && 
    watchedFields.password && 
    watchedFields.confirmPassword &&
    watchedFields.firstName && 
    watchedFields.lastName && 
    acceptTerms &&
    watchedFields.password === watchedFields.confirmPassword;

  const getFirebaseErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Esta dirección de correo ya está registrada',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'El formato del correo electrónico no es válido',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/operation-not-allowed': 'El registro está temporalmente deshabilitado'
    };
    return errorMessages[errorCode] || 'Error al crear la cuenta. Intenta nuevamente.';
  };

  // FUNCIÓN CORREGIDA: usar let en lugar de const
  const validateAge = (birthDate) => {
    if (!birthDate) return 'La fecha de nacimiento es obligatoria';
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear(); // CAMBIO: let en lugar de const
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--; // ESTO YA NO CAUSARÁ ERROR
    }
    
    if (age < 13) return 'Debes tener al menos 13 años para registrarte';
    if (age > 120) return 'Por favor verifica la fecha de nacimiento';
    
    return true;
  };

  const createUserProfile = async (user, additionalData) => {
    const profileData = {
      email: user.email,
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      birthDate: additionalData.birthDate,
      bio: additionalData.bio || '',
      photoURL: user.photoURL || additionalData.photoURL || '',
      role: 'user',
      createdAt: new Date(),
      lastLogin: new Date(),
      preferences: {
        notifications: true,
        newsletter: additionalData.newsletter || false,
        language: 'es'
      },
      stats: {
        searchesCount: 0,
        favoritesCount: 0,
        contributionsCount: 0,
        reviewsCount: 0
      },
      isActive: true
    };

    await setDoc(doc(db, 'users', user.uid), profileData);
    return profileData;
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Validar edad
      const ageValidation = validateAge(data.birthDate);
      if (ageValidation !== true) {
        showNotification(ageValidation, 'error');
        setLoading(false);
        return;
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Actualizar perfil en Auth
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: data.photoURL || ''
      });

      // Crear documento en Firestore
      await createUserProfile(user, data);

      showNotification(
        `¡Bienvenido ${data.firstName}! Tu cuenta ha sido creada exitosamente.`,
        'success'
      );

      reset();
      navigate('/perfil');

    } catch (error) {
      console.error('Error en registro:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Extraer información del perfil de Google
      const nameParts = user.displayName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const profileData = {
        firstName,
        lastName,
        birthDate: '', // El usuario deberá completar esto después
        bio: '',
        photoURL: user.photoURL || '',
        newsletter: false
      };

      await createUserProfile(user, profileData);

      showNotification(`¡Bienvenido ${firstName}! Completa tu perfil para continuar.`, 'success');
      navigate('/perfil');

    } catch (error) {
      console.error('Error con Google register:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        showNotification('Error al registrarse con Google', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fas fa-user-plus"></i>
          </div>
          <h1>Crear Cuenta</h1>
          <p>Únete a Compare & Nourish y descubre los mejores precios</p>
        </div>

        {/* Botones de redes sociales */}
        <SocialAuthButtons
          onGoogleLogin={handleGoogleRegister}
          loading={loading}
          isRegister={true}
        />

        {/* Divisor */}
        <div className="auth-divider">
          <span>o completa el formulario</span>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
          {/* Información personal */}
          <div className="form-section">
            <h3>Información Personal</h3>
            
            <div className="form-row">
              <FormInput
                label="Nombre"
                type="text"
                placeholder="Tu nombre"
                icon="fas fa-user"
                register={register('firstName', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  pattern: { 
                    value: /^[a-zA-ZÀ-ÿ\s]+$/, 
                    message: 'Solo letras y espacios' 
                  }
                })}
                error={errors.firstName}
                disabled={loading}
                autoComplete="given-name"
              />

              <FormInput
                label="Apellido"
                type="text"
                placeholder="Tu apellido"
                icon="fas fa-user"
                register={register('lastName', {
                  required: 'El apellido es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  pattern: { 
                    value: /^[a-zA-ZÀ-ÿ\s]+$/, 
                    message: 'Solo letras y espacios' 
                  }
                })}
                error={errors.lastName}
                disabled={loading}
                autoComplete="family-name"
              />
            </div>

            <FormInput
              label="Fecha de Nacimiento"
              type="date"
              icon="fas fa-calendar"
              register={register('birthDate', { validate: validateAge })}
              error={errors.birthDate}
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
              autoComplete="bdate"
            />
          </div>

          {/* Información de cuenta */}
          <div className="form-section">
            <h3>Información de Cuenta</h3>
            
            <FormInput
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              icon="fas fa-envelope"
              register={register('email', {
                required: 'El correo electrónico es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                  message: 'Por favor ingresa un correo electrónico válido'
                }
              })}
              error={errors.email}
              disabled={loading}
              autoComplete="email"
            />

            <FormInput
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              icon="fas fa-lock"
              register={register('password', {
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Debe incluir mayúscula, minúscula y número'
                }
              })}
              error={errors.password}
              disabled={loading}
              autoComplete="new-password"
              showPasswordToggle
            />

            {password && <PasswordStrengthIndicator password={password} />}

            <FormInput
              label="Confirmar Contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              icon="fas fa-lock"
              register={register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: value => 
                  value === password || 'Las contraseñas no coinciden'
              })}
              error={errors.confirmPassword}
              disabled={loading}
              autoComplete="new-password"
              showPasswordToggle
            />
          </div>

          {/* Información opcional */}
          <div className="form-section optional">
            <h3>Información Adicional (Opcional)</h3>
            
            <FormInput
              label="Biografía"
              type="textarea"
              placeholder="Cuéntanos algo sobre ti (máx. 160 caracteres)"
              icon="fas fa-pencil-alt"
              register={register('bio', {
                maxLength: { value: 160, message: 'Máximo 160 caracteres' }
              })}
              error={errors.bio}
              disabled={loading}
              maxLength={160}
            />

            {watchedFields.bio && (
              <div className="char-counter">
                {watchedFields.bio.length}/160 caracteres
              </div>
            )}

            <FormInput
              label="Foto de Perfil (URL)"
              type="url"
              placeholder="https://ejemplo.com/mi-foto.jpg"
              icon="fas fa-image"
              register={register('photoURL', {
                pattern: {
                  value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                  message: 'URL de imagen no válida'
                }
              })}
              error={errors.photoURL}
              disabled={loading}
            />

            <label className="checkbox-container">
              <input
                type="checkbox"
                {...register('newsletter')}
                disabled={loading}
              />
              <span className="checkmark"></span>
              Quiero recibir newsletters con ofertas especiales
            </label>
          </div>

          {/* Términos y condiciones */}
          <label className="checkbox-container required">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={loading}
              required
            />
            <span className="checkmark"></span>
            Acepto los{' '}
            <Link to="/terms" target="_blank" className="auth-link">
              Términos de Servicio
            </Link>{' '}
            y la{' '}
            <Link to="/privacy" target="_blank" className="auth-link">
              Política de Privacidad
            </Link>
          </label>

          {/* Botón de envío */}
          <AuthButton
            type="submit"
            loading={loading}
            disabled={!isFormValid}
            icon="fas fa-user-plus"
            loadingText="Creando cuenta..."
          >
            Crear Cuenta
          </AuthButton>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;