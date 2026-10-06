import axiosInstance from "./axiosInstance";

export const registerApi = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
}) => {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
};

export const loginApi = async (data: { email: string; password: string }) => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
};

export const logoutApi = async () => {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
};

export const refreshTokenApi = async (refreshToken: string) => {
    const res = await axiosInstance.post("/auth/refresh-token", { refreshToken });
    return res.data;
};

export const getMeApi = async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
};

// Existing code ke saath ye add karo:
export const forgotPasswordApi = async (email: string) => {
  const res = await axiosInstance.post('/auth/forgot-password', { email });
  return res.data;
};

export const resetPasswordApi = async (token: string, newPassword: string) => {
  const res = await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
  return res.data;
};