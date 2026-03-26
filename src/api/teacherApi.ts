import axiosInstance from "./axiosInstance";

export const createTeacherCourseApi = async (data: {
    title: string;
    description: string;
    category?: string;
    thumbnail?: string;
    isPublished?: boolean;
    level?: string;    // ✅ ADD
    price?: number;    // ✅ ADD
    duration?: string;
}) => {
    const res = await axiosInstance.post("/teacher/course", data);
    return res.data;
};

export const getTeacherCoursesApi = async (params?: {
    page?: number;
    limit?: number;
}) => {
    const res = await axiosInstance.get("/teacher/my-courses", { params });
    return res.data;
};

export const updateTeacherCourseApi = async (id: string, data: object) => {
    const res = await axiosInstance.put(`/teacher/course/${id}`, data);
    return res.data;
};

export const addLectureApi = async (data: {
    title: string;
    videoUrl: string;
    courseId: string;
    description?: string;
    duration?: number;
    order?: number;
}) => {
    const res = await axiosInstance.post("/teacher/lecture", data);
    return res.data;
};

export const createTeacherQuizApi = async (data: {
    title: string;
    courseId: string;
    questions: object[];
    description?: string;
    timeLimit?: number;
    passingScore?: number;
    isPublished?: boolean;
}) => {
    const res = await axiosInstance.post("/teacher/quiz", data);
    return res.data;
};

export const getEnrolledStudentsApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/teacher/course/${courseId}/students`);
    return res.data;
};

export const getTeacherStatsApi = async () => {
    const res = await axiosInstance.get("/teacher/dashboard-stats");
    return res.data;
};

export const getCourseReviewsApi = async () => {
    const res = await axiosInstance.get("/teacher/reviews");
    return res.data;
};

export const replyToReviewApi = async (courseId: string, reviewId: string, reply: string) => {
    const res = await axiosInstance.post(`/courses/${courseId}/review/${reviewId}/reply`, { reply });
    return res.data;
};