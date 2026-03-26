import axiosInstance from "./axiosInstance";

export const getActivitiesApi = async (params?: {
    type?: string;
    dateFilter?: string;
    page?: number;
    limit?: number;
}) => {
    const res = await axiosInstance.get("/activity", { params });
    return res.data;
};

export const deleteActivityApi = async (id: string) => {
    const res = await axiosInstance.delete(`/activity/${id}`);
    return res.data;
};

export const clearAllActivitiesApi = async () => {
    const res = await axiosInstance.delete("/activity");
    return res.data;
};