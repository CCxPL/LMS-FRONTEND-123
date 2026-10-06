import axiosInstance from '../api/axiosInstance';
import type { AuthUser, LoginCredentials, RegisterData, UserRole } from '../types/auth.types';

const STORAGE_KEY = 'lms_auth_user';

// ✅ Role mapping function — returns UserRole
const mapRole = (role: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'superadmin': 'super-admin',
    'admin': 'admin',
    'teacher': 'teacher',
    'student': 'student',
  };
  return roleMap[role.toLowerCase()] || 'student';
};

// ✅ Helper: API response se AuthUser banao
const buildAuthUser = (user: any, accessToken: string, refreshToken: string): AuthUser => {
  const authUser: AuthUser = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: mapRole(user.role),       // ✅ Now returns UserRole
    avatar: user.avatar,
    courseIds: user.courseIds || [],
    teachingCourseIds: user.teachingCourseIds || [],
    permissions: user.permissions || [],
    createdAt: user.createdAt,
    lastLogin: new Date().toISOString(),
    mustChangePassword: user.mustChangePassword || false,
    defaultPassword: user.defaultPassword || undefined,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);

  return authUser;
};

class AuthService {
  getCurrentUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const res = await axiosInstance.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = res.data.data;
    return buildAuthUser(user, accessToken, refreshToken);
  }

  async forceLogin(credentials: LoginCredentials): Promise<AuthUser> {
    const res = await axiosInstance.post('/auth/force-login', credentials);
    const { user, accessToken, refreshToken } = res.data.data;
    return buildAuthUser(user, accessToken, refreshToken);
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const res = await axiosInstance.post('/auth/register', data);
    const { user, accessToken, refreshToken } = res.data.data;

    const authUser: AuthUser = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: mapRole(user.role),     // ✅ Same fix applied here
      courseIds: [],
      teachingCourseIds: [],
      permissions: [],
      createdAt: user.createdAt,
      lastLogin: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return authUser;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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