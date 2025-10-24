// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../functions/src/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from './Notification';
import FormInput from './FormInput';
import AuthButton from './AuthButton';
import SocialAuthButtons from './SocialAuthButtons';
import '../styles/AuthStyles.css';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const watchedFields = watch();
  const isFormValid = watchedFields.email && watchedFields.password;

  // Cargar email guardado al montar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  // Verificar si el usuario ya está logueado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const getFirebaseErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'El formato del email no es válido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/invalid-credential': 'Credenciales inválidas'
    };
    return errorMessages[errorCode] || 'Error de autenticación. Verifica tus credenciales';
  };

  const checkAndCreateUserProfile = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Crear perfil básico si no existe
        const profileData = {
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
          photoURL: user.photoURL || '',
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
          preferences: {
            notifications: true,
            newsletter: false
          }
        };
        
        await setDoc(doc(db, 'users', user.uid), profileData);
      } else {
        // Actualizar última conexión
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error al crear/actualizar perfil:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Manejar "recordarme"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Verificar/crear perfil de usuario
      await checkAndCreateUserProfile(user);

      showNotification(`¡Bienvenido de vuelta${user.displayName ? `, ${user.displayName}` : ''}!`, 'success');
      navigate('/');

    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage = getFirebaseErrorMessage(error.code);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await checkAndCreateUserProfile(user);

      showNotification(`¡Bienvenido${user.displayName ? `, ${user.displayName}` : ''}!`, 'success');
      navigate('/');

    } catch (error) {
      console.error('Error con Google login:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        showNotification('Error al iniciar sesión con Google', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    
    <div className="auth-container">
    <div className='auth-title'>
      <h1>Compare & Nourish</h1>
      <h3>Ahorra inteligente</h3>
      </div>  
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fas fa-sign-in-alt"></i>
          </div>
          <h1>Iniciar Sesión</h1>
          <p>Bienvenido de vuelta a Compare & Nourish</p>
        </div>

        {/* Botones de redes sociales */}
        <SocialAuthButtons
          onGoogleLogin={handleGoogleLogin}
          loading={loading}
        />

        {/* Divisor */}
        <div className="auth-divider">
          <span>o continúa con email</span>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
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
            placeholder="Tu contraseña"
            icon="fas fa-lock"
            register={register('password', {
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
            error={errors.password}
            disabled={loading}
            autoComplete="current-password"
            showPasswordToggle
          />

          {/* Opciones adicionales */}
          <div className="auth-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              Recordar mi email
            </label>

            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón de envío */}
          <AuthButton
            type="submit"
            loading={loading}
            disabled={!isFormValid}
            icon="fas fa-sign-in-alt"
            loadingText="Iniciando sesión..."
          >
            Iniciar Sesión
          </AuthButton>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;