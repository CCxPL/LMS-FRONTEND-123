import axiosInstance from "./axiosInstance";

export const getMyCertificatesApi = async () => {
    const res = await axiosInstance.get("/certificates/my");
    return res.data;
};

export const issueCertificateApi = async (courseId: string) => {
    const res = await axiosInstance.post("/certificates/issue", { courseId });
    return res.data;
};