import axiosInstance from "./axiosInstance";

export const getAllUsersApi = async (params?: {
    role?: string;
    page?: number;
    limit?: number;
    search?: string;
}) => {
    const res = await axiosInstance.get("/users", { params });
    return res.data;
};

export const getUserProfileApi = async () => {
    const res = await axiosInstance.get("/users/profile");
    return res.data;
};

export const updateProfileApi = async (data: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
}) => {
    const res = await axiosInstance.put("/users/profile", data);
    return res.data;
};

export const getUserByIdApi = async (id: string) => {
    const res = await axiosInstance.get(`/users/${id}`);
    return res.data;
};

export const updateUserApi = async (id: string, data: object) => {
    const res = await axiosInstance.put(`/users/${id}`, data);
    return res.data;
};

export const deleteUserApi = async (id: string) => {
    const res = await axiosInstance.delete(`/users/${id}`);
    return res.data;
};