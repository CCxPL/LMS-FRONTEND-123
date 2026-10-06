import axiosInstance from '../api/axiosInstance';
import type { Notification } from '../types/notification.types';

class NotificationService {
  async getNotificationsForUser(_userId: string): Promise<Notification[]> {
    const res = await axiosInstance.get('/notifications');
    return res.data?.data?.notifications || [];
  }

  async markAsRead(notificationId: string): Promise<void> {
    await axiosInstance.patch(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await axiosInstance.patch('/notifications/mark-all-read');
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  }

  // Legacy method — socket se real-time aata hai, ye nahi chahiye
  // Rakha hai taaki koi component import break na ho
  sendNotification(_payload: any, _event?: any): any[] {
    return [];
  }

  notifyClassScheduled(_event: any): any[] { return []; }
  notifyClassUpdated(_event: any): any[] { return []; }
  notifyClassCancelled(_event: any): any[] { return []; }
  notifyTeacherLate(_event: any): any[] { return []; }
  notifyRoleChange(_userId: string, _oldRole: string, _newRole: string): any[] { return []; }
  notifyStudentEnrolled(_studentId: string, _courseName: string): any[] { return []; }
  subscribe(_cb: any): () => void { return () => {}; }
}

export const notificationService = new NotificationService();