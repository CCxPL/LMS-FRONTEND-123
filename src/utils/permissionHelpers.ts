// ✅ Import from auth.types instead of mockData/users
import type { UserRole } from '../types/auth.types';

export const canCreateEvent = (role: UserRole): boolean => {
  return ['teacher', 'admin', 'super-admin'].includes(role); // ✅ CHANGED
};

export const canEditEvent = (role: UserRole, eventTeacherId?: string, userId?: string): boolean => {
  if (role === 'super-admin' || role === 'admin') return true; // ✅ CHANGED
  if (role === 'teacher' && eventTeacherId === userId) return true;
  return false;
};

export const canDeleteEvent = (role: UserRole, eventTeacherId?: string, userId?: string): boolean => {
  return canEditEvent(role, eventTeacherId, userId);
};

export const canViewAllCourses = (role: UserRole): boolean => {
  return role === 'super-admin' || role === 'admin'; // ✅ CHANGED
};

export const canManageTeachers = (role: UserRole): boolean => {
  return role === 'super-admin' || role === 'admin'; // ✅ CHANGED
};

export const canViewReports = (role: UserRole): boolean => {
  return ['super-admin', 'admin', 'teacher'].includes(role); // ✅ CHANGED
};

export const canReceiveLateNotification = (role: UserRole): boolean => {
  return role === 'super-admin' || role === 'admin'; // ✅ CHANGED
};