// src/api/leaveApi.ts
import axiosInstance from './axiosInstance';

// ─── STUDENT ──────────────────────────────────────────────────────────────────

// Apply for leave
export const applyLeaveApi = (data: {
    reason: string;
    startDate: string;
    endDate: string;
}) => axiosInstance.post('/leaves/apply', data);

// Get my leaves
export const getMyLeavesApi = () =>
    axiosInstance.get('/leaves/my');

// Cancel a leave
export const cancelLeaveApi = (leaveId: string) =>
    axiosInstance.delete(`/leaves/${leaveId}`);

// ─── TEACHER / ADMIN ──────────────────────────────────────────────────────────

// Get all leaves (teacher sees their students' leaves, admin sees all)
export const getAllLeavesApi = (params?: {
    status?: string;
    studentId?: string;
}) => axiosInstance.get('/leaves', { params });

// Approve a leave
export const approveLeaveApi = (leaveId: string) =>
    axiosInstance.patch(`/leaves/${leaveId}/approve`);

// Reject a leave
export const rejectLeaveApi = (leaveId: string, reason: string) =>
    axiosInstance.patch(`/leaves/${leaveId}/reject`, { reason });