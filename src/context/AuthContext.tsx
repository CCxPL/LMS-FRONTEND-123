import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, LoginCredentials, RegisterData, AuthUser } from '../types/auth.types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import axiosInstance from '../api/axiosInstance';
import { connectSocket, disconnectSocket } from '../services/socketService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Device conflict state
  const [deviceConflict, setDeviceConflict] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<LoginCredentials | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const isAuth = authService.isAuthenticated();
        if (currentUser && isAuth) {
          setUser(currentUser);
          setIsAuthenticated(true);
          connectSocket(currentUser.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // ✅ Global events listen karo
  useEffect(() => {
    // Kisi aur ne force login kiya — is device ko logout karo
    const handleSessionReplaced = () => {
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      disconnectSocket();
      showToast('You have been logged out. Another device logged into your account.', 'error');
      window.location.href = '/login';
    };

    window.addEventListener('session-replaced', handleSessionReplaced);
    return () => window.removeEventListener('session-replaced', handleSessionReplaced);
  }, [showToast]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
      setIsAuthenticated(true);
      connectSocket(loggedUser.id);

      if (loggedUser.mustChangePassword) {
        showToast('Welcome! Please change your default password.', 'info');
      } else {
        showToast(`Welcome back, ${loggedUser.name}!`, 'success');
      }
    } catch (error: any) {
      // ✅ 409 Device conflict - credentials save karo popup ke liye
      if (error?.response?.status === 409 && error?.response?.data?.code === 'DEVICE_CONFLICT') {
        setPendingCredentials(credentials);
        setDeviceConflict(true);
        throw error; // Login.tsx bhi sun sake
      }
      const message = error instanceof Error ? error.message : 'Login failed';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // ✅ Force login: purani device ka session kill karke login karo
  const forceLogin = useCallback(async () => {
    if (!pendingCredentials) return;
    setIsLoading(true);
    try {
      const loggedUser = await authService.forceLogin(pendingCredentials);
      setUser(loggedUser);
      setIsAuthenticated(true);
      setDeviceConflict(false);
      setPendingCredentials(null);
      connectSocket(loggedUser.id);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');
    } catch (error) {
      showToast('Force login failed. Please try again.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [pendingCredentials, showToast]);

  const dismissDeviceConflict = useCallback(() => {
    setDeviceConflict(false);
    setPendingCredentials(null);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const registeredUser = await authService.register(data);
      setUser(registeredUser);
      setIsAuthenticated(true);
      connectSocket(registeredUser.id);
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
    disconnectSocket();
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const changePassword = useCallback(async (
    oldPassword: string,
    newPassword?: string
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      await axiosInstance.patch('/auth/change-password', {
        oldPassword,
        newPassword: newPassword || oldPassword,
      });

      const updatedUser = authService.updateUser({
        mustChangePassword: false,
        defaultPassword: undefined,
      });

      if (updatedUser) {
        setUser(updatedUser);
      }

      return true;
    } catch (error) {
      console.error('Change password error:', error);
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
      deviceConflict,       // ✅
      login,
      register,
      logout,
      forceLogin,           // ✅
      dismissDeviceConflict, // ✅
      changePassword,
      checkMustChangePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};