import type { AuthUser, LoginCredentials, RegisterData } from '../types/auth.types';
import { mockUsers } from '../mockData/users';

const STORAGE_KEY = 'lms_auth_user';

class AuthService {
  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Login attempt:', credentials.email);
    console.log('Available users:', mockUsers.map(u => ({ email: u.email, role: u.role })));

    // Find user in mock data (case insensitive)
    const user = mockUsers.find(
      u => u.email.toLowerCase() === credentials.email.toLowerCase()
    );

    if (!user) {
      console.error('User not found:', credentials.email);
      throw new Error('Invalid email or password');
    }

    console.log('User found:', user.name, user.role);

    // Create auth user with all required fields
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      courseIds: user.courseIds || [],
      teachingCourseIds: user.teachingCourseIds || [],
      permissions: user.permissions || [],
      createdAt: user.createdAt,
      lastLogin: new Date().toISOString(),
    };

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    console.log('Login successful:', authUser);

    return authUser;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const exists = mockUsers.some(
      u => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (exists) {
      throw new Error('Email already registered');
    }

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      courseIds: [],
      teachingCourseIds: [],
      permissions: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    return newUser;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  updateUser(updates: Partial<AuthUser>): AuthUser | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    return updated;
  }
}

export const authService = new AuthService();