import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth.types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    const dashboardPaths: Record<UserRole, string> = {
      'super-admin': '/super-admin/dashboard',
      'admin': '/admin/dashboard',
      'teacher': '/teacher/dashboard',
      'student': '/student/dashboard',
    };

    const redirectPath = user ? dashboardPaths[user.role] : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;