import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export const ProtectedRoute = () => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to='/' />;
  }

  if (location.pathname.includes('baby-station') && !auth.getUser()?.isAdmin) {
    return <Navigate to='/dashboard' />;
  }

  return <Outlet />;
};