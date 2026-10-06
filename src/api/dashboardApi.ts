// src/api/dashboardApi.ts
import axiosInstance from "./axiosInstance";

// ─── STUDENT ──────────────────────────────────────────────────────────────────
// ✅ FIX: Returns res.data directly so callers use res.data.data (backend returns { success, data: {...} })
export const getStudentDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/student");
    return res.data; // { success: true, data: { enrolledCourses, recentCourses, ... } }
};

// ─── TEACHER ──────────────────────────────────────────────────────────────────
export const getTeacherDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/teacher");
    return res.data;
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const getAdminDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/admin");
    return res.data;
};

// ─── SUPERADMIN ───────────────────────────────────────────────────────────────
export const getSuperAdminDashboardApi = async () => {
    const res = await axiosInstance.get("/dashboard/superadmin");
    return res.data;
};