// src/api/assignmentApi.ts
import axiosInstance from './axiosInstance';

// ─── TEACHER ──────────────────────────────────────────────────────────────────

export const getTeacherAssignmentsApi = () =>
    axiosInstance.get('/assignments/teacher');

export const createAssignmentApi = (data: {
    title: string;
    courseId: string;
    dueDate: string;
    description?: string;
    totalMarks?: number;
}) => axiosInstance.post('/assignments', data);

export const updateAssignmentApi = (
    assignmentId: string,
    data: {
        title?: string;
        description?: string;
        dueDate?: string;
        totalMarks?: number;
    }
) => axiosInstance.put(`/assignments/${assignmentId}`, data);

export const deleteAssignmentApi = (assignmentId: string) =>
    axiosInstance.delete(`/assignments/${assignmentId}`);

export const getAssignmentSubmissionsApi = (assignmentId: string) =>
    axiosInstance.get(`/assignments/${assignmentId}/submissions`);

export const gradeSubmissionApi = (
    submissionId: string,
    data: { obtainedMarks: number; feedback?: string }
) => axiosInstance.patch(`/assignments/submission/${submissionId}/grade`, data);

// ─── STUDENT ──────────────────────────────────────────────────────────────────

export const getStudentAssignmentsApi = () =>
    axiosInstance.get('/assignments/student');

// ✅ NEW: Get single assignment by ID (used in SubmitAssignment.tsx)
export const getAssignmentByIdApi = (assignmentId: string) =>
    axiosInstance.get(`/assignments/${assignmentId}`);

export const submitAssignmentApi = (
    assignmentId: string,
    data: {
        submittedText?: string;
        submissionType?: string;
        link?: string;
        fileUrl?: string;
    }
) => axiosInstance.post(`/assignments/${assignmentId}/submit`, data);

export const getMySubmissionsApi = () =>
    axiosInstance.get('/assignments/my-submissions');