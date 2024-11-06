// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Nutricional from './pages/Nutricional';
import Productos from './pages/Productos';
import Reseñas from './pages/Reseñas';
import Perfil from './pages/Perfil';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';  // Tema de PrimeReact
import 'primereact/resources/primereact.min.css';           // Componentes de PrimeReact

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/nutricional" element={<Nutricional />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/resenas" element={<Reseñas />} />
                
                {/* Protege la ruta de perfil */}
                <Route path="/perfil" element={<PrivateRoute element={Perfil} />} />
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
