import axiosInstance from "./axiosInstance";

export const getStudentAssignmentsApi = async () => {
    const res = await axiosInstance.get("/assignments/student");
    return res.data;
};

export const submitAssignmentApi = async (
    id: string,
    data: { submittedText?: string; submissionType?: string; link?: string; fileUrl?: string }
) => {
    const res = await axiosInstance.post(`/assignments/${id}/submit`, data);
    return res.data;
};

export const createAssignmentApi = async (data: {
    title: string;
    courseId: string;
    dueDate: string;
    description?: string;
    totalMarks?: number;
}) => {
    const res = await axiosInstance.post("/assignments", data);
    return res.data;
};

export const getTeacherAssignmentsApi = async () => {
    const res = await axiosInstance.get("/assignments/teacher");
    return res.data;
};

export const getAssignmentSubmissionsApi = async (id: string) => {
    const res = await axiosInstance.get(`/assignments/${id}/submissions`);
    return res.data;
};

export const gradeSubmissionApi = async (
    submissionId: string,
    data: { obtainedMarks: number; feedback?: string }
) => {
    const res = await axiosInstance.patch(
        `/assignments/submission/${submissionId}/grade`,
        data
    );
    return res.data;
};

export const deleteAssignmentApi = async (id: string) => {
    const res = await axiosInstance.delete(`/assignments/${id}`);
    return res.data;
};

export const getAssignmentByIdApi = async (id: string) => {
    const res = await axiosInstance.get(`/assignments/${id}`);
    return res.data;
};