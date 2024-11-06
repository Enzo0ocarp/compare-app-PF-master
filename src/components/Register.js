import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useNavigate } from "react-router-dom";
import BottomNav from './BottomNav';
import "../styles/Register.css";

const Register = () => {
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      alert("¡Usuario registrado exitosamente!");
      reset();
      navigate("/login");
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setValue("password", e.target.value);
  };

  return (
    <>
      <div className="register-container">
        <h2 className="register-title">Registro</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="register-form animated-form">
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
              value={password}
              onChange={handlePasswordChange}
              feedback={false}
              className={`form-input ${errors.password ? "p-invalid" : ""}`}
            />
            {errors.password && <Message severity="error" text={errors.password.message} />}
          </div>

          {error && <Message severity="error" text={error} className="error-message animated-error" />}

          <Button
            label={loading ? "Cargando..." : "Registrar"}
            icon="pi pi-user-plus"
            loading={loading}
            type="submit"
            className="submit-button animated-button"
          />
        </form>
        <p className="login-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
      
      <BottomNav />
    </>
  );
};

export default Register;
