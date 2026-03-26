export type UserRole = 'super-admin' | 'admin' | 'teacher' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  courseIds?: string[];
  teachingCourseIds?: string[];
  permissions?: string[];
  createdAt: string;
  lastLogin?: string;
  mustChangePassword?: boolean;
  defaultPassword?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  checkMustChangePassword: () => boolean;
}