// src/api/quizApi.ts
import axiosInstance from "./axiosInstance";

export const createQuizApi = async (data: {
    title: string;
    courseId: string;
    questions: object[];
    description?: string;
    timeLimit?: number;
    passingScore?: number;
    isPublished?: boolean;
}) => {
    const res = await axiosInstance.post("/quizzes", data);
    return res.data;
};

export const getQuizzesByCourseApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/quizzes/course/${courseId}`);
    return res.data;
};

export const getQuizByIdApi = async (id: string) => {
    const res = await axiosInstance.get(`/quizzes/${id}`);
    return res.data;
};

export const updateQuizApi = async (id: string, data: object) => {
    const res = await axiosInstance.put(`/quizzes/${id}`, data);
    return res.data;
};

export const deleteQuizApi = async (id: string) => {
    const res = await axiosInstance.delete(`/quizzes/${id}`);
    return res.data;
};

export const attemptQuizApi = async (
    id: string,
    data: { answers: object[]; timeTaken?: number }
) => {
    const res = await axiosInstance.post(`/quizzes/${id}/attempt`, data);
    return res.data;
};

export const getQuizResultsApi = async (id: string) => {
    const res = await axiosInstance.get(`/quizzes/${id}/results`);
    return res.data;
};

// ✅ FIX: res.data return karo (not res)
// Backend: { success, data: { quizzes: [...] } }
// StudentQuizzes.tsx: res?.data?.quizzes ?? res?.quizzes ?? []
// Ab res.data.quizzes directly kaam karega
export const getMyQuizzesApi = async () => {
    const res = await axiosInstance.get("/quizzes/student");
    return res.data; // { success: true, data: { quizzes: [...] } }
};