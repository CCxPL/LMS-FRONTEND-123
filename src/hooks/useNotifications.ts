import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '../types/notification.types';
import { useAuth } from './useAuth';
import { getUnreadCount, sortNotificationsByDate } from '../utils/notificationHelpers';
import {
  getMyNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../api/notificationApi';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const res = await getMyNotificationsApi();
      const raw = res.data.notifications;

      // Backend data ko frontend Notification type mein map karo
      const mapped: Notification[] = raw.map((n: any) => ({
        id: n._id,
        type: n.type || 'class_scheduled',
        title: n.title,
        message: n.message,
        recipientId: n.userId || user.id,
        recipientRole: user.role,
        senderId: n.createdBy || undefined,
        isRead: n.readBy?.includes(user.id) || false,
        createdAt: n.createdAt,
        metadata: n.metadata || {},
      }));

      const sorted = sortNotificationsByDate(mapped);
      setNotifications(sorted);
      setUnreadCount(getUnreadCount(sorted));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationReadApi(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
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