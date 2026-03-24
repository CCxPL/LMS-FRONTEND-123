import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, LoginCredentials, RegisterData, AuthUser } from '../types/auth.types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        if (currentUser && isAuth) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
      setIsAuthenticated(true);
      
      // ✅ ADDED: Check first login
      if (loggedUser.mustChangePassword) {
        showToast(`Welcome! Please change your default password.`, 'info');
      } else {
        showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const registeredUser = await authService.register(data);
      setUser(registeredUser);
      setIsAuthenticated(true);
      showToast('Account created successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  // ✅ ADDED: Change Password
  const changePassword = useCallback(async (oldPassword: string,): Promise<boolean> => {
    if (!user) return false;

    if (oldPassword !== user.defaultPassword) {
      return false;
    }

    const updatedUser = await authService.updateUser({
      mustChangePassword: false,
      defaultPassword: undefined
    });

    if (updatedUser) {
      setUser(updatedUser);
      return true;
    }

    return false;
  }, [user]);

  // ✅ ADDED: Check Must Change Password
  const checkMustChangePassword = useCallback((): boolean => {
    return user?.mustChangePassword === true;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      changePassword, // ✅ ADDED
      checkMustChangePassword // ✅ ADDED
    }}>
      {children}
    </AuthContext.Provider>
  );
};