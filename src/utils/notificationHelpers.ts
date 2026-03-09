import type { Notification, NotificationType } from '../types/notification.types';
import type { CalendarEvent } from '../types/calendar.types';
import { formatTime12hr } from './dateHelpers';

/**
 * Get notification title based on type
 */
export const getNotificationTitle = (type: NotificationType): string => {
  const titles: Record<NotificationType, string> = {
    class_scheduled: '📅 New Class Scheduled',
    class_updated: '✏️ Class Updated',
    class_cancelled: '❌ Class Cancelled',
    teacher_late: '⚠️ Teacher Late Alert',
    role_changed: '🔄 Role Changed',
    student_enrolled: '🎓 Enrollment Successful',
    student_joined: '👋 Student Joined',
    student_left: '👋 Student Left',
    class_started: '🟢 Class Started',
    class_ended: '🔴 Class Ended',
    class_summary_ready: '📊 Class Summary Ready',
    permission_granted: '✅ Permission Granted',
    permission_revoked: '❌ Permission Revoked',
    user_deleted: '🗑️ User Removed',
    user_suspended: '⛔ User Suspended',
  };
  
  return titles[type] || 'Notification';
};

/**
 * Create notification message based on type
 */
export const createNotificationMessage = (
  type: NotificationType,
  event?: CalendarEvent,
  customData?: Record<string, any>
): string => {
  switch (type) {
    case 'class_scheduled':
      return event 
        ? `New ${event.type} "${event.title}" scheduled for ${event.date} at ${formatTime12hr(event.startTime)}`
        : 'A new class has been scheduled';
    
    case 'class_updated':
      return event
        ? `${event.type === 'class' ? 'Class' : 'Test'} "${event.title}" has been updated`
        : 'Class details have been updated';
    
    case 'class_cancelled':
      return event
        ? `${event.type === 'class' ? 'Class' : 'Test'} "${event.title}" on ${event.date} has been cancelled`
        : 'A class has been cancelled';
    
    case 'teacher_late':
      return event
        ? `⚠️ Teacher ${event.teacherName} has not joined "${event.title}" (scheduled at ${formatTime12hr(event.startTime)})`
        : 'Teacher is late for the class';
    
    case 'role_changed':
      return customData
        ? `Your role has been changed from ${customData.oldRole} to ${customData.newRole}`
        : 'Your role has been updated';
    
    case 'student_enrolled':
      return customData
        ? `You have been enrolled in ${customData.courseName}`
        : 'You have been enrolled in a new course';

    case 'student_joined':
      return customData
        ? `${customData.studentName} joined the class`
        : 'A student joined the class';
    
    case 'student_left':
      return customData
        ? `${customData.studentName} left the class`
        : 'A student left the class';
    
    case 'class_started':
      return event
        ? `"${event.title}" has started. Join now!`
        : 'Class has started';
    
    case 'class_ended':
      return event
        ? `"${event.title}" has ended`
        : 'Class has ended';
    
    case 'class_summary_ready':
      return event
        ? `Class summary for "${event.title}" is now available`
        : 'Class summary is ready';
    
    case 'permission_granted':
      return customData
        ? `You have been granted ${customData.permission} permission`
        : 'New permission granted';
    
    case 'permission_revoked':
      return customData
        ? `Your ${customData.permission} permission has been revoked`
        : 'Permission revoked';
    
    case 'user_deleted':
      return 'Your account has been removed from the platform';
    
    case 'user_suspended':
      return 'Your account has been suspended';
    
    default:
      return 'You have a new notification';
  }
};

/**
 * Sort notifications by date (newest first)
 */
export const sortNotificationsByDate = (notifications: Notification[]): Notification[] => {
  return [...notifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Get unread notification count
 */
export const getUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.isRead).length;
};

/**
 * Filter notifications by type
 */
export const filterNotificationsByType = (
  notifications: Notification[],
  types: NotificationType[]
): Notification[] => {
  return notifications.filter(n => types.includes(n.type));
};