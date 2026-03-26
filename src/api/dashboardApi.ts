import axiosInstance from "./axiosInstance";

export const getStudentDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/student");
    return res.data;
};

export const getTeacherDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/teacher");
    return res.data;
};

export const getAdminDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/admin");
    return res.data;
};

export const getSuperAdminDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/superadmin");
    return res.data;
};