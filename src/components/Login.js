/**
 * @fileoverview Componente de página de inicio de sesión
 * @description Página de autenticación con Firebase Auth que permite a los usuarios
 * iniciar sesión usando email y contraseña, con validación de formularios y manejo de errores.
 * @author Compare Team
 * @version 1.0.0
 * @since 2025
 */

// Login.js:
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../functions/src/firebaseConfig';
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { useNavigate } from "react-router-dom";
import BottomNav from './BottomNav';
import "../styles/Login.css";

/**
 * @typedef {Object} LoginFormData
 * @property {string} email - Dirección de correo electrónico del usuario
 * @property {string} password - Contraseña del usuario
 */

/**
 * @typedef {Object} FormErrors
 * @property {Object} [email] - Error de validación del campo email
 * @property {string} email.message - Mensaje de error del email
 * @property {Object} [password] - Error de validación del campo password
 * @property {string} password.message - Mensaje de error de la contraseña
 */

/**
 * @typedef {Object} FirebaseAuthError
 * @property {string} code - Código de error de Firebase
 * @property {string} message - Mensaje de error de Firebase
 */

/**
 * @component Login
 * @description Página de inicio de sesión que permite a los usuarios autenticarse
 * en la aplicación usando Firebase Authentication.
 * 
 * Características principales:
 * - Formulario con validación usando React Hook Form
 * - Integración completa con Firebase Auth
 * - Validación en tiempo real de email y contraseña
 * - Función "Recordarme" que guarda el email en localStorage
 * - Manejo de errores de autenticación
 * - Estados de carga durante el proceso de login
 * - Navegación automática después del login exitoso
 * - Enlace para registro de nuevos usuarios
 * - Diseño responsive con PrimeReact
 * 
 * @returns {JSX.Element} Página completa de inicio de sesión
 */
const Login = () => {
  /**
   * @description Hook de React Hook Form para manejo del formulario
   * @type {Object}
   */
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  
  /** @type {string} Mensaje de error de autenticación */
  const [error, setError] = useState("");
  
  /** @type {boolean} Estado de carga durante el proceso de login */
  const [loading, setLoading] = useState(false);
  
  /** @type {boolean} Estado del checkbox "Recordarme" */
  const [rememberMe, setRememberMe] = useState(false);
  
  /** @type {Function} Hook de navegación de React Router */
  const navigate = useNavigate();

  /**
   * @description Maneja el envío del formulario de login
   * @async
   * @function
   * @since 1.0.0
   * @param {LoginFormData} data - Datos del formulario (email y password)
   * @returns {Promise<void>} Promesa que se resuelve cuando el login se completa
   * @throws {FirebaseAuthError} Error de autenticación de Firebase
   */
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      if (rememberMe) {
        localStorage.setItem("userEmail", data.email);
      } else {
        localStorage.removeItem("userEmail");
      }
      
      console.log("Usuario logueado exitosamente:", user.email);
      navigate("/");
      
    } catch (err) {
      console.error("Error en login:", err);
      const errorMessage = getFirebaseErrorMessage(err.code);
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description Convierte códigos de error de Firebase en mensajes amigables
   * @function
   * @since 1.0.0
   * @param {string} errorCode - Código de error de Firebase
   * @returns {string} Mensaje de error amigable para el usuario
   */
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No existe una cuenta con este email';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-email':
        return 'El formato del email no es válido';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet';
      default:
        return 'Error de autenticación. Verifica tus credenciales';
    }
  };

  /**
   * @description Maneja el cambio del estado del checkbox "Recordarme"
   * @function
   * @since 1.0.0
   * @param {Object} e - Evento del checkbox
   * @param {boolean} e.checked - Nuevo estado del checkbox
   */
  const handleRememberMeChange = (e) => {
    setRememberMe(e.checked);
  };

  /**
   * @description Carga el email guardado desde localStorage al montar el componente
   * @function
   * @since 1.0.0
   */
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  /**
   * @description Maneja la navegación al registro
   * @function
   * @since 1.0.0
   */
  const handleGoToRegister = () => {
    navigate('/register');
  };

  /**
   * @description Maneja la recuperación de contraseña
   * @function
   * @since 1.0.0
   */
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header de la página */}
        <div className="login-header">
          <div className="login-logo">
            <i className="pi pi-sign-in" style={{ fontSize: '3rem', color: '#667eea' }}></i>
          </div>
          <h2 className="login-title">Iniciar Sesión</h2>
          <p className="login-subtitle">
            Bienvenido de vuelta a Compare. Ingresa tus credenciales para continuar.
          </p>
        </div>

        {/* Formulario de login */}
        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          {/* Campo de email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <i className="pi pi-envelope"></i>
              Correo electrónico
            </label>
            <InputText
              id="email"
              placeholder="Ingrese su correo electrónico"
              {...register("email", { 
                required: "El correo electrónico es obligatorio", 
                pattern: { 
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i, 
                  message: "Por favor ingresa un correo electrónico válido" 
                }
              })}
              className={`form-input ${errors.email ? "p-invalid" : ""}`}
              disabled={loading}
              autoComplete="email"
              type="email"
            />
            {errors.email && (
              <Message 
                severity="error" 
                text={errors.email.message} 
                className="field-error"
              />
            )}
          </div>

          {/* Campo de contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <i className="pi pi-lock"></i>
              Contraseña
            </label>
            <Password
              id="password"
              placeholder="Ingrese su contraseña"
              toggleMask
              onInput={(e) => setValue("password", e.target.value)}
              {...register("password", { 
                required: "La contraseña es obligatoria", 
                minLength: { 
                  value: 6, 
                  message: "La contraseña debe tener al menos 6 caracteres" 
                }
              })}
              feedback={false}
              className={`form-input ${errors.password ? "p-invalid" : ""}`}
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && (
              <Message 
                severity="error" 
                text={errors.password.message} 
                className="field-error"
              />
            )}
          </div>

          {/* Opciones adicionales */}
          <div className="form-options">
            <div className="remember-me-group">
              <Checkbox
                inputId="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="remember-me-label">
                Recordar mi email
              </label>
            </div>
            
            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
              disabled={loading}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Mensaje de error general */}
          {error && (
            <Message 
              severity="error" 
              text={error} 
              className="error-message"
              style={{ marginBottom: '1rem' }}
            />
          )}

          {/* Botón de envío */}
          <Button
            label={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            loading={loading}
            type="submit"
            className="submit-button"
            disabled={loading}
          />
        </form>

        {/* Enlaces de navegación */}
        <div className="login-footer">
          <div className="register-prompt">
            <span>¿No tienes una cuenta? </span>
            <button
              type="button"
              className="register-link"
              onClick={handleGoToRegister}
              disabled={loading}
            >
              Regístrate aquí
            </button>
          </div>
          
          <div className="help-links">
            <button
              type="button"
              className="help-link"
              onClick={() => navigate('/help')}
              disabled={loading}
            >
              <i className="pi pi-question-circle"></i>
              ¿Necesitas ayuda?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;