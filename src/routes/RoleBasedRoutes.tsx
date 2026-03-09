import type { UserRole } from '../types/auth.types';

export const getDashboardPath = (role: UserRole): string => {
  const paths: Record<UserRole, string> = {
    'super-admin': '/super-admin/dashboard', // ✅ CHANGED
    'admin': '/admin/dashboard',
    'teacher': '/teacher/dashboard',
    'student': '/student/dashboard',
  };
  return paths[role] || '/login';
};

export const getBasePath = (role: UserRole): string => {
  const paths: Record<UserRole, string> = {
    'super-admin': '/super-admin', // ✅ CHANGED
    'admin': '/admin',
    'teacher': '/teacher',
    'student': '/student',
  };
  return paths[role] || '/';
};

export const canAccessRoute = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

export const roleHierarchy: Record<UserRole, number> = {
  'super-admin': 4, // ✅ CHANGED
  'admin': 3,
  'teacher': 2,
  'student': 1,
};

export const hasHigherOrEqualRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};