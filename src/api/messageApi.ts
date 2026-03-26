import axiosInstance from './axiosInstance';

export const messageApi = {
    getInbox: async () => {
        const res = await axiosInstance.get('/messages/inbox');
        return res.data;
        // Response: { success, data: { messages } }
    },

    getSent: async () => {
        const res = await axiosInstance.get('/messages/sent');
        return res.data;
        // Response: { success, data: { messages } }
    },

    getUsers: async () => {
        const res = await axiosInstance.get('/messages/users');
        return res.data;
        // Response: { success, data: { users } }
    },

    sendMessage: async (payload: {
        toId: string;
        subject: string;
        body: string;
    }) => {
        const res = await axiosInstance.post('/messages', payload);
        return res.data;
    },

    replyMessage: async (id: string, body: string) => {
        const res = await axiosInstance.post(`/messages/${id}/reply`, { body });
        return res.data;
    },

    markRead: async (id: string) => {
        const res = await axiosInstance.patch(`/messages/${id}/read`);
        return res.data;
    },

    deleteMessage: async (id: string) => {
        const res = await axiosInstance.delete(`/messages/${id}`);
        return res.data;
    },
};