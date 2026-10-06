import axiosInstance from '../api/axiosInstance';
import type { Feedback } from '../types/feedback.types';

export const feedbackService = {
  getAllFeedbacks: async (): Promise<Feedback[]> => {
    const res = await axiosInstance.get('/feedback');
    return res.data?.data?.feedbacks || [];
  },

  getMyFeedbacks: async (): Promise<Feedback[]> => {
    const res = await axiosInstance.get('/feedback/my');
    return res.data?.data?.feedbacks || [];
  },

  getFeedbacksByRecipient: async (recipientId: string): Promise<Feedback[]> => {
    const res = await axiosInstance.get('/feedback', { params: { recipientId } });
    return res.data?.data?.feedbacks || [];
  },

  submitFeedback: async (data: Partial<Feedback>): Promise<Feedback> => {
    const res = await axiosInstance.post('/feedback', data);
    return res.data?.data?.feedback;
  },

  updateFeedback: async (id: string, data: Partial<Feedback>): Promise<Feedback> => {
    const res = await axiosInstance.put(`/feedback/${id}`, data);
    return res.data?.data?.feedback;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/feedback/${id}`);
  },

  canEditFeedback: (feedback: Feedback): boolean => {
    return Date.now() - new Date(feedback.createdAt).getTime() < 48 * 60 * 60 * 1000;
  },

  getTimeRemainingForEdit: (feedback: Feedback): { hours: number; minutes: number } => {
    const deadline = new Date(feedback.createdAt).getTime() + 48 * 60 * 60 * 1000;
    const remaining = deadline - Date.now();
    return {
      hours: Math.max(0, Math.floor(remaining / (1000 * 60 * 60))),
      minutes: Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))),
    };
  },

  getFeedbackStats: async () => {
    const res = await axiosInstance.get('/feedback/stats');
    return res.data?.data?.stats;
  },
};