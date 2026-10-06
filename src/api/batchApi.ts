import axiosInstance from './axiosInstance';

export const getBatchesByCourseApi = (courseId: string) =>
    axiosInstance.get('/batches', { params: { courseId } });

export const getAllBatchesApi = () =>
    axiosInstance.get('/batches');

export const createBatchApi = (data: {
    name: string;
    courseId: string;
    description?: string;
    startDate: string;
    color?: string;
}) => axiosInstance.post('/batches', data);

export const updateBatchApi = (batchId: string, data: any) =>
    axiosInstance.put(`/batches/${batchId}`, data);

export const deleteBatchApi = (batchId: string) =>
    axiosInstance.delete(`/batches/${batchId}`);

export const addStudentToBatchApi = (batchId: string, studentId: string) =>
    axiosInstance.post(`/batches/${batchId}/students`, { studentId });

export const removeStudentFromBatchApi = (batchId: string, studentId: string) =>
    axiosInstance.delete(`/batches/${batchId}/students/${studentId}`);