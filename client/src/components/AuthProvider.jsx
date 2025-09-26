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
    // Esta parte se asegura de que el estado se actualice si el token cambia por alguna razón
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const value = { isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};