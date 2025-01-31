import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../backend/functions/firebaseConfig'; // Configuración de Firebase // Configuración de Firebase
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { useNavigate } from "react-router-dom";
import BottomNav from './BottomNav';
import "../styles/Login.css";

const Login = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      if (rememberMe) {
        localStorage.setItem("userEmail", data.email);
      }
      alert("¡Usuario logueado exitosamente!");
      navigate("/");
    } catch (err) {
      setError("Error: correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <InputText
              id="email"
              placeholder="Ingrese su correo"
              {...register("email", { 
                required: "El correo es obligatorio", 
                pattern: { value: /^\S+@\S+$/i, message: "Correo no válido" }
              })}
              className={`form-input ${errors.email ? "p-invalid" : ""}`}
            />
            {errors.email && <Message severity="error" text={errors.email.message} />}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <Password
              id="password"
              placeholder="Ingrese su contraseña"
              toggleMask
              onInput={(e) => setValue("password", e.target.value)}
              {...register("password", { 
                required: "La contraseña es obligatoria", 
                minLength: { value: 6, message: "Debe tener al menos 6 caracteres" }
              })}
              feedback={false}
              className={`form-input ${errors.password ? "p-invalid" : ""}`}
            />
            {errors.password && <Message severity="error" text={errors.password.message} />}
          </div>

          <div className="form-group remember-me">
            <Checkbox
              inputId="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.checked)}
            />
            <label htmlFor="rememberMe" className="remember-me-label">Recordarme</label>
          </div>

          {error && <Message severity="error" text={error} className="error-message" />}

          <Button
            label={loading ? "Cargando..." : "Iniciar sesión"}
            icon="pi pi-sign-in"
            loading={loading}
            type="submit"
            className="submit-button"
          />
        </form>
        <p className="register-link">
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Login;
