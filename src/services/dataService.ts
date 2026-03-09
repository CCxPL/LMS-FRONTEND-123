import type { Message, Task, Notification, Feedback } from '../types/data.types';

// In-memory mock storage
let messages: Message[] = [
  {
    id: 'm1',
    fromId: '2',
    fromName: 'Admin User',
    fromRole: 'admin',
    toId: '3',
    toName: 'Dr. Sarah',
    toRole: 'teacher',
    subject: 'Course Review Required',
    body: 'Please review and update your course syllabus for the upcoming semester.',
    read: false,
    createdAt: new Date().toISOString(),
    replies: []
  },
  {
    id: 'm2',
    fromId: '4',
    fromName: 'Aakash Student',
    fromRole: 'student',
    toId: '3',
    toName: 'Dr. Sarah',
    toRole: 'teacher',
    subject: 'Question about Assignment',
    body: 'I have a question regarding the last assignment deadline.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    replies: []
  }
];

let tasks: Task[] = [
  {
    id: 't1',
    title: 'Review Course Content',
    description: 'Review all new courses submitted for approval',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-05-15',
    assignedById: '1',
    assignedByName: 'Super Admin',
    assignedByRole: 'super-admin',
    assignedToId: '2',
    assignedToName: 'Admin User',
    assignedToRole: 'admin',
    comments: [],
    createdAt: new Date().toISOString()
  }
];

let notifications: Notification[] = [
  {
    id: 'n1',
    userId: '3',
    userRole: 'teacher',
    title: 'New Enrollment',
    message: 'A new student has enrolled in your React course.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    userId: 'all',
    userRole: 'all',
    title: 'System Maintenance',
    message: 'Scheduled maintenance tonight from 12am to 2am.',
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString()
  }
];

let feedbacks: Feedback[] = [
  {
    id: 'f1',
    studentId: '4',
    studentName: 'Aakash Student',
    teacherId: '3',
    teacherName: 'Dr. Sarah',
    courseId: '1',
    courseName: 'React.js Complete Course',
    rating: 5,
    comment: 'Excellent course! Very well explained concepts.',
    createdAt: new Date().toISOString()
  }
];

export const dataService = {
  // Notifications
  getNotifications: (userId: string): Notification[] => {
    return notifications.filter(n => n.userId === userId || n.userId === 'all');
  },

  addNotification: (notif: Partial<Notification>): Notification => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      userId: notif.userId || 'all',
      userRole: notif.userRole || 'all',
      title: notif.title || '',
      message: notif.message || '',
      type: notif.type || 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications = [newNotif, ...notifications];
    return newNotif;
  },

  markRead: (id: string): void => {
    notifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
  },

  markAllRead: (userId: string): void => {
    notifications = notifications.map(n =>
      (n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n
    );
  },

  clearNotification: (id: string): void => {
    notifications = notifications.filter(n => n.id !== id);
  },

  // Messages
  getMessages: (userId: string): Message[] => {
    return messages.filter(m =>
      m.toId === userId || m.fromId === userId || m.toId.startsWith('all-')
    );
  },

  sendMessage: (msg: Partial<Message>): Message => {
    const newMsg: Message = {
      id: Date.now().toString(),
      fromId: msg.fromId || '',
      fromName: msg.fromName || '',
      fromRole: msg.fromRole || 'student',
      toId: msg.toId || '',
      toName: msg.toName || '',
      toRole: msg.toRole || 'student',
      subject: msg.subject || '',
      body: msg.body || '',
      read: false,
      createdAt: new Date().toISOString(),
      replies: []
    };
    messages = [newMsg, ...messages];
    return newMsg;
  },

  replyMessage: (id: string, reply: Partial<Message>): void => {
    messages = messages.map(m => {
      if (m.id === id) {
        return {
          ...m,
          replies: [...m.replies, {
            id: Date.now().toString(),
            fromId: reply.fromId || '',
            fromName: reply.fromName || '',
            fromRole: reply.fromRole || 'student',
            body: reply.body || '',
            createdAt: new Date().toISOString()
          }]
        };
      }
      return m;
    });
  },

  markMessageRead: (id: string): void => {
    messages = messages.map(m =>
      m.id === id ? { ...m, read: true } : m
    );
  },

  deleteMessage: (id: string): void => {
    messages = messages.filter(m => m.id !== id);
  },

  // Tasks
  getTasks: (userId: string): Task[] => {
    return tasks.filter(t =>
      t.assignedToId === userId || t.assignedById === userId
    );
  },

  createTask: (task: Partial<Task>): Task => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      dueDate: task.dueDate || '',
      assignedById: task.assignedById || '',
      assignedByName: task.assignedByName || '',
      assignedByRole: task.assignedByRole || 'admin',
      assignedToId: task.assignedToId || '',
      assignedToName: task.assignedToName || '',
      assignedToRole: task.assignedToRole || 'student',
      comments: [],
      createdAt: new Date().toISOString()
    };
    tasks = [newTask, ...tasks];
    return newTask;
  },

  updateTaskStatus: (id: string, status: Task['status']): void => {
    tasks = tasks.map(t =>
      t.id === id ? { ...t, status } : t
    );
  },

  addTaskComment: (id: string, comment: Task['comments'][0]): void => {
    tasks = tasks.map(t => {
      if (t.id === id) {
        return { ...t, comments: [...t.comments, comment] };
      }
      return t;
    });
  },

  deleteTask: (id: string): void => {
    tasks = tasks.filter(t => t.id !== id);
  },

  // Feedbacks
  getFeedbackForTeacher: (teacherId: string): Feedback[] => {
    return feedbacks.filter(f => f.teacherId === teacherId);
  },

  getFeedbackByStudent: (studentId: string): Feedback[] => {
    return feedbacks.filter(f => f.studentId === studentId);
  },

  submitFeedback: (fb: Partial<Feedback>): Feedback => {
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      studentId: fb.studentId || '',
      studentName: fb.studentName || '',
      teacherId: fb.teacherId || '',
      teacherName: fb.teacherName || '',
      courseId: fb.courseId || '',
      courseName: fb.courseName || '',
      rating: fb.rating || 5,
      comment: fb.comment || '',
      createdAt: new Date().toISOString()
    };
    feedbacks = [newFeedback, ...feedbacks];
    return newFeedback;
  },

  replyFeedback: (id: string, reply: string): void => {
    feedbacks = feedbacks.map(f =>
      f.id === id ? { ...f, reply, repliedAt: new Date().toISOString() } : f
    );
  }
};