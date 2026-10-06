import axiosInstance from '../api/axiosInstance';
import type { Message, Task, Notification, Feedback } from '../types/data.types';

export const dataService = {
  // ─── Notifications ──────────────────────────────────────────────────────────
  getNotifications: async (_userId: string): Promise<Notification[]> => {
    const res = await axiosInstance.get('/notifications');
    return res.data?.data?.notifications || [];
  },

  addNotification: async (notif: Partial<Notification>): Promise<Notification> => {
    const res = await axiosInstance.post('/notifications', notif);
    return res.data?.data?.notification;
  },

  markRead: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/notifications/${id}/read`);
  },

  markAllRead: async (_userId: string): Promise<void> => {
    await axiosInstance.patch('/notifications/read-all');
  },

  clearNotification: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/notifications/${id}`);
  },

  // ─── Messages ───────────────────────────────────────────────────────────────
  getMessages: async (_userId: string): Promise<Message[]> => {
    const res = await axiosInstance.get('/messages');
    return res.data?.data?.messages || [];
  },

  sendMessage: async (msg: Partial<Message>): Promise<Message> => {
    const res = await axiosInstance.post('/messages', msg);
    return res.data?.data?.message;
  },

  replyMessage: async (id: string, reply: Partial<Message>): Promise<void> => {
    await axiosInstance.post(`/messages/${id}/reply`, reply);
  },

  markMessageRead: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/messages/${id}/read`);
  },

  deleteMessage: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/messages/${id}`);
  },

  // ─── Tasks ──────────────────────────────────────────────────────────────────
  getTasks: async (_userId: string): Promise<Task[]> => {
    const res = await axiosInstance.get('/tasks');
    return res.data?.data?.tasks || [];
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    const res = await axiosInstance.post('/tasks', task);
    return res.data?.data?.task;
  },

  updateTaskStatus: async (id: string, status: Task['status']): Promise<void> => {
    await axiosInstance.patch(`/tasks/${id}/status`, { status });
  },

  addTaskComment: async (id: string, comment: Task['comments'][0]): Promise<void> => {
    await axiosInstance.post(`/tasks/${id}/comments`, comment);
  },

  deleteTask: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/tasks/${id}`);
  },

  // ─── Feedbacks ──────────────────────────────────────────────────────────────
  getFeedbackForTeacher: async (teacherId: string): Promise<Feedback[]> => {
    const res = await axiosInstance.get('/feedback', { params: { recipientId: teacherId } });
    return res.data?.data?.feedbacks || [];
  },

  getFeedbackByStudent: async (_studentId: string): Promise<Feedback[]> => {
    const res = await axiosInstance.get('/feedback/my');
    return res.data?.data?.feedbacks || [];
  },

  submitFeedback: async (fb: Partial<Feedback>): Promise<Feedback> => {
    const res = await axiosInstance.post('/feedback', fb);
    return res.data?.data?.feedback;
  },

  replyFeedback: async (id: string, reply: string): Promise<void> => {
    await axiosInstance.patch(`/feedback/${id}/reply`, { reply });
  },
};