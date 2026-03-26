import axiosInstance from "./axiosInstance";

export const getMyNotificationsApi = async () => {
    const res = await axiosInstance.get("/notifications");
    return res.data;
};

export const createNotificationApi = async (data: {
    title: string;
    message: string;
    type?: string;
    userId?: string;
    role?: string;
}) => {
    const res = await axiosInstance.post("/notifications", data);
    return res.data;
};

export const markNotificationReadApi = async (id: string) => {
    const res = await axiosInstance.patch(`/notifications/${id}/read`);
    return res.data;
};

export const markAllNotificationsReadApi = async () => {
    const res = await axiosInstance.patch("/notifications/mark-all-read");
    return res.data;
};

export const deleteNotificationApi = async (id: string) => {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    return res.data;
};