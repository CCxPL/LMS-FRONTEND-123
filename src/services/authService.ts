import type { AuthUser, LoginCredentials, RegisterData } from '../types/auth.types';
import { loginApi, registerApi, logoutApi, getMeApi } from '../api/authApi';

const STORAGE_KEY = 'lms_auth_user';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Backend role → Frontend role map
const roleMap: Record<string, string> = {
  'SuperAdmin': 'super-admin',
  'Admin': 'admin',
  'Teacher': 'teacher',
  'Student': 'student',
};

const mapRole = (backendRole: string): string => {
  return roleMap[backendRole] || backendRole.toLowerCase();
};

class AuthService {
  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const res = await loginApi(credentials);

    const { user, accessToken, refreshToken } = res.data;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    const authUser: AuthUser = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: mapRole(user.role) as any,
      courseIds: [],
      teachingCourseIds: [],
      permissions: [],
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      mustChangePassword: false,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    return authUser;
  }

  async register(data: RegisterData): Promise<AuthUser> {
    // Role map reverse karo frontend → backend
    const roleReverseMap: Record<string, string> = {
      'super-admin': 'SuperAdmin',
      'admin': 'Admin',
      'teacher': 'Teacher',
      'student': 'Student',
    };

    const res = await registerApi({
      name: data.name,
      email: data.email,
      password: data.password,
      role: roleReverseMap[data.role] || 'Student',
    });

    const { user, accessToken, refreshToken } = res.data;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    const authUser: AuthUser = {
      id: user.id || user._id, 
      name: user.name,
      email: user.email,
      role: mapRole(user.role) as any,
      courseIds: [],
      teachingCourseIds: [],
      permissions: [],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      mustChangePassword: false,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    return authUser;
  }

  async logout(): Promise<void> {
    try {
      await logoutApi();
    } catch {
      // silently fail
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  async refreshUserFromServer(): Promise<AuthUser | null> {
    try {
      const res = await getMeApi();
      const user = res.data.user;

      const authUser: AuthUser = {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: mapRole(user.role) as any,
        courseIds: [],
        teachingCourseIds: [],
        permissions: [],
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        mustChangePassword: false,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      return authUser;
    } catch {
      return null;
    }
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