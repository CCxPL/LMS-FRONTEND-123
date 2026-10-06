import axiosInstance from './axiosInstance';

export const getAllFeedbackApi = () =>
  axiosInstance.get('/feedback');

export const updateFeedbackApi = (id: string, data: any) =>
  axiosInstance.put(`/feedback/${id}`, data);

export const deleteFeedbackApi = (id: string) =>
  axiosInstance.delete(`/feedback/${id}`);