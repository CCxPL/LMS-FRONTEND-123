import type { UserRole } from '../types/auth.types';
import {
  getAllUsersApi,
  getUserByIdApi,
  updateUserApi,
  deleteUserApi,
} from '../api/userApi';
import { getAdminStudentsApi, getAdminTeachersApi } from '../api/adminApi';

const isUserNew = (createdAt: string) => {
  const diffTime = Math.abs(new Date().getTime() - new Date(createdAt).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

const mapUser = (u: any) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role?.toLowerCase().replace('superadmin', 'super-admin'),
  status: u.status || 'active',
  createdAt: u.createdAt,
  phone: u.phone,
  avatar: u.avatar,
  mustChangePassword: u.mustChangePassword || false,
});

export const userService = {
  getAllUsers: async () => {
    const res = await getAllUsersApi();
    return res.data.users.map(mapUser);
  },

  getTeachers: async () => {
    const res = await getAdminTeachersApi();
    return res.data.teachers.map((u: any) => ({
      ...mapUser(u),
      specialization: u.specialization || 'General',
      coursesCount: u.coursesCount || 0,
      studentsCount: u.studentsCount || 0,
      rating: u.rating || 0,
      joinedDate: u.createdAt,
      bio: u.bio,
      isNew: isUserNew(u.createdAt),
    }));
  },

  getStudents: async () => {
    const res = await getAdminStudentsApi();
    return res.data.students.map((u: any) => ({
      ...mapUser(u),
      enrolledCourses: u.enrolledCourses || 0,
      completedCourses: u.completedCourses || 0,
      averageScore: u.averageScore || 0,
      grade: u.grade || 'N/A',
      totalSpent: u.totalSpent || 0,
      isNew: isUserNew(u.createdAt),
    }));
  },

  getAdmins: async () => {
    const res = await getAllUsersApi();
    return res.data.users
      .filter((u: any) => u.role === 'Admin' || u.role === 'SuperAdmin')
      .map((u: any) => ({
        ...mapUser(u),
        permissions: u.permissions || ['manage-teachers', 'manage-courses', 'manage-students', 'view-analytics'],
        managedTeachers: u.managedTeachers || 0,
        managedStudents: u.managedStudents || 0,
        isNew: isUserNew(u.createdAt),
      }));
  },

  getUserById: async (id: string) => {
    const res = await getUserByIdApi(id);
    return mapUser(res.data.user);
  },

  updateUser: async (id: string, updates: any) => {
    const res = await updateUserApi(id, updates);
    return mapUser(res.data.user);
  },

  deleteUser: async (id: string) => {
    await deleteUserApi(id);
    return true;
  },

  updateUserStatus: async (id: string, status: string) => {
    const res = await updateUserApi(id, { status });
    return mapUser(res.data.user);
  },

  getUsersByRole: async (role: UserRole) => {
    const res = await getAllUsersApi();
    const backendRole = role === 'super-admin' ? 'SuperAdmin' : role.charAt(0).toUpperCase() + role.slice(1);
    return res.data.users
      .filter((u: any) => u.role === backendRole)
      .map(mapUser);
  },

  getStats: async () => {
    const res = await getAllUsersApi();
    const users = res.data.users;
    return {
      totalUsers: users.length,
      totalTeachers: users.filter((u: any) => u.role === 'Teacher').length,
      totalStudents: users.filter((u: any) => u.role === 'Student').length,
      totalAdmins: users.filter((u: any) => u.role === 'Admin' || u.role === 'SuperAdmin').length,
      activeUsers: users.filter((u: any) => u.status === 'active').length,
      suspendedUsers: users.filter((u: any) => u.status === 'suspended').length,
    };
  },
};