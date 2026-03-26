import {
  getMyNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  createNotificationApi,
} from '../api/notificationApi';
import {
  getMyTasksApi,
  createTaskApi,
  updateTaskStatusApi,
  addTaskCommentApi,
  deleteTaskApi,
} from '../api/taskApi';
import {
  getInboxApi,
  sendMessageApi,
  replyMessageApi,
  markMessageReadApi,
  deleteMessageApi,
} from '../api/messageApi';
import {
  getCourseReviewsApi,
} from '../api/teacherApi';

import {
  addCourseReviewApi,
} from '../api/studentApi';

export const dataService = {
  // Notifications
  getNotifications: async (userId: string) => {
    const res = await getMyNotificationsApi();
    return res.data.notifications.map((n: any) => ({
      id: n._id,
      userId: n.userId || userId,
      userRole: n.recipientRole || 'all',
      title: n.title,
      message: n.message,
      type: n.type || 'info',
      read: n.readBy?.includes(userId) || false,
      createdAt: n.createdAt,
    }));
  },

  addNotification: async (notif: any) => {
    const res = await createNotificationApi(notif);
    return res.data.notification;
  },

  markRead: async (id: string) => {
    await markNotificationReadApi(id);
  },

  markAllRead: async (_userId: string) => {
    await markAllNotificationsReadApi();
  },

  clearNotification: async (id: string) => {
    await deleteNotificationApi(id);
  },

  // Messages
  getMessages: async (userId: string) => {
    const res = await getInboxApi();
    return res.data.messages.map((m: any) => ({
      id: m._id,
      fromId: m.sender?._id || m.senderId,
      fromName: m.sender?.name || m.senderName,
      fromRole: m.sender?.role?.toLowerCase() || 'student',
      toId: userId,
      toName: '',
      toRole: '',
      subject: m.subject,
      body: m.body,
      read: m.isRead || false,
      createdAt: m.createdAt,
      replies: m.replies || [],
    }));
  },

  sendMessage: async (msg: any) => {
    const res = await sendMessageApi(msg);
    return res.data.message;
  },

  replyMessage: async (id: string, reply: any) => {
    await replyMessageApi(id, reply);
  },

  markMessageRead: async (id: string) => {
    await markMessageReadApi(id);
  },

  deleteMessage: async (id: string) => {
    await deleteMessageApi(id);
  },

  // Tasks
  getTasks: async (_userId: string) => {
    const res = await getMyTasksApi();
    return res.data.tasks.map((t: any) => ({
      id: t._id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignedById: t.assignedBy?._id || t.assignedById,
      assignedByName: t.assignedBy?.name || t.assignedByName,
      assignedByRole: t.assignedBy?.role?.toLowerCase() || 'admin',
      assignedToId: t.assignedTo?._id || t.assignedToId,
      assignedToName: t.assignedTo?.name || t.assignedToName,
      assignedToRole: t.assignedTo?.role?.toLowerCase() || 'student',
      comments: t.comments || [],
      createdAt: t.createdAt,
    }));
  },

  createTask: async (task: any) => {
    const res = await createTaskApi(task);
    return res.data.task;
  },

  updateTaskStatus: async (id: string, status: string) => {
    await updateTaskStatusApi(id, status as 'pending' | 'in-progress' | 'completed');
  },

  addTaskComment: async (id: string, comment: any) => {
    await addTaskCommentApi(id, comment);
  },

  deleteTask: async (id: string) => {
    await deleteTaskApi(id);
  },

  // Feedbacks
  getFeedbackForTeacher: async (_teacherId: string) => {
    const res = await getCourseReviewsApi();
    return res.data.reviews || [];
  },

  getFeedbackByStudent: async (_studentId: string) => {
    return [];
  },

  submitFeedback: async (fb: any) => {
    const res = await addCourseReviewApi(fb);
    return res.data.review;
  },

  replyFeedback: async (_id: string, _reply: string) => {
    // Backend endpoint nahi hai abhi
  },
};