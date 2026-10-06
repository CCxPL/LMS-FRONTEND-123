import axiosInstance from '../api/axiosInstance';
import type { Activity } from '../types/activity.types';

export const activityService = {
  // Get all activities (Admin/SuperAdmin)
  getAllActivities: async (): Promise<Activity[]> => {
    const res = await axiosInstance.get('/activity');
    return res.data?.data?.activities || [];
  },

  // Get activities for a specific user
  getUserActivities: async (userId: string): Promise<Activity[]> => {
    const res = await axiosInstance.get(`/activity/user/${userId}`);
    return res.data?.data?.activities || [];
  },

  // Get my activities (logged in user)
  getMyActivities: async (): Promise<Activity[]> => {
    const res = await axiosInstance.get('/activity/my');
    return res.data?.data?.activities || [];
  },

  // Log a new activity
  logActivity: async (data: Partial<Activity>): Promise<Activity> => {
    const res = await axiosInstance.post('/activity', data);
    return res.data?.data?.activity;
  },

  // Get recent activities
  getRecentActivities: async (limit: number = 10): Promise<Activity[]> => {
    const res = await axiosInstance.get('/activity/recent', { params: { limit } });
    return res.data?.data?.activities || [];
  },

  // Get activities by type
  getActivitiesByType: async (type: string): Promise<Activity[]> => {
    const res = await axiosInstance.get('/activity', { params: { type } });
    return res.data?.data?.activities || [];
  },

  // Get activities by course
  getActivitiesByCourse: async (courseId: string): Promise<Activity[]> => {
    const res = await axiosInstance.get('/activity', { params: { courseId } });
    return res.data?.data?.activities || [];
  },

  // Delete activity (Admin only)
  deleteActivity: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/activity/${id}`);
  },
};