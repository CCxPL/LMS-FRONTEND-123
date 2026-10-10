import axios from "axios";

export const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // ✅ Device conflict: dusri jagah already logged in hai
        if (
            error.response?.status === 409 &&
            error.response?.data?.code === "DEVICE_CONFLICT"
        ) {
            // Global event fire karo — AuthContext/Login sun lega
            window.dispatchEvent(
                new CustomEvent("device-conflict", {
                    detail: { message: error.response.data.message },
                })
            );
            return Promise.reject(error);
        }

        // ✅ Session replaced: kisi aur ne force login kiya
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "SESSION_REPLACED"
        ) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("lms_auth_user");
            window.dispatchEvent(new CustomEvent("session-replaced"));
            return Promise.reject(error);
        }

        // ✅ Weekly session expired
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "WEEKLY_EXPIRED"
        ) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("lms_auth_user");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        // ✅ Normal token expired: refresh karo
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken, 
                });

                const newAccessToken = res.data.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("lms_auth_user");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;