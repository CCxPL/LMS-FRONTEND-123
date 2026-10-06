import axiosInstance from '../api/axiosInstance';
import type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  UserRole,
} from '../types/auth.types';

const STORAGE_KEY = 'lms_auth_user';

const mapRole = (role: string): UserRole => {
  const normalizedRole = role?.trim().toLowerCase();

  const roleMap: Record<string, UserRole> = {
    'super-admin': 'super-admin',
    superadmin: 'super-admin',
    super_admin: 'super-admin',

    admin: 'admin',
    teacher: 'teacher',
    student: 'student',
  };

  const mappedRole = roleMap[normalizedRole];

  if (!mappedRole) {
    throw new Error(
      `Invalid user role received from backend: ${role}`
    );
  }

  return mappedRole;
};

const buildAuthUser = (
  user: any,
  accessToken: string,
  refreshToken: string
): AuthUser => {
  const authUser: AuthUser = {
    id: user?._id || user?.id,
    name: user?.name || '',
    email: user?.email || '',
    role: mapRole(user?.role),
    avatar: user?.avatar,

    courseIds: Array.isArray(user?.courseIds)
      ? user.courseIds
      : [],

    teachingCourseIds: Array.isArray(
      user?.teachingCourseIds
    )
      ? user.teachingCourseIds
      : [],

    permissions: Array.isArray(user?.permissions)
      ? user.permissions
      : [],

    createdAt: user?.createdAt,

    lastLogin: new Date().toISOString(),

    mustChangePassword:
      user?.mustChangePassword ?? false,

    defaultPassword:
      user?.defaultPassword || undefined,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(authUser)
  );

  localStorage.setItem(
    'accessToken',
    accessToken
  );

  localStorage.setItem(
    'refreshToken',
    refreshToken
  );

  return authUser;
};

class AuthService {
  getCurrentUser(): AuthUser | null {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return null;
      }

      const user = JSON.parse(stored) as AuthUser;

      if (!user?.id || !user?.email || !user?.role) {
        this.logout();
        return null;
      }

      return user;
    } catch (error) {
      console.error(
        'Failed to read authenticated user:',
        error
      );

      this.logout();

      return null;
    }
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const accessToken =
      localStorage.getItem('accessToken');

    return Boolean(user && accessToken);
  }

  async login(
    credentials: LoginCredentials
  ): Promise<AuthUser> {
    const res = await axiosInstance.post(
      '/auth/login',
      credentials
    );

    const apiData = res?.data?.data;

    if (!apiData?.user) {
      throw new Error(
        'Invalid login response: user not received'
      );
    }

    if (!apiData?.accessToken) {
      throw new Error(
        'Invalid login response: access token not received'
      );
    }

    const {
      user,
      accessToken,
      refreshToken,
    } = apiData;

    return buildAuthUser(
      user,
      accessToken,
      refreshToken || ''
    );
  }

  async forceLogin(
    credentials: LoginCredentials
  ): Promise<AuthUser> {
    const res = await axiosInstance.post(
      '/auth/force-login',
      credentials
    );

    const apiData = res?.data?.data;

    if (!apiData?.user) {
      throw new Error(
        'Invalid force-login response'
      );
    }

    const {
      user,
      accessToken,
      refreshToken,
    } = apiData;

    return buildAuthUser(
      user,
      accessToken,
      refreshToken || ''
    );
  }

  async register(
    data: RegisterData
  ): Promise<AuthUser> {
    const res = await axiosInstance.post(
      '/auth/register',
      data
    );

    const apiData = res?.data?.data;

    if (!apiData?.user) {
      throw new Error(
        'Invalid registration response'
      );
    }

    const {
      user,
      accessToken,
      refreshToken,
    } = apiData;

    return buildAuthUser(
      user,
      accessToken,
      refreshToken || ''
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  updateUser(
    updates: Partial<AuthUser>
  ): AuthUser | null {
    const current =
      this.getCurrentUser();

    if (!current) {
      return null;
    }

    const updated: AuthUser = {
      ...current,
      ...updates,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    return updated;
  }
}

export const authService =
  new AuthService();