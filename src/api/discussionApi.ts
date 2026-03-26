import axiosInstance from "./axiosInstance";

export const getDiscussionsApi = async (courseId: string, topic?: string) => {
    const res = await axiosInstance.get(`/discussions/${courseId}`, {
        params: topic ? { topic } : {},
    });
    return res.data;
};

export const createDiscussionApi = async (
    courseId: string,
    data: { text: string; topic?: string }
) => {
    const res = await axiosInstance.post(`/discussions/${courseId}`, data);
    return res.data;
};

export const addReplyApi = async (
    courseId: string,
    discussionId: string,
    text: string
) => {
    const res = await axiosInstance.post(
        `/discussions/${courseId}/${discussionId}/reply`,
        { text }
    );
    return res.data;
};

export const deleteDiscussionApi = async (
    courseId: string,
    discussionId: string
) => {
    const res = await axiosInstance.delete(
        `/discussions/${courseId}/${discussionId}`
    );
    return res.data;
};