import React, { useState } from 'react';
import Header from '../components/Header';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Lógica de inicio de sesión
    };

    return (
        <div className="login-page">
            <Header />
            <section className="section login-section">
                <h3>Iniciar Sesión</h3>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Contraseña</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button onClick={handleLogin}>Ingresar</button>
            </section>
        </div>
    );
}

export default Login;
