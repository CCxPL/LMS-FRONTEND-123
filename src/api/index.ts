export * from "./authApi";
export * from "./courseApi";
export * from "./dashboardApi";
export * from "./studentApi";
export * from "./teacherApi";
export * from "./adminApi";
export * from "./superadminApi";
export * from "./quizApi";
export * from "./assignmentApi";
export * from "./notificationApi";
export * from "./messageApi";
export * from "./taskApi";
export * from "./certificateApi";
export * from "./videoApi";
export * from "./userApi";
export * from "./uploadApi";
export * from "./attendanceApi";
export { default as axiosInstance } from "./axiosInstance";
export * from "./activityApi";

// Performance alag se export karo conflict avoid karne ke liye
export {
    getPerformanceApi,
    getCoursePerformanceApi,
    getLeaderboardApi,
    getCourseProgressApi as getPerformanceCourseProgressApi,
} from "./performanceApi";