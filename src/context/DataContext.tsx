import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AttendanceRecord, ClassSummary, StudentActivity } from '../types/attendance.types';
import type { Activity } from '../types/activity.types';
import type { Feedback as FeedbackType } from '../types/feedback.types';
import type { LeaveRequest } from '../types/leave.types';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

// =====================
// Types
// =====================
interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  toId: string;
  toName: string;
  toRole: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  replies: MessageReply[];
}

interface MessageReply {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  body: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  issueDate: string;
  grade: string;
  score: number;
}

interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

interface ExtendedTask {
  id: string;
  title: string;
  description: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  comments: TaskComment[];
}

interface Announcement {
  title: string;
  message: string;
  userId: string;
  userRole: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  submittedText: string;
  totalMarks: number;
  submittedAt?: string;
  status?: string;
  dueDate?: string;
}

interface DataContextType {
  // Attendance
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;

  // Class Summaries
  classSummaries: ClassSummary[];
  addClassSummary: (summary: ClassSummary) => void;
  getClassSummary: (eventId: string) => ClassSummary | undefined;

  // Student Activities
  studentActivities: StudentActivity[];
  addStudentActivity: (activity: StudentActivity) => void;
  getActivitiesForEvent: (eventId: string) => StudentActivity[];

  // General Activities
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  getActivities: (filter?: { type?: string; actorId?: string }) => Activity[];

  // Messages
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'read' | 'createdAt' | 'replies'>) => void;
  replyMessage: (msgId: string, reply: Omit<MessageReply, 'id' | 'createdAt'>) => void;
  markMessageRead: (msgId: string) => void;
  deleteMessage: (msgId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  addNotificationItem: (notif: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  clearNotification: (id: string) => void;

  // Feedback
  feedbacks: FeedbackType[];
  submitFeedback: (fb: Omit<FeedbackType, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getFeedbackByStudent: (studentId: string) => FeedbackType[];
  getFeedbackByRecipient: (recipientId: string) => FeedbackType[];
  updateFeedback: (id: string, updates: Partial<Omit<FeedbackType, 'id' | 'createdAt' | 'createdBy'>>) => void;
  deleteFeedback: (id: string) => void;

  // Certificates
  certificates: Certificate[];
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  getCertificatesForStudent: (studentId: string) => Certificate[];

  // Tasks
  tasks: ExtendedTask[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByUser: (userId: string) => Task[];
  completeTask: (id: string) => void;
  createTask: (task: Omit<ExtendedTask, 'id' | 'createdAt' | 'comments'>) => void;
  updateTaskStatus: (id: string, status: ExtendedTask['status']) => void;
  addTaskComment: (taskId: string, comment: TaskComment) => void;

  // Announcement
  addAnnouncement: (announcement: Announcement) => void;

  // Assignment
  submitAssignment: (assignment: Assignment) => void;

  // Leaves
  leaves: LeaveRequest[];
  addLeave: (leave: LeaveRequest) => void;
  getStudentLeaves: (studentId: string) => LeaveRequest[];
  getAllApprovedLeaves: () => LeaveRequest[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// =====================
// Provider Component
// =====================
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Live/real-time state — empty initial
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  // API-backed state — loaded from backend
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [, setAssignments] = useState<Assignment[]>([]);

  // ─── Load data from API on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const loadAll = async () => {
      try {
        // Messages — ✅ FIX: /messages → /messages/inbox
        const msgRes = await axiosInstance.get('/messages/inbox');
        setMessages(msgRes.data?.data?.messages || []);
      } catch { /* silent */ }

      try {
        // Notifications
        const notifRes = await axiosInstance.get('/notifications');
        setNotifications(notifRes.data?.data?.notifications || []);
      } catch { /* silent */ }

      try {
        // Tasks
        const taskRes = await axiosInstance.get('/tasks');
        setTasks(taskRes.data?.data?.tasks || []);
      } catch { /* silent */ }

      try {
        // Certificates — ✅ FIX: sirf student ke liye
        if (user?.role === 'student') {
          const certRes = await axiosInstance.get('/certificates/my');
          setCertificates(certRes.data?.data?.certificates || []);
        }
      } catch { /* silent */ }

      try {
        // Feedbacks — ✅ FIX: sirf student ke liye
        if (user?.role === 'student') {
          const fbRes = await axiosInstance.get('/feedback/my');
          setFeedbacks(fbRes.data?.data?.feedbacks || []);
        }
      } catch { /* silent */ }

      try {
        // Leaves — ✅ FIX: sirf student ke liye
        if (user?.role === 'student') {
          const leaveRes = await axiosInstance.get('/leaves/my');
          setLeaves(leaveRes.data?.data?.leaves || []);
        }
      } catch { /* silent */ }
    };

    loadAll();
  }, [user]);

  // ─── Attendance ────────────────────────────────────────────────────────────
  const addAttendanceRecord = useCallback((record: AttendanceRecord) => {
    setAttendanceRecords(prev => [...prev, record]);
  }, []);

  const updateAttendanceRecord = useCallback((id: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  // ─── Class Summaries ───────────────────────────────────────────────────────
  const addClassSummary = useCallback((summary: ClassSummary) => {
    setClassSummaries(prev => {
      if (prev.some(s => s.eventId === summary.eventId)) return prev;
      return [...prev, summary];
    });
  }, []);

  const getClassSummary = useCallback((eventId: string) => {
    return classSummaries.find(s => s.eventId === eventId);
  }, [classSummaries]);

  // ─── Student Activities ────────────────────────────────────────────────────
  const addStudentActivity = useCallback((activity: StudentActivity) => {
    setStudentActivities(prev => [...prev, activity]);
  }, []);

  const getActivitiesForEvent = useCallback((eventId: string) => {
    return studentActivities.filter(a => a.eventId === eventId);
  }, [studentActivities]);

  // ─── General Activities ────────────────────────────────────────────────────
  const addActivity = useCallback((activity: Activity) => {
    setActivities(prev => [activity, ...prev]);
  }, []);

  const getActivities = useCallback((filter?: { type?: string; actorId?: string }) => {
    if (!filter) return activities;
    return activities.filter(a => {
      if (filter.type && a.type !== filter.type) return false;
      if (filter.actorId && a.actorId !== filter.actorId) return false;
      return true;
    });
  }, [activities]);

  // ─── Messages ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (msg: Omit<Message, 'id' | 'read' | 'createdAt' | 'replies'>) => {
    try {
      const res = await axiosInstance.post('/messages', msg);
      const newMsg = res.data?.data?.message;
      if (newMsg) setMessages(prev => [newMsg, ...prev]);
    } catch {
      // Optimistic update on failure
      setMessages(prev => [{
        ...msg,
        id: `msg-${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
        replies: [],
      }, ...prev]);
    }
  }, []);

  const replyMessage = useCallback(async (msgId: string, reply: Omit<MessageReply, 'id' | 'createdAt'>) => {
    try {
      await axiosInstance.post(`/messages/${msgId}/reply`, reply);
      setMessages(prev => prev.map(msg => {
        if (msg.id === msgId) {
          return {
            ...msg,
            replies: [...msg.replies, {
              ...reply,
              id: `reply-${Date.now()}`,
              createdAt: new Date().toISOString(),
            }],
          };
        }
        return msg;
      }));
    } catch { /* silent */ }
  }, []);

  const markMessageRead = useCallback(async (msgId: string) => {
    try {
      await axiosInstance.patch(`/messages/${msgId}/read`);
      setMessages(prev => prev.map(msg => msg.id === msgId ? { ...msg, read: true } : msg));
    } catch { /* silent */ }
  }, []);

  const deleteMessage = useCallback(async (msgId: string) => {
    try {
      await axiosInstance.delete(`/messages/${msgId}`);
      setMessages(prev => prev.filter(msg => msg.id !== msgId));
    } catch { /* silent */ }
  }, []);

  // ─── Notifications ─────────────────────────────────────────────────────────
  const addNotificationItem = useCallback((notif: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => [{
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  }, []);

  const markAllRead = useCallback(async (userId: string) => {
    try {
      await axiosInstance.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n =>
        (n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n
      ));
    } catch { /* silent */ }
  }, []);

  const clearNotification = useCallback(async (id: string) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* silent */ }
  }, []);

  // ─── Feedback ──────────────────────────────────────────────────────────────
  const submitFeedback = useCallback(async (fb: Omit<FeedbackType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await axiosInstance.post('/feedback', fb);
      const newFb = res.data?.data?.feedback;
      if (newFb) setFeedbacks(prev => [newFb, ...prev]);
    } catch { /* silent */ }
  }, []);

  const getFeedbackByStudent = useCallback((studentId: string) => {
    return feedbacks.filter(f => f.studentId === studentId && !f.isDeleted);
  }, [feedbacks]);

  const getFeedbackByRecipient = useCallback((recipientId: string) => {
    return feedbacks.filter(f => f.recipientId === recipientId && !f.isDeleted);
  }, [feedbacks]);

  const updateFeedback = useCallback(async (id: string, updates: Partial<Omit<FeedbackType, 'id' | 'createdAt' | 'createdBy'>>) => {
    try {
      await axiosInstance.put(`/feedback/${id}`, updates);
      setFeedbacks(prev => prev.map(f =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      ));
    } catch { /* silent */ }
  }, []);

  const deleteFeedback = useCallback(async (id: string) => {
    try {
      await axiosInstance.delete(`/feedback/${id}`);
      setFeedbacks(prev => prev.map(f =>
        f.id === id ? { ...f, isDeleted: true } : f
      ));
    } catch { /* silent */ }
  }, []);

  // ─── Certificates ──────────────────────────────────────────────────────────
  const addCertificate = useCallback((cert: Omit<Certificate, 'id'>) => {
    setCertificates(prev => [...prev, { ...cert, id: `cert-${Date.now()}` }]);
  }, []);

  const getCertificatesForStudent = useCallback((studentId: string) => {
    return certificates.filter(c => c.studentId === studentId);
  }, [certificates]);

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const res = await axiosInstance.post('/tasks', task);
      const newTask = res.data?.data?.task;
      if (newTask) setTasks(prev => [newTask, ...prev]);
    } catch { /* silent */ }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      await axiosInstance.put(`/tasks/${id}`, updates);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch { /* silent */ }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch { /* silent */ }
  }, []);

  const getTasksByUser = useCallback((userId: string) => {
    return tasks.filter(t => t.assignedToId === userId || t.assignedById === userId) as unknown as Task[];
  }, [tasks]);

  const completeTask = useCallback(async (id: string) => {
    try {
      await axiosInstance.patch(`/tasks/${id}/status`, { status: 'completed' });
      setTasks(prev => prev.map(t =>
        t.id === id ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } : t
      ));
    } catch { /* silent */ }
  }, []);

  const createTask = useCallback(async (task: Omit<ExtendedTask, 'id' | 'createdAt' | 'comments'>) => {
    try {
      const res = await axiosInstance.post('/tasks', task);
      const newTask = res.data?.data?.task;
      if (newTask) setTasks(prev => [newTask, ...prev]);
    } catch { /* silent */ }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: ExtendedTask['status']) => {
    try {
      await axiosInstance.patch(`/tasks/${id}/status`, { status });
      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      }));
    } catch { /* silent */ }
  }, []);

  const addTaskComment = useCallback(async (taskId: string, comment: TaskComment) => {
    try {
      await axiosInstance.post(`/tasks/${taskId}/comments`, comment);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, comments: [...t.comments, comment] };
        }
        return t;
      }));
    } catch { /* silent */ }
  }, []);

  // ─── Announcement ──────────────────────────────────────────────────────────
  const addAnnouncement = useCallback((announcement: Announcement) => {
    addNotificationItem({
      userId: 'all',
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
    });
  }, [addNotificationItem]);

  // ─── Assignment ────────────────────────────────────────────────────────────
  const submitAssignment = useCallback(async (assignment: Assignment) => {
    try {
      const res = await axiosInstance.post(`/assignments/${assignment.id}/submit`, {
        submittedText: assignment.submittedText,
      });
      const submitted = res.data?.data?.assignment;
      if (submitted) {
        setAssignments(prev => [...prev, submitted]);
        addNotificationItem({
          userId: assignment.studentId,
          title: 'Assignment Submitted',
          message: `Your assignment "${assignment.title}" has been submitted successfully`,
          type: 'success',
        });
      }
    } catch { /* silent */ }
  }, [addNotificationItem]);

  // ─── Leaves ────────────────────────────────────────────────────────────────
  const addLeave = useCallback((leave: LeaveRequest) => {
    setLeaves(prev => [...prev, leave]);
  }, []);

  const getStudentLeaves = useCallback((studentId: string) => {
    return leaves.filter(l => l.studentId === studentId);
  }, [leaves]);

  const getAllApprovedLeaves = useCallback(() => {
    return leaves.filter(l => l.status === 'approved');
  }, [leaves]);

  const value: DataContextType = {
    attendanceRecords, addAttendanceRecord, updateAttendanceRecord,
    classSummaries, addClassSummary, getClassSummary,
    studentActivities, addStudentActivity, getActivitiesForEvent,
    activities, addActivity, getActivities,
    messages, sendMessage, replyMessage, markMessageRead, deleteMessage,
    notifications, addNotificationItem, markRead, markAllRead, clearNotification,
    feedbacks, submitFeedback, getFeedbackByStudent, getFeedbackByRecipient, updateFeedback, deleteFeedback,
    certificates, addCertificate, getCertificatesForStudent,
    tasks, addTask, updateTask, deleteTask, getTasksByUser, completeTask,
    createTask, updateTaskStatus, addTaskComment,
    addAnnouncement,
    submitAssignment,
    leaves, addLeave, getStudentLeaves, getAllApprovedLeaves,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export type { ExtendedTask as Task, TaskComment };