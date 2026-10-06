import axiosInstance from '../api/axiosInstance';
import type { Batch } from '../types/batch.types';

export const batchService = {
  getBatchesByCourse: async (courseId: string): Promise<Batch[]> => {
    const res = await axiosInstance.get('/batches', { params: { courseId } });
    return res.data?.data?.batches || [];
  },

  getAllBatches: async (): Promise<Batch[]> => {
    const res = await axiosInstance.get('/batches');
    return res.data?.data?.batches || [];
  },

  createBatch: async (data: {
    name: string;
    courseId: string;
    description?: string;
    startDate: string;
    color?: string;
  }): Promise<Batch> => {
    const res = await axiosInstance.post('/batches', data);
    return res.data?.data?.batch;
  },

  updateBatch: async (batchId: string, data: Partial<Batch>): Promise<Batch> => {
    const res = await axiosInstance.put(`/batches/${batchId}`, data);
    return res.data?.data?.batch;
  },

  deleteBatch: async (batchId: string): Promise<void> => {
    await axiosInstance.delete(`/batches/${batchId}`);
  },

  addStudent: async (batchId: string, studentId: string): Promise<Batch> => {
    const res = await axiosInstance.post(`/batches/${batchId}/students`, { studentId });
    return res.data?.data?.batch;
  },

  removeStudent: async (batchId: string, studentId: string): Promise<void> => {
    await axiosInstance.delete(`/batches/${batchId}/students/${studentId}`);
  },
};