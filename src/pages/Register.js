import React, { useState } from 'react';
import Header from '../components/Header';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleRegister = () => {
        // Lógica de registro
    };

    return (
        <div className="register-page">
            <Header />
            <section className="section register-section">
                <h3>Registrar Cuenta</h3>
                <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Contraseña</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button onClick={handleRegister}>Registrar</button>
            </section>
        </div>
    );
}

export default Register;
