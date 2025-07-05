import React from 'react';
import NavBarHome from './NavBarHome';
import { Outlet } from 'react-router-dom';
const AuthenticatedLayout = () => {
  return (
    <div>
      <NavBarHome />
      <main>
        <Outlet /> {/* Aquí se renderizarán las rutas hijas */}
      </main>
    </div>
  );
};
export default AuthenticatedLayout;