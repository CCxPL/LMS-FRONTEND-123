import type { NotificationPayload } from '../types/notification.types';
import type { CalendarEvent } from '../types/calendar.types';
import { createNotificationMessage, getNotificationTitle } from '../utils/notificationHelpers';
import {
  createNotificationApi,
  markNotificationReadApi,
} from '../api/notificationApi';

class NotificationService {
  private listeners: ((notification: any) => void)[] = [];

  subscribe(callback: (notification: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(notification: any) {
    this.listeners.forEach(callback => callback(notification));
  }

  async sendNotification(payload: NotificationPayload, event?: CalendarEvent, customData?: any) {
    const title = getNotificationTitle(payload.type);
    const message = payload.customMessage || createNotificationMessage(payload.type, event, customData);

    try {
      const res = await createNotificationApi({
        title,
        message,
        type: payload.type,
        userId: payload.recipientIds?.[0],
        role: 'all',
      });
      const notification = res.data.notification;
      this.notifyListeners(notification);
      return [notification];
    } catch (error) {
      console.error('Failed to send notification:', error);
      return [];
    }
  }

  async notifyClassScheduled(event: CalendarEvent) {
    return this.sendNotification({ type: 'class_scheduled', recipientIds: [], eventId: event.id }, event);
  }

  async notifyClassUpdated(event: CalendarEvent) {
    return this.sendNotification({ type: 'class_updated', recipientIds: [], eventId: event.id }, event);
  }

  async notifyClassCancelled(event: CalendarEvent) {
    return this.sendNotification({ type: 'class_cancelled', recipientIds: [], eventId: event.id }, event);
  }

  async notifyTeacherLate(event: CalendarEvent) {
    return this.sendNotification({ type: 'teacher_late', recipientIds: [], eventId: event.id }, event);
  }

  async notifyRoleChange(userId: string, oldRole: string, newRole: string) {
    return this.sendNotification({ type: 'role_changed', recipientIds: [userId] }, undefined, { oldRole, newRole });
  }

  async notifyStudentEnrolled(studentId: string, courseName: string) {
    return this.sendNotification({ type: 'student_enrolled', recipientIds: [studentId] }, undefined, { courseName });
  }

  async markAsRead(notificationId: string) {
    try {
      await markNotificationReadApi(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }
}

export const notificationService = new NotificationService();