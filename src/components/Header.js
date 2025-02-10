import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { auth } from '../functions/src/firebaseConfig'; // 🔥 Importación necesaria
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth'; // 🔥 Importación necesaria
import logo from '../img/logo.jpg'; // Importa el logo predeterminado
import '../styles/Header.css';

const Header = ({ projectLogo }) => {
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth); // ✅ Ahora está definido
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <img src={projectLogo || logo} alt="Project Logo" className="header-logo" />
                <h2>Compare</h2>
            </div>
            
            <div className="header-actions">
                <Button icon="pi pi-search" className="p-button-rounded p-button-text" tooltip="Buscar" />
                <Button icon="pi pi-qrcode" className="p-button-rounded p-button-outlined" />
                <Button icon={darkMode ? "pi pi-sun" : "pi pi-moon"} className="p-button-rounded p-button-text" onClick={toggleTheme} tooltip="Cambiar tema" />
                {user ? (
                    <div className="header-user">
                        <span>Bienvenido, {user.displayName || "Usuario"}!</span>
                        <Button icon="pi pi-sign-out" className="p-button-rounded p-button-danger p-button-text" onClick={handleLogout} />
                    </div>
                ) : (
                    <Button icon="pi pi-sign-in" className="p-button-rounded p-button-outlined" onClick={() => navigate('/login')} />
                )}
            </div>
        </header>
    );
};

export default Header;
