import axiosInstance from "./axiosInstance";

export const getAllCoursesApi = async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    published?: boolean;
}) => {
    const res = await axiosInstance.get("/courses", { params });
    return res.data;
};

export const getCourseByIdApi = async (id: string) => {
    const res = await axiosInstance.get(`/courses/${id}`);
    return res.data;
};

export const createCourseApi = async (data: {
    title: string;
    description: string;
    category?: string;
    thumbnail?: string;
    isPublished?: boolean;
}) => {
    const res = await axiosInstance.post("/courses", data);
    return res.data;
};

export const updateCourseApi = async (id: string, data: object) => {
    const res = await axiosInstance.put(`/courses/${id}`, data);
    return res.data;
};

export const deleteCourseApi = async (id: string) => {
    const res = await axiosInstance.delete(`/courses/${id}`);
    return res.data;
};

export const enrollCourseApi = async (id: string) => {
    const res = await axiosInstance.post(`/courses/${id}/enroll`);
    return res.data;
};

export const getMyCoursesApi = async () => {
    const res = await axiosInstance.get("/courses/my-courses");
    return res.data;
};

export const getMyTeachingCoursesApi = async () => {
    const res = await axiosInstance.get("/courses/my-teaching");
    return res.data;
};