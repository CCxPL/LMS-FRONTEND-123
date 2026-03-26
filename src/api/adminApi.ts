import axiosInstance from "./axiosInstance";

export const getPendingCoursesApi = async (params?: {
    page?: number;
    limit?: number;
}) => {
    const res = await axiosInstance.get("/admin/pending-courses", { params });
    return res.data;
};

export const approveCourseApi = async (id: string) => {
    const res = await axiosInstance.patch(`/admin/approve-course/${id}`);
    return res.data;
};

export const rejectCourseApi = async (id: string, reason?: string) => {
    const res = await axiosInstance.patch(`/admin/reject-course/${id}`, { reason });
    return res.data;
};

export const getAdminStudentsApi = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    const res = await axiosInstance.get("/admin/students", { params });
    return res.data;
};

export const getAdminTeachersApi = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    const res = await axiosInstance.get("/admin/teachers", { params });
    return res.data;
};

export const getAdminStatsApi = async () => {
    const res = await axiosInstance.get("/admin/stats");
    return res.data;
};

export const createTeacherByAdminApi = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    specialization?: string;
}) => {
    const res = await axiosInstance.post("/admin/create-teacher", data);
    return res.data;
};