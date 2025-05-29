// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Nutricional from './pages/Nutricional';
import Productos from './pages/Productos';
import Sucursales from './pages/Sucursales';
import Reseñas from './pages/Reseñas';
import Perfil from './pages/Perfil';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

// Estilos de PrimeReact
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

// Estilos globales de la aplicación
import './styles/GlobalStyles.css';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/nutricional" element={<Nutricional />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/sucursales" element={<Sucursales />} />
                    <Route path="/resenas" element={<Reseñas />} />
                    
                    {/* Rutas de autenticación */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Rutas protegidas */}
                    <Route 
                        path="/perfil" 
                        element={<PrivateRoute element={Perfil} />} 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;