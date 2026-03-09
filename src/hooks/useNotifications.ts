import { useState, useEffect, useCallback } from 'react';
import  type { Notification } from '../types/notification.types';
import { useAuth } from './useAuth';
import { mockNotifications } from '../mockData/notifications';
import { getUnreadCount, sortNotificationsByDate } from '../utils/notificationHelpers';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(() => {
    if (!user) return;
    
    const userNotifications = mockNotifications.filter(
      n => n.recipientId === user.id || n.recipientRole === user.role
    );
    
    const sorted = sortNotificationsByDate(userNotifications);
    setNotifications(sorted);
    setUnreadCount(getUnreadCount(sorted));
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    refreshNotifications: fetchNotifications,
  };
};