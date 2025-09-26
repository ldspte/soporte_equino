import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // Importa el hook de autenticación

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;