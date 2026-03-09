export type NotificationType = 
  | 'class_scheduled' 
  | 'class_updated' 
  | 'class_cancelled' 
  | 'teacher_late' 
  | 'role_changed' 
  | 'student_enrolled'
  | 'student_joined'
  | 'student_left'
  | 'class_started'
  | 'class_ended'
  | 'class_summary_ready'
  | 'permission_granted'
  | 'permission_revoked'
  | 'user_deleted'
  | 'user_suspended';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  recipientRole: 'super-admin' | 'admin' | 'teacher' | 'student';
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  isRead: boolean;
  eventId?: string;
  courseId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationPayload {
  type: NotificationType;
  recipientIds: string[];
  senderId?: string;
  eventId?: string;
  courseId?: string;
  customMessage?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: NotificationType[];
}