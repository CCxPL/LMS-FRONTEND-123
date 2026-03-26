import axiosInstance from "./axiosInstance";

export const uploadVideoApi = async (file: File) => {
    const formData = new FormData();
    formData.append("video", file);
    const res = await axiosInstance.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const uploadImageApi = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axiosInstance.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};
    
export const deleteFileApi = async (filename: string) => {
    const res = await axiosInstance.delete(`/upload/${filename}`);
    return res.data;
};