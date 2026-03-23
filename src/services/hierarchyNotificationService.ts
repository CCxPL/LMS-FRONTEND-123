import type { Notification, NotificationType } from '../types/notification.types';
import { mockUsers } from '../mockData/users';


class HierarchyNotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notification: Notification) => void)[] = [];

  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(notification: Notification) {
    this.notifications.unshift(notification);
    this.listeners.forEach(cb => cb(notification));
  }

  private createNotification(
    type: NotificationType,
    recipientId: string,
    recipientRole: 'super-admin' | 'admin' | 'teacher' | 'student',
    title: string,
    message: string,
    senderId?: string,
    metadata?: Record<string, any>
  ): Notification {
    const sender = senderId ? mockUsers.find(u => u.id === senderId) : undefined;
    
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      recipientId,
      recipientRole,
      senderId,
      senderName: sender?.name,
      senderRole: sender?.role,
      isRead: false,
      metadata,
      createdAt: new Date().toISOString(),
    };
  }

  // ============================================
  // SUPER ADMIN → ADMIN notifications
  // ============================================
  
  notifyAdminRoleChanged(adminId: string, superAdminId: string, changes: { oldRole?: string; newRole?: string }) {
    const notification = this.createNotification(
      'role_changed',
      adminId,
      'admin',
      '🔄 Your Role Has Been Changed',
      `Your role has been updated by Super Admin. ${changes.oldRole ? `From: ${changes.oldRole}` : ''} ${changes.newRole ? `To: ${changes.newRole}` : ''}`,
      superAdminId,
      changes
    );
    this.notify(notification);
    return notification;
  }

  notifyAdminPermissionChanged(adminId: string, superAdminId: string, action: 'granted' | 'revoked', permission: string) {
    const type = action === 'granted' ? 'permission_granted' : 'permission_revoked';
    const notification = this.createNotification(
      type,
      adminId,
      'admin',
      action === 'granted' ? '✅ Permission Granted' : '❌ Permission Revoked',
      `Your ${permission} permission has been ${action} by Super Admin.`,
      superAdminId,
      { permission, action }
    );
    this.notify(notification);
    return notification;
  }

  notifyAdminDeleted(adminId: string, superAdminId: string) {
    const notification = this.createNotification(
      'user_deleted',
      adminId,
      'admin',
      '🗑️ Account Removed',
      'Your admin account has been removed by Super Admin.',
      superAdminId
    );
    this.notify(notification);
    return notification;
  }

  // ============================================
  // ADMIN → TEACHER notifications
  // ============================================

  notifyTeacherRoleChanged(teacherId: string, adminId: string, changes: { oldRole?: string; newRole?: string }) {
    const notification = this.createNotification(
      'role_changed',
      teacherId,
      'teacher',
      '🔄 Your Role Has Been Changed',
      `Your role has been updated by Admin. ${changes.oldRole ? `From: ${changes.oldRole}` : ''} ${changes.newRole ? `To: ${changes.newRole}` : ''}`,
      adminId,
      changes
    );
    this.notify(notification);
    return notification;
  }

  notifyTeacherCourseAssigned(teacherId: string, adminId: string, courseName: string) {
    const notification = this.createNotification(
      'student_enrolled', // Reusing type
      teacherId,
      'teacher',
      '📚 New Course Assigned',
      `You have been assigned to teach "${courseName}".`,
      adminId,
      { courseName }
    );
    this.notify(notification);
    return notification;
  }

  notifyTeacherDeleted(teacherId: string, adminId: string) {
    const notification = this.createNotification(
      'user_deleted',
      teacherId,
      'teacher',
      '🗑️ Account Removed',
      'Your teacher account has been removed by Admin.',
      adminId
    );
    this.notify(notification);
    return notification;
  }

  // ============================================
  // TEACHER → STUDENT notifications
  // ============================================

  notifyStudentClassScheduled(studentId: string, teacherId: string, className: string, date: string, time: string) {
    const notification = this.createNotification(
      'class_scheduled',
      studentId,
      'student',
      '📅 New Class Scheduled',
      `"${className}" has been scheduled for ${date} at ${time}.`,
      teacherId,
      { className, date, time }
    );
    this.notify(notification);
    return notification;
  }

  notifyStudentClassUpdated(studentId: string, teacherId: string, className: string) {
    const notification = this.createNotification(
      'class_updated',
      studentId,
      'student',
      '✏️ Class Updated',
      `"${className}" has been updated. Please check the new details.`,
      teacherId,
      { className }
    );
    this.notify(notification);
    return notification;
  }

  notifyStudentClassCancelled(studentId: string, teacherId: string, className: string) {
    const notification = this.createNotification(
      'class_cancelled',
      studentId,
      'student',
      '❌ Class Cancelled',
      `"${className}" has been cancelled.`,
      teacherId,
      { className }
    );
    this.notify(notification);
    return notification;
  }

  notifyStudentRemoved(studentId: string, teacherId: string, courseName: string) {
    const notification = this.createNotification(
      'user_deleted',
      studentId,
      'student',
      '📚 Removed from Course',
      `You have been removed from "${courseName}".`,
      teacherId,
      { courseName }
    );
    this.notify(notification);
    return notification;
  }

  // ============================================
  // TEACHER LATE → ADMIN + SUPER ADMIN
  // ============================================

  notifyTeacherLate(teacherName: string, className: string, scheduledTime: string, lateByMinutes: number) {
    const admins = mockUsers.filter(u => u.role === 'admin' || u.role === 'super-admin');
    
    const notifications: Notification[] = [];
    
    admins.forEach(admin => {
      const notification = this.createNotification(
        'teacher_late',
        admin.id,
        admin.role as 'admin' | 'super-admin',
        '⚠️ Teacher Late Alert',
        `${teacherName} is ${lateByMinutes} minutes late for "${className}" (scheduled at ${scheduledTime}).`,
        undefined,
        { teacherName, className, scheduledTime, lateByMinutes }
      );
      this.notify(notification);
      notifications.push(notification);
    });
    
    return notifications;
  }

  // ============================================
  // CLASS SUMMARY → ADMIN + SUPER ADMIN
  // ============================================

  notifyClassSummaryReady(
    teacherName: string,
    courseName: string,
    studentsAttended: number,
    totalStudents: number,
    duration: number
  ) {
    const admins = mockUsers.filter(u => u.role === 'admin' || u.role === 'super-admin');
    
    const notifications: Notification[] = [];
    
    admins.forEach(admin => {
      const notification = this.createNotification(
        'class_summary_ready',
        admin.id,
        admin.role as 'admin' | 'super-admin',
        '📊 Class Summary Ready',
        `Class by ${teacherName} for "${courseName}" has ended. ${studentsAttended}/${totalStudents} attended. Duration: ${duration} mins.`,
        undefined,
        { teacherName, courseName, studentsAttended, totalStudents, duration }
      );
      this.notify(notification);
      notifications.push(notification);
    });
    
    return notifications;
  }

  // ============================================
  // Get notifications for user
  // ============================================

  getNotificationsForUser(userId: string): Notification[] {
    return this.notifications.filter(n => n.recipientId === userId);
  }

  getAllNotifications(): Notification[] {
    return this.notifications;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }
}

export const hierarchyNotificationService = new HierarchyNotificationService();