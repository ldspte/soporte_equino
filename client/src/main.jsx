import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './Styles/main.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Aquí está la clave: envuelve tu componente App
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter basename='/'>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);