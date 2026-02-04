import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Revisa si el token existe al cargar la aplicación
    const token = localStorage.getItem('token');
    return !!token; // `!!` convierte el valor a booleano
  });
  const navigate = useNavigate();

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
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