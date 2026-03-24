import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AttendanceRecord, ClassSummary, StudentActivity } from '../types/attendance.types';
import type { Activity } from '../types/activity.types';
import type { Feedback as FeedbackType } from '../types/feedback.types';
import type { LeaveRequest } from '../types/leave.types'; // ✅ NEW

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

  // ✅ NEW: Leaves
  leaves: LeaveRequest[];
  addLeave: (leave: LeaveRequest) => void;
  getStudentLeaves: (studentId: string) => LeaveRequest[];
  getAllApprovedLeaves: () => LeaveRequest[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// =====================
// Initial Mock Data
// =====================
const initialMessages: Message[] = [
  {
    id: 'msg-1',
    fromId: 'teacher-1',
    fromName: 'Sarah Teacher',
    fromRole: 'teacher',
    toId: 'student-1',
    toName: 'Emma Student',
    toRole: 'student',
    subject: 'Welcome to Python Course',
    body: 'Hi Emma, welcome to the Python Development course!',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    replies: [],
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'student-1',
    title: 'New Class Scheduled',
    message: 'Python Basics class scheduled for tomorrow at 10:00 AM',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'teacher-1',
    title: 'New Student Enrolled',
    message: 'James Learner enrolled in your course',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'admin-1',
    title: 'Teacher Late Alert',
    message: 'Mike Instructor is late for Java class',
    type: 'error',
    read: false,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'all',
    title: 'System Update',
    message: 'New features added to the platform',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const initialFeedbacks: FeedbackType[] = [
  {
    id: 'fb-1',
    studentId: 'student-1',
    studentName: 'Emma Student',
    recipientId: 'teacher-1',
    recipientType: 'teacher',
    recipientName: 'Sarah Teacher',
    feedbackText: 'Excellent course!',
    rating: 5,
    category: 'teaching',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
    createdBy: 'student-1',
  },
];

const initialCertificates: Certificate[] = [
  {
    id: 'cert-1',
    studentId: 'student-1',
    studentName: 'Emma Student',
    courseId: 'course-1',
    courseName: 'Python Development',
    instructorName: 'Sarah Teacher',
    issueDate: '2024-05-15',
    grade: 'A',
    score: 92,
  },
];

const initialTasks: ExtendedTask[] = [
  {
    id: 'task-1',
    title: 'Complete Python Assignment',
    description: 'Finish the Python basics assignment',
    assignedById: 'teacher-1',
    assignedByName: 'Sarah Teacher',
    assignedByRole: 'teacher',
    assignedToId: 'student-1',
    assignedToName: 'Emma Student',
    assignedToRole: 'student',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [],
  },
  {
    id: 'task-2',
    title: 'Grade Assignments',
    description: 'Grade student assignments',
    assignedById: 'admin-1',
    assignedByName: 'Admin User',
    assignedByRole: 'admin',
    assignedToId: 'teacher-1',
    assignedToName: 'Sarah Teacher',
    assignedToRole: 'teacher',
    priority: 'medium',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    createdAt: new Date(Date.now() - 129600000).toISOString(),
    comments: [],
  },
  {
    id: 'task-3',
    title: 'Review Applications',
    description: 'Review teacher applications',
    assignedById: 'super-admin-1',
    assignedByName: 'Super Admin',
    assignedByRole: 'super-admin',
    assignedToId: 'admin-1',
    assignedToName: 'Admin User',
    assignedToRole: 'admin',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    comments: [],
  },
];

// ✅ NEW: Initial Leaves
const initialLeaves: LeaveRequest[] = [];

// =====================
// Provider Component
// =====================
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>(initialFeedbacks);
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks);
 const [, setAssignments] = useState<Assignment[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves); // ✅ NEW

  // Attendance
  const addAttendanceRecord = useCallback((record: AttendanceRecord) => {
    setAttendanceRecords(prev => [...prev, record]);
  }, []);

  const updateAttendanceRecord = useCallback((id: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  // Class Summaries
  const addClassSummary = useCallback((summary: ClassSummary) => {
    setClassSummaries(prev => {
      if (prev.some(s => s.eventId === summary.eventId)) return prev;
      return [...prev, summary];
    });
  }, []);

  const getClassSummary = useCallback((eventId: string) => {
    return classSummaries.find(s => s.eventId === eventId);
  }, [classSummaries]);

  // Student Activities
  const addStudentActivity = useCallback((activity: StudentActivity) => {
    setStudentActivities(prev => [...prev, activity]);
  }, []);

  const getActivitiesForEvent = useCallback((eventId: string) => {
    return studentActivities.filter(a => a.eventId === eventId);
  }, [studentActivities]);

  // Activities
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

  // Messages
  const sendMessage = useCallback((msg: Omit<Message, 'id' | 'read' | 'createdAt' | 'replies'>) => {
    setMessages(prev => [{
      ...msg,
      id: `msg-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      replies: [],
    }, ...prev]);
  }, []);

  const replyMessage = useCallback((msgId: string, reply: Omit<MessageReply, 'id' | 'createdAt'>) => {
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
  }, []);

  const markMessageRead = useCallback((msgId: string) => {
    setMessages(prev => prev.map(msg => msg.id === msgId ? { ...msg, read: true } : msg));
  }, []);

  const deleteMessage = useCallback((msgId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== msgId));
  }, []);

  // Notifications
  const addNotificationItem = useCallback((notif: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => {
    setNotifications(prev => [{
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback((userId: string) => {
    setNotifications(prev => prev.map(n => 
      (n.userId === userId || n.userId === 'all') ? { ...n, read: true } : n
    ));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Feedback
  const submitFeedback = useCallback((fb: Omit<FeedbackType, 'id' | 'createdAt' | 'updatedAt'>) => {
    setFeedbacks(prev => [{
      ...fb,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const getFeedbackByStudent = useCallback((studentId: string) => {
    return feedbacks.filter(f => f.studentId === studentId && !f.isDeleted);
  }, [feedbacks]);

  const getFeedbackByRecipient = useCallback((recipientId: string) => {
    return feedbacks.filter(f => f.recipientId === recipientId && !f.isDeleted);
  }, [feedbacks]);

  const updateFeedback = useCallback((id: string, updates: Partial<Omit<FeedbackType, 'id' | 'createdAt' | 'createdBy'>>) => {
    setFeedbacks(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
    ));
  }, []);

  const deleteFeedback = useCallback((id: string) => {
    setFeedbacks(prev => prev.map(f => 
      f.id === id ? { ...f, isDeleted: true } : f
    ));
  }, []);

  // Certificates
  const addCertificate = useCallback((cert: Omit<Certificate, 'id'>) => {
    setCertificates(prev => [...prev, { ...cert, id: `cert-${Date.now()}` }]);
  }, []);

  const getCertificatesForStudent = useCallback((studentId: string) => {
    return certificates.filter(c => c.studentId === studentId);
  }, [certificates]);

  // Tasks
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: ExtendedTask = {
      id: `task-${Date.now()}`,
      title: task.title,
      description: task.description,
      assignedById: task.userId,
      assignedByName: 'System',
      assignedByRole: 'system',
      assignedToId: task.userId,
      assignedToName: 'User',
      assignedToRole: 'user',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTasksByUser = useCallback((userId: string) => {
    return tasks.filter(t => t.assignedToId === userId || t.assignedById === userId) as unknown as Task[];
  }, [tasks]);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() } : t
    ));
  }, []);

  const createTask = useCallback((task: Omit<ExtendedTask, 'id' | 'createdAt' | 'comments'>) => {
    const newTask: ExtendedTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTaskStatus = useCallback((id: string, status: ExtendedTask['status']) => {
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
  }, []);

  const addTaskComment = useCallback((taskId: string, comment: TaskComment) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...t.comments, comment],
        };
      }
      return t;
    }));
  }, []);

  // Announcement
  const addAnnouncement = useCallback((announcement: Announcement) => {
    console.log('Announcement broadcasted:', announcement);
    addNotificationItem({
      userId: 'all',
      title: announcement.title,
      message: announcement.message,
      type: announcement.type
    });
  }, [addNotificationItem]);

  // Assignment
  const submitAssignment = useCallback((assignment: Assignment) => {
    const submittedAssignment = {
      ...assignment,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    setAssignments(prev => [...prev, submittedAssignment]);
    
    addNotificationItem({
      userId: assignment.studentId,
      title: 'Assignment Submitted',
      message: `Your assignment "${assignment.title}" has been submitted successfully`,
      type: 'success'
    });
    
    console.log('Assignment submitted:', submittedAssignment);
  }, [addNotificationItem]);

  // ✅ NEW: Leave Functions
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
    leaves, addLeave, getStudentLeaves, getAllApprovedLeaves, // ✅ NEW
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