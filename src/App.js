// App.js - Versión actualizada con layout corregido
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Importar páginas
import Home from './pages/Home';
import NutritionalScreen from './pages/Nutricional';
import Productos from './pages/Productos';
import Sucursales from './pages/Sucursales';
import Reseñas from './pages/Reseñas';
import Perfil from './pages/Perfil';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

// Importar componentes de layout
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PageLayout from './components/PageLayout';

// Estilos de PrimeReact
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

// Estilos globales de la aplicación
import './styles/GlobalStyles.css';
import './styles/LayoutUtilities.css';

function App() {
    return (
        <div className="global-utilities"> {/* Aplicar namespace de GlobalStyles */}
            <Router>
                <div className="app-container">
                    {/* Header con namespace aplicado correctamente */}
                    <Header 
                        showThemeToggle={true}
                        showNotifications={true}
                    />

                    {/* Rutas con PageLayout para manejar espaciado */}
                    <Routes>
                        {/* Rutas públicas con navegación completa */}
                        <Route 
                            path="/" 
                            element={
                                <PageLayout 
                                    hasBottomNav={true} 
                                    hasHeader={true} 
                                    padding="default"
                                    className="home-layout"
                                >
                                    <Home />
                                </PageLayout>
                            } 
                        />
                        
                        <Route 
                            path="/nutricional" 
                            element={
                                <PageLayout 
                                    hasBottomNav={true} 
                                    hasHeader={true} 
                                    padding="default"
                                    className="nutricional-layout"
                                >
                                    <NutritionalScreen />
                                </PageLayout>
                            } 
                        />
                        
                        <Route 
                            path="/productos" 
                            element={
                                <PageLayout 
                                    hasBottomNav={true} 
                                    hasHeader={true} 
                                    padding="default"
                                    className="productos-layout"
                                >
                                    <Productos />
                                </PageLayout>
                            } 
                        />
                        
                        <Route 
                            path="/sucursales" 
                            element={
                                <PageLayout 
                                    hasBottomNav={true} 
                                    hasHeader={true} 
                                    padding="default"
                                    className="sucursales-layout"
                                >
                                    <Sucursales />
                                </PageLayout>
                            } 
                        />
                        
                        <Route 
                            path="/resenas" 
                            element={
                                <PageLayout 
                                    hasBottomNav={true} 
                                    hasHeader={true} 
                                    padding="default"
                                    className="resenas-layout"
                                >
                                    <Reseñas />
                                </PageLayout>
                            } 
                        />
                        
                        {/* Rutas de autenticación sin navegación */}
                        <Route 
                            path="/login" 
                            element={
                                <PageLayout 
                                    hasBottomNav={false} 
                                    hasHeader={false} 
                                    fullHeight={true}
                                    padding="none"
                                    className="auth-layout"
                                >
                                    <Login />
                                </PageLayout>
                            } 
                        />
                        
                        <Route 
                            path="/register" 
                            element={
                                <PageLayout 
                                    hasBottomNav={false} 
                                    hasHeader={false} 
                                    fullHeight={true}
                                    padding="none"
                                    className="auth-layout"
                                >
                                    <Register />
                                </PageLayout>
                            } 
                        />
                        
                        {/* Rutas protegidas con navegación completa */}
                        <Route 
                            path="/perfil" 
                            element={
                                <PageLayout 
                                    hasBottomNav={true} 
                                    hasHeader={true} 
                                    padding="default"
                                    className="perfil-layout"
                                >
                                    <PrivateRoute element={Perfil} />
                                </PageLayout>
                            } 
                        />
                    </Routes>

                    {/* BottomNav fijo al final */}
                    <BottomNav />
                </div>
            </Router>
        </div>
    );
}

export default App;