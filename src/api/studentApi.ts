import axiosInstance from "./axiosInstance";

export const getBrowseCoursesApi = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}) => {
    const res = await axiosInstance.get("/student/courses", { params });
    return res.data;
};

export const enrollInCourseApi = async (courseId: string) => {
    const res = await axiosInstance.post(`/student/enroll/${courseId}`);
    return res.data;
};

export const getMyEnrolledCoursesApi = async (params?: {
    page?: number;
    limit?: number;
}) => {
    const res = await axiosInstance.get("/student/my-courses", { params });
    return res.data;
};

export const getCourseProgressApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/student/progress/${courseId}`);
    return res.data;
};

export const markLectureCompleteApi = async (data: {
    videoId: string;
    courseId: string;
}) => {
    const res = await axiosInstance.post("/student/mark-complete", data);
    return res.data;
};

export const submitQuizAttemptApi = async (data: {
    quizId: string;
    answers: object[];
}) => {
    const res = await axiosInstance.post("/student/quiz/attempt", data);
    return res.data;
};

export const addCourseReviewApi = async (data: {
    courseId: string;
    rating: number;
    comment?: string;
}) => {
    const res = await axiosInstance.post("/courses/review", data);
    return res.data;
};

export const getStudentProfileApi = async () => {
    const res = await axiosInstance.get("/student/profile");
    return res.data;
};

// ✅ Fix: correct URL
export const getMyCertificatesApi = async () => {
    const res = await axiosInstance.get("/certificates/my");
    return res.data;
};

export const getMyReviewsApi = async () => {
    const res = await axiosInstance.get("/student/my-reviews");
    return res.data;
};