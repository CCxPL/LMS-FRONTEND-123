import type { AuthUser } from '../types/auth.types';

export const mockUsers: AuthUser[] = [
  // Super Admin
  {
    id: 'super-admin-1',
    name: 'John Super Admin',
    email: 'superadmin@lms.com',
    role: 'super-admin',
    permissions: ['all'],
    courseIds: [],
    teachingCourseIds: [],
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-06-15T10:00:00Z',
  },
  
  // Admins
  {
    id: 'admin-1',
    name: 'Alice Admin',
    email: 'admin@lms.com',
    role: 'admin',
    permissions: ['manage_teachers', 'manage_students', 'manage_courses'],
    courseIds: [],
    teachingCourseIds: [],
    createdAt: '2024-01-15T00:00:00Z',
    lastLogin: '2024-06-15T09:00:00Z',
  },
  {
    id: 'admin-2',
    name: 'Bob Admin',
    email: 'admin2@lms.com',
    role: 'admin',
    permissions: ['manage_teachers', 'manage_students'],
    courseIds: [],
    teachingCourseIds: [],
    createdAt: '2024-02-01T00:00:00Z',
    lastLogin: '2024-06-14T15:00:00Z',
  },
  
  // Teachers
  {
    id: 'teacher-1',
    name: 'Sarah Teacher',
    email: 'teacher@lms.com',
    role: 'teacher',
    permissions: [],
    courseIds: [],
    teachingCourseIds: ['course-1', 'course-3'],
    createdAt: '2024-02-15T00:00:00Z',
    lastLogin: '2024-06-15T08:30:00Z',
  },
  {
    id: 'teacher-2',
    name: 'Mike Instructor',
    email: 'mike@lms.com',
    role: 'teacher',
    permissions: [],
    courseIds: [],
    teachingCourseIds: ['course-2'],
    createdAt: '2024-03-01T00:00:00Z',
    lastLogin: '2024-06-15T09:30:00Z',
  },
  
  // Students
  {
    id: 'student-1',
    name: 'Emma Student',
    email: 'student@lms.com',
    role: 'student',
    permissions: [],
    courseIds: ['course-1', 'course-3'],
    teachingCourseIds: [],
    createdAt: '2024-03-15T00:00:00Z',
    lastLogin: '2024-06-15T10:00:00Z',
  },
  {
    id: 'student-2',
    name: 'James Learner',
    email: 'james@lms.com',
    role: 'student',
    permissions: [],
    courseIds: ['course-1', 'course-2'],
    teachingCourseIds: [],
    createdAt: '2024-03-20T00:00:00Z',
    lastLogin: '2024-06-15T11:00:00Z',
  },
  {
    id: 'student-3',
    name: 'Sophia Student',
    email: 'sophia@lms.com',
    role: 'student',
    permissions: [],
    courseIds: ['course-1', 'course-3'],
    teachingCourseIds: [],
    createdAt: '2024-04-01T00:00:00Z',
    lastLogin: '2024-06-14T16:00:00Z',
  },
  {
    id: 'student-4',
    name: 'Liam Coder',
    email: 'liam@lms.com',
    role: 'student',
    permissions: [],
    courseIds: ['course-2'],
    teachingCourseIds: [],
    createdAt: '2024-04-10T00:00:00Z',
    lastLogin: '2024-06-15T12:00:00Z',
  },
  {
    id: 'student-5',
    name: 'Olivia Dev',
    email: 'olivia@lms.com',
    role: 'student',
    permissions: [],
    courseIds: ['course-2', 'course-3'],
    teachingCourseIds: [],
    createdAt: '2024-04-15T00:00:00Z',
    lastLogin: '2024-06-15T10:30:00Z',
  },
];

// Test credentials
export const TEST_CREDENTIALS = {
  superAdmin: { email: 'superadmin@lms.com', password: 'any' },
  admin: { email: 'admin@lms.com', password: 'any' },
  teacher: { email: 'teacher@lms.com', password: 'any' },
  student: { email: 'student@lms.com', password: 'any' },
};