import axiosInstance from "./axiosInstance";

export const getSuperAdminUsersApi = async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
}) => {
    const res = await axiosInstance.get("/superadmin/users", { params });
    return res.data;
};

export const changeUserRoleApi = async (id: string, role: string) => {
    const res = await axiosInstance.patch(`/superadmin/user/role/${id}`, { role });
    return res.data;
};

export const toggleUserStatusApi = async (id: string) => { // ✅ NEW
    const res = await axiosInstance.patch(`/superadmin/user/toggle/${id}`);
    return res.data;
};

export const removeUserApi = async (id: string) => {
    const res = await axiosInstance.delete(`/superadmin/user/${id}`);
    return res.data;
};

export const createAdminApi = async (data: {
    name: string;
    email: string;
    password: string;
}) => {
    const res = await axiosInstance.post("/superadmin/create-admin", data);
    return res.data;
};

export const getPlatformStatsApi = async () => {
    const res = await axiosInstance.get("/superadmin/platform-stats");
    return res.data;
};

export const getRevenueApi = async () => {
    const res = await axiosInstance.get("/superadmin/revenue");
    return res.data;
};