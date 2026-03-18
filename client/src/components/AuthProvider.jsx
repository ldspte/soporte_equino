import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Revisa si el token existe al cargar la aplicación
    let token = localStorage.getItem('token');
    
    // Si no está el token solo, buscarlo en el objeto veterinario
    if (!token) {
      const userStorage = localStorage.getItem('veterinario');
      if (userStorage) {
        try {
          const userData = JSON.parse(userStorage);
          token = userData.token;
          if (token) {
            localStorage.setItem('token', token); // Recuperar consistencia
            console.log("Token recuperado desde objeto veterinario en AuthProvider");
          }
        } catch (e) {
          console.error("Error al parsear veterinario:", e);
        }
      }
    }
    
    console.log("AuthProvider inicializado: isAuthenticated =", !!token);
    return !!token;
  });
  const navigate = useNavigate();

  const login = (token) => {
    console.log("Ejecutando login en AuthProvider con token");
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('veterinario');
    setIsAuthenticated(false);
    navigate('/', { replace: true }); // Redirige al login y evita que el usuario vuelva atrás
  };

  useEffect(() => {
    // Interceptor global de fetch para manejar sesiones expiradas
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        // 401 Unauthorized suele significar que no hay token o es inválido
        if (!window.isSessionAlerting) {
          window.isSessionAlerting = true;
          alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
          logout();
          window.isSessionAlerting = false;
        }
      }
      return response;
    };

    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    return () => {
      window.fetch = originalFetch;
    };
  }, [logout]);

  const value = { isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};