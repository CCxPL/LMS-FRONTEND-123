import type { User, Admin, Teacher, Student } from '../types/user.types';
import type { UserRole } from '../types/auth.types';
import { MOCK_USERS_DATA } from '../utils/constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ✅ ADDED: Generate default password (1-8 digits based on user ID)
const generateDefaultPassword = (userId: string): string => {
  const last8 = userId.slice(-8).replace(/[^0-9]/g, '');
  return last8.padStart(8, '1'); // Minimum 8 digits: "12345678"
};

let users: User[] = [...MOCK_USERS_DATA as User[]];

const isUserNew = (createdAt: string) => {
  const diffTime = Math.abs(new Date().getTime() - new Date(createdAt).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays <= 3;
};

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    await delay(500);
    return users;
  },

  // ✅ UPDATED: Add mustChangePassword and defaultPassword
  importBulkUsers: async (newUsers: any[]): Promise<{ added: number; roles: Record<string, number> }> => {
    await delay(800);
    
    const counts: Record<string, number> = { student: 0, teacher: 0, admin: 0, 'super-admin': 0 };
    
    const formattedUsers: User[] = newUsers.map((u, idx) => {
      let role = (u.role?.toLowerCase() || 'student') as UserRole;
      if (!['student', 'teacher', 'admin', 'super-admin'].includes(role)) {
        role = 'student';
      }

      if (counts[role] !== undefined) counts[role]++;

      const userId = `imported-${Date.now()}-${idx}`;
      const defaultPassword = generateDefaultPassword(userId); // ✅ ADDED

      return {
        id: userId,
        name: u.name || 'Unknown User',
        email: u.email || `user${idx}@university.com`,
        role: role,
        status: (u.status?.toLowerCase() === 'active' ? 'active' : 'pending') as User['status'],
        createdAt: new Date().toISOString(),
        phone: u.phone || '',
        avatar: '',
        mustChangePassword: true, // ✅ ADDED
        defaultPassword: defaultPassword, // ✅ ADDED
        specialization: role === 'teacher' ? u.specialization || 'General' : undefined,
        permissions: role === 'admin' ? ['view-analytics'] : undefined
      } as User;
    });

    users = [...formattedUsers, ...users];

    return { added: formattedUsers.length, roles: counts };
  },

  getTeachers: async (): Promise<(Teacher & { isNew: boolean })[]> => {
    await delay(400);
    return users
      .filter((u): u is User & { role: 'teacher' } => u.role === 'teacher')
      .map(u => ({
        ...u,
        specialization: (u as any).specialization || 'General',
        coursesCount: (u as any).coursesCount || 0,
        studentsCount: (u as any).studentsCount || 0,
        rating: (u as any).rating || 0,
        joinedDate: u.createdAt,
        bio: (u as any).bio,
        isNew: isUserNew(u.createdAt)
      } as Teacher & { isNew: boolean }));
  },

  getStudents: async (): Promise<(Student & { isNew: boolean })[]> => {
    await delay(400);
    return users
      .filter((u): u is User & { role: 'student' } => u.role === 'student')
      .map(u => ({
        ...u,
        enrolledCourses: (u as any).enrolledCourses || 0,
        completedCourses: (u as any).completedCourses || 0,
        averageScore: (u as any).averageScore || 0,
        grade: (u as any).grade || 'N/A',
        totalSpent: (u as any).totalSpent || 0,
        isNew: isUserNew(u.createdAt)
      } as Student & { isNew: boolean }));
  },

  getAdmins: async (): Promise<(Admin & { isNew: boolean })[]> => {
    await delay(400);
    return users
      .filter((u): u is User & { role: 'admin' | 'super-admin' } => u.role === 'admin' || u.role === 'super-admin')
      .map(u => ({
        ...u,
        permissions: (u as any).permissions || ['manage-teachers', 'manage-courses', 'manage-students', 'view-analytics'],
        managedTeachers: (u as any).managedTeachers || 0,
        managedStudents: (u as any).managedStudents || 0,
        isNew: isUserNew(u.createdAt)
      } as Admin & { isNew: boolean }));
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    await delay(300);
    return users.find(u => u.id === id);
  },

  // ✅ UPDATED: Add mustChangePassword and defaultPassword on creation
  createUser: async (userData: Partial<User>): Promise<User> => {
    await delay(500);
    
    const userId = Date.now().toString();
    const defaultPassword = generateDefaultPassword(userId); // ✅ ADDED
    
    const newUser: User = {
      id: userId,
      name: userData.name || 'Unknown User',
      email: userData.email || '',
      role: (userData.role as UserRole) || 'student',
      status: 'active',
      createdAt: new Date().toISOString(),
      phone: userData.phone,
      avatar: userData.avatar,
      mustChangePassword: true, // ✅ ADDED
      defaultPassword: defaultPassword // ✅ ADDED
    };
    
    users = [newUser, ...users];
    return newUser;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    await delay(400);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    return users[index];
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await delay(400);
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    return users.length < initialLength;
  },

  updateUserStatus: async (id: string, status: User['status']): Promise<User | null> => {
    await delay(300);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], status };
    return users[index];
  },

  searchUsers: async (query: string): Promise<User[]> => {
    await delay(300);
    const lowerQuery = query.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lowerQuery) ||
      u.email.toLowerCase().includes(lowerQuery)
    );
  },

  getUsersByRole: async (role: UserRole): Promise<User[]> => {
    await delay(300);
    return users.filter(u => u.role === role);
  },

  getStats: async () => {
    await delay(300);
    return {
      totalUsers: users.length,
      totalTeachers: users.filter(u => u.role === 'teacher').length,
      totalStudents: users.filter(u => u.role === 'student').length,
      totalAdmins: users.filter(u => u.role === 'admin' || u.role === 'super-admin').length,
      activeUsers: users.filter(u => u.status === 'active').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length
    };
  }
};