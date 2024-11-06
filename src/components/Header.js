import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { auth, signOut } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
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
        await signOut(auth);
        navigate('/login');
    };

    return (
        <header className="header-container">
            <div className="header-left">
                <img src={projectLogo || logo} alt="Project Logo" className="header-logo" /> {/* Usa logo predeterminado si no se pasa projectLogo */}
                <h2>Compare</h2>
            </div>
            <nav className="header-navigation">
                <Button label="Inicio" icon="pi pi-home" className="p-button-text" onClick={() => navigate('/')} />
                <Button label="Explorar" icon="pi pi-compass" className="p-button-text" onClick={() => navigate('/explore')} />
                <Button label="Favoritos" icon="pi pi-star" className="p-button-text" onClick={() => navigate('/favorites')} />
            </nav>
            <div className="header-actions">
                <Button icon="pi pi-search" className="p-button-rounded p-button-text" tooltip="Buscar" />
                <Button icon="pi pi-qrcode" label="Qr Code" className="p-button-rounded p-button-outlined" />
                <Button icon={darkMode ? "pi pi-sun" : "pi pi-moon"} className="p-button-rounded p-button-text" onClick={toggleTheme} tooltip="Cambiar tema" />
                {user ? (
                    <div className="header-user">
                        <span>Bienvenido, {user.displayName || "Usuario"}!</span>
                        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-rounded p-button-danger p-button-text" onClick={handleLogout} />
                    </div>
                ) : (
                    <Button label="Iniciar Sesión" icon="pi pi-sign-in" className="p-button-rounded p-button-outlined" onClick={() => navigate('/login')} />
                )}
            </div>
        </header>
    );
};

export default Header;
