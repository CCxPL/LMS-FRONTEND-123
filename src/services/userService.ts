import axiosInstance from '../api/axiosInstance';
import type { User } from '../types/user.types';
import type { UserRole } from '../types/auth.types';

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const res = await axiosInstance.get('/users');
    return res.data?.data?.users || [];
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    const res = await axiosInstance.get(`/users/${id}`);
    return res.data?.data?.user;
  },

  getTeachers: async () => {
    const res = await axiosInstance.get('/admin/teachers');
    return res.data?.data?.teachers || [];
  },

  getStudents: async () => {
    const res = await axiosInstance.get('/admin/students');
    return res.data?.data?.students || [];
  },

  getAdmins: async () => {
    const res = await axiosInstance.get('/superadmin/admins');
    return res.data?.data?.admins || [];
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const res = await axiosInstance.post('/users', userData);
    return res.data?.data?.user;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    const res = await axiosInstance.put(`/users/${id}`, updates);
    return res.data?.data?.user;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await axiosInstance.delete(`/users/${id}`);
    return true;
  },

  updateUserStatus: async (id: string, status: User['status']): Promise<User | null> => {
    const res = await axiosInstance.patch(`/users/${id}/status`, { status });
    return res.data?.data?.user;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const res = await axiosInstance.get('/users', { params: { search: query } });
    return res.data?.data?.users || [];
  },

  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    const res = await axiosInstance.get('/users', { params: { role } });
    return res.data?.data?.users || [];
  },

  importBulkUsers: async (newUsers: any[]) => {
    const res = await axiosInstance.post('/users/bulk-import', { users: newUsers });
    return res.data?.data || { added: 0, roles: {} };
  },

  getStats: async () => {
    const res = await axiosInstance.get('/dashboard/stats');
    return res.data?.data?.stats;
  },
};