import type { Notification, NotificationPayload } from '../types/notification.types';
import type { CalendarEvent } from '../types/calendar.types';
import { mockUsers } from '../mockData/users';
import { createNotificationMessage, getNotificationTitle } from '../utils/notificationHelpers';

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notification: Notification) => void)[] = [];

  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(notification: Notification) {
    this.listeners.forEach(callback => callback(notification));
  }

  sendNotification(payload: NotificationPayload, event?: CalendarEvent, customData?: any): Notification[] {
    const createdNotifications: Notification[] = [];

    payload.recipientIds.forEach(recipientId => {
      const recipient = mockUsers.find(u => u.id === recipientId);
      if (!recipient) return;

      const notification: Notification = {
        id: `notif-${Date.now()}-${recipientId}`,
        type: payload.type,
        title: getNotificationTitle(payload.type),
        message: payload.customMessage || createNotificationMessage(payload.type, event, customData),
        recipientId,
        recipientRole: recipient.role,
        isRead: false,
        eventId: payload.eventId,
        createdAt: new Date().toISOString(),
      };

      this.notifications.push(notification);
      createdNotifications.push(notification);
      this.notifyListeners(notification);
    });

    return createdNotifications;
  }

  notifyClassScheduled(event: CalendarEvent) {
    const course = mockUsers.filter(u => 
      u.role === 'student' && u.courseIds?.includes(event.courseId)
    );
    
    const recipientIds = course.map(u => u.id);

    return this.sendNotification(
      {
        type: 'class_scheduled',
        recipientIds,
        eventId: event.id,
      },
      event
    );
  }

  notifyClassUpdated(event: CalendarEvent) {
    const course = mockUsers.filter(u => 
      u.role === 'student' && u.courseIds?.includes(event.courseId)
    );
    
    const recipientIds = course.map(u => u.id);

    return this.sendNotification(
      {
        type: 'class_updated',
        recipientIds,
        eventId: event.id,
      },
      event
    );
  }

  notifyClassCancelled(event: CalendarEvent) {
    const course = mockUsers.filter(u => 
      u.role === 'student' && u.courseIds?.includes(event.courseId)
    );
    
    const recipientIds = course.map(u => u.id);

    return this.sendNotification(
      {
        type: 'class_cancelled',
        recipientIds,
        eventId: event.id,
      },
      event
    );
  }

  notifyTeacherLate(event: CalendarEvent) {
    // ✅ CHANGED: Using 'super-admin' instead of 'super_admin'
    const admins = mockUsers.filter(u => u.role === 'admin' || u.role === 'super-admin');
    const recipientIds = admins.map(u => u.id);

    return this.sendNotification(
      {
        type: 'teacher_late',
        recipientIds,
        eventId: event.id,
      },
      event
    );
  }

  notifyRoleChange(userId: string, oldRole: string, newRole: string) {
    return this.sendNotification(
      {
        type: 'role_changed',
        recipientIds: [userId],
      },
      undefined,
      { oldRole, newRole }
    );
  }

  notifyStudentEnrolled(studentId: string, courseName: string) {
    return this.sendNotification(
      {
        type: 'student_enrolled',
        recipientIds: [studentId],
      },
      undefined,
      { courseName }
    );
  }

  getNotificationsForUser(userId: string): Notification[] {
    return this.notifications.filter(n => n.recipientId === userId);
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }
}

export const notificationService = new NotificationService();