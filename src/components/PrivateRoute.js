import React from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../functions/src/firebaseConfig'; // 🔥 Importación necesaria

const PrivateRoute = ({ element: Element, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe(); // Limpia el listener cuando el componente se desmonta
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>; // Puedes mostrar un loader o similar mientras verificas la autenticación

  return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;
