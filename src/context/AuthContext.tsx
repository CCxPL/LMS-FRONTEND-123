import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, LoginCredentials, RegisterData, AuthUser } from '../types/auth.types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import { connectSocket, disconnectSocket } from '../services/socketService'; // ✅ ADD

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = authService.isAuthenticated();
        if (isAuth) {
          const freshUser = await authService.refreshUserFromServer();
          if (freshUser) {
            setUser(freshUser);
            setIsAuthenticated(true);
            connectSocket(freshUser.id); // ✅ ADD
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
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
      connectSocket(loggedUser.id); // ✅ ADD

      if (loggedUser.mustChangePassword) {
        showToast('Welcome! Please change your default password.', 'info');
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
      connectSocket(registeredUser.id); // ✅ ADD
      showToast('Account created successfully!', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    await authService.logout();
    disconnectSocket(); // ✅ ADD
    setUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const updatedUser = authService.updateUser({
        mustChangePassword: false,
        defaultPassword: undefined,
      });
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [user]);

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
      changePassword,
      checkMustChangePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};