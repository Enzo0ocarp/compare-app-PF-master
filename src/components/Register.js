// src/components/Register.js - VERSIÓN CON TÉRMINOS Y CONDICIONES
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
import TermsModal from './TermsModal';
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [modalContent, setModalContent] = useState('terms'); // 'terms' o 'privacy'
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

  const validateAge = (birthDate) => {
    if (!birthDate) return 'La fecha de nacimiento es obligatoria';
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
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
      acceptedTermsAt: new Date(), // Fecha de aceptación de términos
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
    if (!acceptTerms) {
      showNotification('Debes aceptar los términos y condiciones para continuar', 'error');
      return;
    }

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
    if (!acceptTerms) {
      showNotification('Debes aceptar los términos y condiciones para continuar', 'error');
      return;
    }

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

  const openTermsModal = (type) => {
    setModalContent(type);
    setShowTermsModal(true);
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

        {/* Social Auth */}
        <SocialAuthButtons
          onGoogleClick={handleGoogleRegister}
          onFacebookClick={() => showNotification('Próximamente disponible', 'info')}
          onAppleClick={() => showNotification('Próximamente disponible', 'info')}
          loading={loading}
          mode="register"
        />

        <div className="auth-divider">
          <span>o regístrate con email</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-row">
            <FormInput
              label="Nombre"
              name="firstName"
              register={register}
              errors={errors}
              validation={{
                required: 'El nombre es obligatorio',
                minLength: {
                  value: 2,
                  message: 'El nombre debe tener al menos 2 caracteres'
                },
                pattern: {
                  value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                  message: 'El nombre solo puede contener letras'
                }
              }}
              placeholder="Tu nombre"
              icon="fas fa-user"
            />

            <FormInput
              label="Apellido"
              name="lastName"
              register={register}
              errors={errors}
              validation={{
                required: 'El apellido es obligatorio',
                minLength: {
                  value: 2,
                  message: 'El apellido debe tener al menos 2 caracteres'
                },
                pattern: {
                  value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                  message: 'El apellido solo puede contener letras'
                }
              }}
              placeholder="Tu apellido"
              icon="fas fa-user"
            />
          </div>

          <FormInput
            label="Correo Electrónico"
            name="email"
            type="email"
            register={register}
            errors={errors}
            validation={{
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ingresa un correo válido'
              }
            }}
            placeholder="tucorreo@ejemplo.com"
            icon="fas fa-envelope"
          />

          <FormInput
            label="Fecha de Nacimiento"
            name="birthDate"
            type="date"
            register={register}
            errors={errors}
            validation={{
              required: 'La fecha de nacimiento es obligatoria',
              validate: validateAge
            }}
            icon="fas fa-calendar"
          />

          <FormInput
            label="Contraseña"
            name="password"
            type="password"
            register={register}
            errors={errors}
            validation={{
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 8,
                message: 'La contraseña debe tener al menos 8 caracteres'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Debe contener mayúsculas, minúsculas y números'
              }
            }}
            placeholder="Mínimo 8 caracteres"
            icon="fas fa-lock"
          />

          {password && (
            <PasswordStrengthIndicator password={password} />
          )}

          <FormInput
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            register={register}
            errors={errors}
            validation={{
              required: 'Confirma tu contraseña',
              validate: value =>
                value === password || 'Las contraseñas no coinciden'
            }}
            placeholder="Repite tu contraseña"
            icon="fas fa-lock"
          />

          <FormInput
            label="Bio (Opcional)"
            name="bio"
            type="textarea"
            register={register}
            errors={errors}
            validation={{
              maxLength: {
                value: 200,
                message: 'La bio no puede superar los 200 caracteres'
              }
            }}
            placeholder="Cuéntanos un poco sobre ti..."
            icon="fas fa-pencil-alt"
          />

          {/* Términos y Condiciones */}
          <div className="terms-section">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="terms-checkbox"
              />
              <label htmlFor="acceptTerms" className="terms-label">
                Acepto los{' '}
                <button
                  type="button"
                  onClick={() => openTermsModal('terms')}
                  className="terms-link"
                >
                  Términos y Condiciones
                </button>
                {' '}y la{' '}
                <button
                  type="button"
                  onClick={() => openTermsModal('privacy')}
                  className="terms-link"
                >
                  Política de Privacidad
                </button>
              </label>
            </div>
            {!acceptTerms && watchedFields.email && (
              <p className="terms-warning">
                <i className="fas fa-info-circle"></i>
                Debes aceptar los términos para crear tu cuenta
              </p>
            )}
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('newsletter')}
              />
              <span>
                Quiero recibir novedades y ofertas por email
              </span>
            </label>
          </div>

          <AuthButton
            type="submit"
            loading={loading}
            disabled={!isFormValid}
            icon="fas fa-user-plus"
          >
            Crear Cuenta
          </AuthButton>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          contentType={modalContent}
          onAccept={() => {
            setAcceptTerms(true);
            setShowTermsModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Register;