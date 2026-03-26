import axiosInstance from "./axiosInstance";

export const getPerformanceApi = async (params?: {
    studentId?: string;
    courseId?: string;
    quizId?: string;
}) => {
    const res = await axiosInstance.get("/performance", { params });
    return res.data;
};

export const getCoursePerformanceApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/performance/course/${courseId}`);
    return res.data;
};

export const getLeaderboardApi = async (params?: {
    courseId?: string;
    limit?: number;
}) => {
    const res = await axiosInstance.get("/performance/leaderboard", { params });
    return res.data;
};

export const getCourseProgressApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/performance/progress/${courseId}`);
    return res.data;
};