import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType, AuthUser } from '../types/auth.types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const usePermissions = () => {
  const { user } = useAuth();

  const canCreateEvent = (): boolean => {
    if (!user) return false;
    return ['super-admin', 'admin', 'teacher'].includes(user.role);
  };

  const canEditEvent = (eventTeacherId?: string): boolean => {
    if (!user) return false;
    if (['super-admin', 'admin'].includes(user.role)) return true;
    if (user.role === 'teacher' && eventTeacherId === user.id) return true;
    return false;
  };

  const canDeleteEvent = (eventTeacherId?: string): boolean => {
    return canEditEvent(eventTeacherId);
  };

  const canViewAllCourses = (): boolean => {
    if (!user) return false;
    return ['super-admin', 'admin'].includes(user.role);
  };

  const canManageUsers = (): boolean => {
    if (!user) return false;
    return ['super-admin', 'admin'].includes(user.role);
  };

  const canViewClassSummary = (): boolean => {
    if (!user) return false;
    return ['super-admin', 'admin', 'teacher'].includes(user.role);
  };

  return {
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,
    canViewAllCourses,
    canManageUsers,
    canViewClassSummary,
  };
};