# 🛒 Compare App - Price Comparison Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9.0+-orange.svg)](https://firebase.google.com/)
[![PrimeReact](https://img.shields.io/badge/PrimeReact-10.0+-green.svg)](https://primereact.org/)
[![JSDoc](https://img.shields.io/badge/JSDoc-Documented-yellow.svg)](https://jsdoc.app/)
[![License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)

## 📋 Table of Contents | Tabla de Contenidos

- [English Documentation](#english-documentation)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Installation](#installation)
  - [Documentation Generation](#documentation-generation)
  - [Project Structure](#project-structure)
  - [Contributing](#contributing)
- [Documentación en Español](#documentación-en-español)
  - [Descripción General](#descripción-general)
  - [Características](#características)
  - [Stack Tecnológico](#stack-tecnológico)
  - [Instalación](#instalación)
  - [Generación de Documentación](#generación-de-documentación)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Contribuir](#contribuir)

---

## English Documentation

### Overview

Compare App is a modern price comparison platform that helps users find the best deals across different supermarkets and stores. Built with React and Firebase, it provides a seamless experience for comparing prices, finding nearby stores, and discovering the best offers.

### Features

✨ **Core Features:**
- 🔍 **Product Search & Comparison** - Find and compare prices across multiple stores
- 📍 **Store Locator** - Discover nearby branches with interactive maps
- ⭐ **Product Reviews** - Read and write product reviews with rating system
- 🔔 **Smart Notifications** - Get alerts for price drops and new offers
- 👤 **User Authentication** - Secure login with Firebase Auth
- 🌙 **Dark/Light Theme** - Automatic theme detection and manual toggle
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- 🛡️ **Offline Support** - Continue browsing with cached data

🚀 **Advanced Features:**
- QR Code scanner for quick product lookup
- Personalized favorites and shopping lists
- Price history tracking and analytics
- Push notifications for deals
- Multi-language support (Spanish/English)

### Tech Stack

**Frontend:**
- ⚛️ React 18.2.0 with Hooks
- 🎨 PrimeReact UI Components
- 🛣️ React Router DOM for navigation
- 📋 React Hook Form for form management
- 🎯 CSS3 with custom styling

**Backend & Services:**
- 🔥 Firebase Authentication
- 🗄️ Firebase Firestore Database
- ☁️ Firebase Cloud Functions
- 📊 Firebase Analytics

**Development Tools:**
- 📚 JSDoc for comprehensive documentation
- 🔧 Create React App build system
- 📱 PWA ready configuration

### Installation

#### Prerequisites

Make sure you have the following installed:
- **Node.js** (version 16.0 or higher)
- **npm** (version 8.0 or higher) or **yarn**
- **Git** for version control

#### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/compare-app-PF-master.git
   cd compare-app-PF-master
   ```

2. **Install dependencies:**
   ```bash
   # Using npm
   npm install

   # Or using yarn
   yarn install
   ```

3. **Install JSDoc for documentation generation:**
   ```bash
   # Install globally (recommended)
   npm install -g jsdoc

   # Or as dev dependency
   npm install --save-dev jsdoc
   ```

4. **Configure Firebase:**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Cloud Functions
   - Copy your Firebase config to `src/functions/src/firebaseConfig.js`

5. **Environment Setup:**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Add your Firebase configuration
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   ```

6. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

### Documentation Generation

Our project uses **JSDoc** to generate comprehensive API documentation from code comments.

#### Quick Start

Generate documentation with a single command:
```bash
npm run docs
```

#### Manual Generation

You can also generate documentation manually:
```bash
# Using global JSDoc installation
jsdoc -c jsdoc.conf.json

# Using npx (no global installation needed)
npx jsdoc -c jsdoc.conf.json

# With custom output directory
npx jsdoc -c jsdoc.conf.json -d ./custom-docs
```

#### Watch Mode for Development

For automatic documentation updates during development:
```bash
npm run docs:watch
```

#### Documented Files

The following components are fully documented with JSDoc:

**🧩 Core Components:**
- `src/components/Header.js` - Main application header with navigation, search, and user menu
- `src/components/BottomNav.js` - Mobile navigation bar with badges and ripple effects
- `src/components/AddReview.js` - Product review form with validation
- `src/components/BranchCard.js` - Store branch information card with maps integration

**📄 Pages:**
- `src/pages/Login.js` - User authentication page with Firebase integration
- `src/pages/Register.js` - User registration with form validation and Firestore storage

**📋 Documentation Coverage:**
- ✅ All props and their types
- ✅ Function parameters and return values
- ✅ Usage examples for each component
- ✅ JSDoc typedefs for complex objects
- ✅ @since tags for version tracking
- ✅ @throws documentation for error handling

#### Viewing Documentation

After generation, open the documentation:
```bash
# Open in default browser
open docs/index.html

# Or for Windows
start docs/index.html

# Or serve with a local server
npx http-server docs -p 8080
```

#### Documentation Structure

```
docs/
├── index.html              # Main documentation page
├── global.html             # Global functions and typedefs
├── components/
│   ├── Header.html
│   ├── BottomNav.html
│   ├── AddReview.html
│   └── BranchCard.html
├── pages/
│   ├── Login.html
│   └── Register.html
└── styles/                 # Documentation styling
```

### Project Structure

```
compare-app-PF-master/
├── public/                 # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Header.js       # 📄 Documented
│   │   ├── BottomNav.js    # 📄 Documented
│   │   ├── AddReview.js    # 📄 Documented
│   │   └── BranchCard.js   # 📄 Documented
│   ├── pages/              # Page components
│   │   ├── Login.js        # 📄 Documented
│   │   ├── Register.js     # 📄 Documented
│   │   └── Home.js
│   ├── styles/             # CSS stylesheets
│   │   ├── Header.css
│   │   ├── Login.css
│   │   └── global.css
│   ├── functions/          # Firebase Cloud Functions
│   │   └── src/
│   │       └── firebaseConfig.js
│   ├── img/                # Images and assets
│   └── App.js              # Main application component
├── docs/                   # 📚 Generated JSDoc documentation
├── jsdoc.conf.json         # JSDoc configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

### Scripts

```bash
# Development
npm start                   # Start development server
npm run build              # Build for production
npm test                   # Run test suite

# Documentation
npm run docs               # Generate JSDoc documentation
npm run docs:watch         # Generate docs in watch mode

# Firebase
npm run deploy             # Deploy to Firebase Hosting
npm run functions:deploy   # Deploy Cloud Functions
```

### Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

**📝 Documentation Guidelines:**
- All new components must include JSDoc documentation
- Follow the existing documentation patterns
- Include usage examples in your JSDoc comments
- Update this README if adding new features

---

## Documentación en Español

### Descripción General

Compare App es una plataforma moderna de comparación de precios que ayuda a los usuarios a encontrar las mejores ofertas en diferentes supermercados y tiendas. Construida con React y Firebase, proporciona una experiencia fluida para comparar precios, encontrar tiendas cercanas y descubrir las mejores ofertas.

### Características

✨ **Funcionalidades Principales:**
- 🔍 **Búsqueda y Comparación de Productos** - Encuentra y compara precios en múltiples tiendas
- 📍 **Localizador de Tiendas** - Descubre sucursales cercanas con mapas interactivos
- ⭐ **Reseñas de Productos** - Lee y escribe reseñas con sistema de calificación
- 🔔 **Notificaciones Inteligentes** - Recibe alertas de bajadas de precio y nuevas ofertas
- 👤 **Autenticación de Usuarios** - Inicio de sesión seguro con Firebase Auth
- 🌙 **Tema Oscuro/Claro** - Detección automática de tema y cambio manual
- 📱 **Diseño Responsivo** - Optimizado para móvil, tablet y escritorio
- 🛡️ **Soporte Offline** - Continúa navegando con datos en caché

🚀 **Funcionalidades Avanzadas:**
- Escáner de códigos QR para búsqueda rápida de productos
- Favoritos personalizados y listas de compras
- Seguimiento de historial de precios y analíticas
- Notificaciones push para ofertas
- Soporte multiidioma (Español/Inglés)

### Stack Tecnológico

**Frontend:**
- ⚛️ React 18.2.0 con Hooks
- 🎨 Componentes UI de PrimeReact
- 🛣️ React Router DOM para navegación
- 📋 React Hook Form para manejo de formularios
- 🎯 CSS3 con estilos personalizados

**Backend y Servicios:**
- 🔥 Firebase Authentication
- 🗄️ Firebase Firestore Database
- ☁️ Firebase Cloud Functions
- 📊 Firebase Analytics

**Herramientas de Desarrollo:**
- 📚 JSDoc para documentación completa
- 🔧 Sistema de build Create React App
- 📱 Configuración PWA lista

### Instalación

#### Requisitos Previos

Asegúrate de tener instalado:
- **Node.js** (versión 16.0 o superior)
- **npm** (versión 8.0 o superior) o **yarn**
- **Git** para control de versiones

#### Configuración Paso a Paso

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/yourusername/compare-app-PF-master.git
   cd compare-app-PF-master
   ```

2. **Instala las dependencias:**
   ```bash
   # Usando npm
   npm install

   # O usando yarn
   yarn install
   ```

3. **Instala JSDoc para generar documentación:**
   ```bash
   # Instalar globalmente (recomendado)
   npm install -g jsdoc

   # O como dependencia de desarrollo
   npm install --save-dev jsdoc
   ```

4. **Configura Firebase:**
   - Crea un nuevo proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication, Firestore y Cloud Functions
   - Copia tu configuración de Firebase a `src/functions/src/firebaseConfig.js`

5. **Configuración del Entorno:**
   ```bash
   # Copia la plantilla de entorno
   cp .env.example .env.local
   
   # Agrega tu configuración de Firebase
   REACT_APP_FIREBASE_API_KEY=tu_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=tu_project_id
   ```

6. **Inicia el servidor de desarrollo:**
   ```bash
   npm start
   ```

   La aplicación se abrirá en `http://localhost:3000`

### Generación de Documentación

Nuestro proyecto usa **JSDoc** para generar documentación completa de la API desde comentarios en el código.

#### Inicio Rápido

Genera la documentación con un solo comando:
```bash
npm run docs
```

#### Generación Manual

También puedes generar la documentación manualmente:
```bash
# Usando instalación global de JSDoc
jsdoc -c jsdoc.conf.json

# Usando npx (sin instalación global)
npx jsdoc -c jsdoc.conf.json

# Con directorio de salida personalizado
npx jsdoc -c jsdoc.conf.json -d ./docs-personalizado
```

#### Modo Watch para Desarrollo

Para actualizaciones automáticas de documentación durante el desarrollo:
```bash
npm run docs:watch
```

#### Archivos Documentados

Los siguientes componentes están completamente documentados con JSDoc:

**🧩 Componentes Principales:**
- `src/components/Header.js` - Encabezado principal con navegación, búsqueda y menú de usuario
- `src/components/BottomNav.js` - Barra de navegación móvil con badges y efectos ripple
- `src/components/AddReview.js` - Formulario de reseñas de productos con validación
- `src/components/BranchCard.js` - Tarjeta de información de sucursales con integración de mapas

**📄 Páginas:**
- `src/pages/Login.js` - Página de autenticación con integración Firebase
- `src/pages/Register.js` - Registro de usuarios con validación de formularios y almacenamiento en Firestore

**📋 Cobertura de Documentación:**
- ✅ Todas las props y sus tipos
- ✅ Parámetros de funciones y valores de retorno
- ✅ Ejemplos de uso para cada componente
- ✅ Typedefs JSDoc para objetos complejos
- ✅ Tags @since para seguimiento de versiones
- ✅ Documentación @throws para manejo de errores

#### Visualizar la Documentación

Después de la generación, abre la documentación:
```bash
# Abrir en navegador predeterminado
open docs/index.html

# O para Windows
start docs/index.html

# O servir con servidor local
npx http-server docs -p 8080
```

#### Estructura de la Documentación

```
docs/
├── index.html              # Página principal de documentación
├── global.html             # Funciones globales y typedefs
├── components/
│   ├── Header.html
│   ├── BottomNav.html
│   ├── AddReview.html
│   └── BranchCard.html
├── pages/
│   ├── Login.html
│   └── Register.html
└── styles/                 # Estilos de documentación
```

### Estructura del Proyecto

```
compare-app-PF-master/
├── public/                 # Recursos estáticos
│   ├── index.html
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/         # Componentes React reutilizables
│   │   ├── Header.js       # 📄 Documentado
│   │   ├── BottomNav.js    # 📄 Documentado
│   │   ├── AddReview.js    # 📄 Documentado
│   │   └── BranchCard.js   # 📄 Documentado
│   ├── pages/              # Componentes de páginas
│   │   ├── Login.js        # 📄 Documentado
│   │   ├── Register.js     # 📄 Documentado
│   │   └── Home.js
│   ├── styles/             # Hojas de estilo CSS
│   │   ├── Header.css
│   │   ├── Login.css
│   │   └── global.css
│   ├── functions/          # Firebase Cloud Functions
│   │   └── src/
│   │       └── firebaseConfig.js
│   ├── img/                # Imágenes y recursos
│   └── App.js              # Componente principal de la aplicación
├── docs/                   # 📚 Documentación JSDoc generada
├── jsdoc.conf.json         # Configuración de JSDoc
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

### Scripts

```bash
# Desarrollo
npm start                   # Iniciar servidor de desarrollo
npm run build              # Construir para producción
npm test                   # Ejecutar suite de pruebas

# Documentación
npm run docs               # Generar documentación JSDoc
npm run docs:watch         # Generar docs en modo watch

# Firebase
npm run deploy             # Desplegar a Firebase Hosting
npm run functions:deploy   # Desplegar Cloud Functions
```

### Contribuir

¡Damos la bienvenida a las contribuciones! Por favor sigue estos pasos:

1. **Haz un Fork del repositorio**
2. **Crea una rama de funcionalidad:** `git checkout -b feature/funcionalidad-increible`
3. **Haz commit de tus cambios:** `git commit -m 'Agregar funcionalidad increíble'`
4. **Push a la rama:** `git push origin feature/funcionalidad-increible`
5. **Abre un Pull Request**

**📝 Guías de Documentación:**
- Todos los nuevos componentes deben incluir documentación JSDoc
- Sigue los patrones de documentación existentes
- Incluye ejemplos de uso en tus comentarios JSDoc
- Actualiza este README si agregas nuevas funcionalidades

---

## 📞 Support | Soporte

**English:** For questions or support, please open an issue in the GitHub repository or contact our development team.

**Español:** Para preguntas o soporte, por favor abre un issue en el repositorio de GitHub o contacta a nuestro equipo de desarrollo.

## 📄 License | Licencia

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

---

**Made with ❤️ by the Compare App Team | Hecho con ❤️ por el Equipo de Compare App**