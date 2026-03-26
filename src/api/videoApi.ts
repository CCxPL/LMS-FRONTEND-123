import axiosInstance from "./axiosInstance";

export const getVideosByCourseApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/videos/course/${courseId}`);
    return res.data;
};

export const getVideoByIdApi = async (id: string) => {
    const res = await axiosInstance.get(`/videos/${id}`);
    return res.data;
};

export const createVideoApi = async (data: {
    title: string;
    videoUrl: string;
    courseId: string;
    description?: string;
    duration?: number;
    order?: number;
}) => {
    const res = await axiosInstance.post("/videos", data);
    return res.data;
};

export const updateVideoApi = async (id: string, data: object) => {
    const res = await axiosInstance.put(`/videos/${id}`, data);
    return res.data;
};

export const deleteVideoApi = async (id: string) => {
    const res = await axiosInstance.delete(`/videos/${id}`);
    return res.data;
};