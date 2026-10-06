import axiosInstance from "./axiosInstance";

export const getModulesByCourseApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/modules/${courseId}`);
    return res.data;
};

export const createModuleApi = async (data: {
    title: string;
    courseId: string;
}) => {
    const res = await axiosInstance.post("/modules", data);
    return res.data;
};

export const updateModuleApi = async (id: string, title: string) => {
    const res = await axiosInstance.put(`/modules/${id}`, { title });
    return res.data;
};

export const deleteModuleApi = async (id: string) => {
    const res = await axiosInstance.delete(`/modules/${id}`);
    return res.data;
};