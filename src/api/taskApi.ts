import axiosInstance from "./axiosInstance";

export const getMyTasksApi = async () => {
    const res = await axiosInstance.get("/tasks");
    return res.data;
};

export const getTaskUsersApi = async () => {
    const res = await axiosInstance.get("/tasks/users");
    return res.data;
};

export const createTaskApi = async (data: {
    title: string;
    assignedToId: string;
    dueDate: string;
    description?: string;
    priority?: string;
}) => {
    const res = await axiosInstance.post("/tasks", data);
    return res.data;
};

export const updateTaskStatusApi = async (
    id: string,
    status: "pending" | "in-progress" | "completed"
) => {
    const res = await axiosInstance.patch(`/tasks/${id}/status`, { status });
    return res.data;
};

export const addTaskCommentApi = async (id: string, body: string) => {
    const res = await axiosInstance.post(`/tasks/${id}/comment`, { body });
    return res.data;
};

export const deleteTaskApi = async (id: string) => {
    const res = await axiosInstance.delete(`/tasks/${id}`);
    return res.data;
};