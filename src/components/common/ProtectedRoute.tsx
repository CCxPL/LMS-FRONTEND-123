import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';
import ForcePasswordChange from '../../pages/auth/ForcePasswordChange'; // ✅ ADDED

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkMustChangePassword } = useAuth(); // ✅ ADDED checkMustChangePassword
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen text="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ ADDED: Check if user must change password (first login)
  if (checkMustChangePassword && checkMustChangePassword()) {
    return <ForcePasswordChange />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;