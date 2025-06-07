// src/pages/Register.js - VERSIÓN MEJORADA
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from '../functions/src/firebaseConfig';
import { doc, setDoc } from "firebase/firestore";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useNavigate } from "react-router-dom";
import BottomNav from './BottomNav';
import "../styles/Register.css";

const Register = () => {
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Validaciones en tiempo real
  const watchedFields = watch();
  const isFormValid = watchedFields.email && watchedFields.password && 
                     watchedFields.firstName && watchedFields.lastName && 
                     watchedFields.birthDate;

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    
    try {
      // Validación adicional de edad
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        throw new Error("Debes tener al menos 13 años para registrarte");
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Actualizar perfil
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: data.photoURL || '/default-profile.png'
      });

      // Guardar en Firestore con datos adicionales
      await setDoc(doc(db, "users", user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        bio: data.bio || "",
        email: data.email,
        photoURL: data.photoURL || '/default-profile.png',
        preferences: {
          notifications: true,
          newsletter: false,
          location: null
        },
        stats: {
          searchesCount: 0,
          favoritesCount: 0,
          savingsTotal: 0
        },
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      });
      
      // Mostrar mensaje de éxito
      const successMessage = `¡Bienvenido ${data.firstName}! Tu cuenta ha sido creada exitosamente.`;
      console.log(successMessage);
      
      reset();
      navigate("/login", { 
        state: { 
          message: "Registro exitoso. Inicia sesión para continuar.",
          type: "success" 
        }
      });
      
    } catch (err) {
      console.error("Error en registro:", err);
      
      // Mensajes de error más amigables
      let errorMessage = "Error al crear la cuenta. ";
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage += "Esta dirección de correo ya está registrada.";
          break;
        case 'auth/weak-password':
          errorMessage += "La contraseña debe tener al menos 6 caracteres.";
          break;
        case 'auth/invalid-email':
          errorMessage += "El formato del correo electrónico no es válido.";
          break;
        case 'auth/network-request-failed':
          errorMessage += "Error de conexión. Verifica tu internet.";
          break;
        default:
          errorMessage += err.message || "Intenta nuevamente.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setValue("password", newPassword, { shouldValidate: true });
  };

  const validatePassword = (value) => {
    if (!value) return "La contraseña es obligatoria";
    if (value.length < 6) return "Mínimo 6 caracteres";
    if (!/(?=.*[a-z])/.test(value)) return "Debe incluir al menos una letra minúscula";
    if (!/(?=.*[A-Z])/.test(value)) return "Debe incluir al menos una letra mayúscula";
    if (!/(?=.*\d)/.test(value)) return "Debe incluir al menos un número";
    return true;
  };

  const validateBirthDate = (value) => {
    if (!value) return "La fecha de nacimiento es obligatoria";
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) return "Debes tener al menos 13 años";
    if (age > 120) return "Fecha no válida";
    return true;
  };

  return (
    <>
      <div className="register-container">
        <h2 className="register-title">Crear Cuenta</h2>
        <p className="register-subtitle">
          Únete a Compare y encuentra los mejores precios
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="register-form animated-form">
          {/* Información de contacto */}
          <div className="form-section">
            <h4 className="section-title">Información de Contacto</h4>
            
            <div className="form-group">
              <label htmlFor="email">
                <i className="pi pi-envelope"></i>
                Correo electrónico
              </label>
              <InputText
                id="email"
                placeholder="tu@email.com"
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: { 
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i, 
                    message: "Correo no válido" 
                  }
                })}
                className={`form-input ${errors.email ? "p-invalid" : ""}`}
                autoComplete="email"
              />
              {errors.email && <Message severity="error" text={errors.email.message} />}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="pi pi-lock"></i>
                Contraseña
              </label>
              <Password
                id="password"
                placeholder="Mínimo 6 caracteres"
                toggleMask
                value={password}
                onChange={handlePasswordChange}
                feedback={true}
                className={`form-input ${errors.password ? "p-invalid" : ""}`}
                autoComplete="new-password"
                promptLabel="Ingresa una contraseña"
                weakLabel="Débil"
                mediumLabel="Media"
                strongLabel="Fuerte"
              />
              {errors.password && <Message severity="error" text={errors.password.message} />}
            </div>
          </div>

          {/* Información personal */}
          <div className="form-section">
            <h4 className="section-title">Información Personal</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  <i className="pi pi-user"></i>
                  Nombre
                </label>
                <InputText
                  id="firstName"
                  placeholder="Tu nombre"
                  {...register("firstName", { 
                    required: "El nombre es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    pattern: { value: /^[a-zA-ZÀ-ÿ\s]+$/, message: "Solo letras y espacios" }
                  })}
                  className={`form-input ${errors.firstName ? "p-invalid" : ""}`}
                  autoComplete="given-name"
                />
                {errors.firstName && <Message severity="error" text={errors.firstName.message} />}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  <i className="pi pi-user"></i>
                  Apellido
                </label>
                <InputText
                  id="lastName"
                  placeholder="Tu apellido"
                  {...register("lastName", { 
                    required: "El apellido es obligatorio",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    pattern: { value: /^[a-zA-ZÀ-ÿ\s]+$/, message: "Solo letras y espacios" }
                  })}
                  className={`form-input ${errors.lastName ? "p-invalid" : ""}`}
                  autoComplete="family-name"
                />
                {errors.lastName && <Message severity="error" text={errors.lastName.message} />}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">
                <i className="pi pi-calendar"></i>
                Fecha de Nacimiento
              </label>
              <InputText
                id="birthDate"
                type="date"
                {...register("birthDate", { validate: validateBirthDate })}
                className={`form-input ${errors.birthDate ? "p-invalid" : ""}`}
                max={new Date().toISOString().split('T')[0]}
                autoComplete="bdate"
              />
              {errors.birthDate && <Message severity="error" text={errors.birthDate.message} />}
            </div>
          </div>

          {/* Información adicional */}
          <div className="form-section">
            <h4 className="section-title">Información Adicional (Opcional)</h4>
            
            <div className="form-group">
              <label htmlFor="photoURL">
                <i className="pi pi-image"></i>
                URL de Foto de Perfil
              </label>
              <InputText
                id="photoURL"
                placeholder="https://ejemplo.com/mi-foto.jpg"
                {...register("photoURL", {
                  pattern: {
                    value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                    message: "URL de imagen no válida"
                  }
                })}
                className="form-input"
                autoComplete="photo"
              />
              {errors.photoURL && <Message severity="error" text={errors.photoURL.message} />}
            </div>

            <div className="form-group">
              <label htmlFor="bio">
                <i className="pi pi-pencil"></i>
                Biografía
              </label>
              <InputText
                id="bio"
                placeholder="Cuéntanos algo sobre ti (máx. 160 caracteres)"
                {...register("bio", {
                  maxLength: { value: 160, message: "Máximo 160 caracteres" }
                })}
                className="form-input"
                maxLength={160}
              />
              {errors.bio && <Message severity="error" text={errors.bio.message} />}
              {watchedFields.bio && (
                <small className="char-counter">
                  {watchedFields.bio.length}/160 caracteres
                </small>
              )}
            </div>
          </div>

          {/* Error general */}
          {error && (
            <Message 
              severity="error" 
              text={error} 
              className="error-message animated-error" 
            />
          )}

          {/* Botón de envío */}
          <Button
            label={loading ? "Creando cuenta..." : "Crear Cuenta"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
            loading={loading}
            type="submit"
            className="submit-button animated-button"
            disabled={loading || !isFormValid}
          />

          {/* Términos y condiciones */}
          <p className="terms-text">
            Al registrarte, aceptas nuestros{" "}
            <a href="/terms" target="_blank">Términos de Servicio</a>{" "}
            y{" "}
            <a href="/privacy" target="_blank">Política de Privacidad</a>
          </p>
        </form>

        <p className="login-link">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </>
  );
};

export default Register;