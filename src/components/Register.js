// src/pages/Register.js
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from '../functions/src/firebaseConfig'; // 🔥 Asegúrate de exportar 'db' en firebaseConfig
import { doc, setDoc } from "firebase/firestore";
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
      // Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Actualizar el perfil (displayName y photoURL)
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: data.photoURL || '/default-profile.png'
      });

      // Guardar información extra en Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
        bio: data.bio || "",
        email: data.email,
        createdAt: new Date()
      });
      
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
          {/* Campos básicos */}
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

          {/* Campos adicionales para datos personales */}
          <div className="form-group">
            <label htmlFor="firstName">Nombre</label>
            <InputText
              id="firstName"
              placeholder="Ingrese su nombre"
              {...register("firstName", { required: "El nombre es obligatorio" })}
              className={`form-input ${errors.firstName ? "p-invalid" : ""}`}
            />
            {errors.firstName && <Message severity="error" text={errors.firstName.message} />}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Apellido</label>
            <InputText
              id="lastName"
              placeholder="Ingrese su apellido"
              {...register("lastName", { required: "El apellido es obligatorio" })}
              className={`form-input ${errors.lastName ? "p-invalid" : ""}`}
            />
            {errors.lastName && <Message severity="error" text={errors.lastName.message} />}
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">Fecha de Nacimiento</label>
            <InputText
              id="birthDate"
              type="date"
              placeholder="Ingrese su fecha de nacimiento"
              {...register("birthDate", { required: "La fecha de nacimiento es obligatoria" })}
              className={`form-input ${errors.birthDate ? "p-invalid" : ""}`}
            />
            {errors.birthDate && <Message severity="error" text={errors.birthDate.message} />}
          </div>
          <div className="form-group">
            <label htmlFor="photoURL">URL de Foto de Perfil</label>
            <InputText
              id="photoURL"
              placeholder="Ingrese URL de su foto de perfil"
              {...register("photoURL")}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Biografía</label>
            <InputText
              id="bio"
              placeholder="Cuéntanos algo sobre ti"
              {...register("bio")}
              className="form-input"
            />
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
