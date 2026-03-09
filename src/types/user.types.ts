import type { UserRole } from './auth.types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  avatar?: string;
  mustChangePassword?: boolean; // ✅ ADDED
  defaultPassword?: string; // ✅ ADDED
}

export interface Admin extends User {
  permissions: string[];
  managedTeachers: number;
  managedStudents: number;
}

export interface Teacher extends User {
  specialization: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
  bio?: string;
  joinedDate?: string;
}

export interface Student extends User {
  enrolledCourses: number;
  completedCourses: number;
  averageScore: number;
  grade?: string;
  totalSpent?: number;
}