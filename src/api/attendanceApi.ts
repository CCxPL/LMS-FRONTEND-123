import axiosInstance from "./axiosInstance";

export const joinClassApi = async (eventId: string) => {
    const res = await axiosInstance.post("/attendance/join", { eventId });
    return res.data;
};

export const leaveClassApi = async (eventId: string) => {
    const res = await axiosInstance.post("/attendance/leave", { eventId });
    return res.data;
};

export const getStudentAttendanceApi = async (params?: {
    courseId?: string;
}) => {
    const res = await axiosInstance.get("/attendance/student", { params });
    return res.data;
};

export const getEventAttendanceApi = async (eventId: string) => {
    const res = await axiosInstance.get(`/attendance/event/${eventId}`);
    return res.data;
};

export const getCourseAttendanceApi = async (courseId: string) => {
    const res = await axiosInstance.get(`/attendance/teacher/${courseId}`);
    return res.data;
};

export const getAllAttendanceApi = async (params?: {
    courseId?: string;
}) => {
    const res = await axiosInstance.get("/attendance/all", { params });
    return res.data;
};