import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import type {
  AttendanceRecord,
  ClassSummary,
  StudentActivity,
} from '../types/attendance.types';

import type { Activity } from '../types/activity.types';
import type { Feedback as FeedbackType } from '../types/feedback.types';
import type { LeaveRequest } from '../types/leave.types';

import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   CONTEXT TYPE
========================================================= */

interface DataContextType {
  /* ---------------- ATTENDANCE ---------------- */

  attendanceRecords: AttendanceRecord[];

  addAttendanceRecord: (
    record: AttendanceRecord
  ) => void;

  updateAttendanceRecord: (
    id: string,
    updates: Partial<AttendanceRecord>
  ) => void;

  /* ---------------- CLASS SUMMARY ---------------- */

  classSummaries: ClassSummary[];

  addClassSummary: (
    summary: ClassSummary
  ) => void;

  getClassSummary: (
    eventId: string
  ) => ClassSummary | undefined;

  /* ---------------- STUDENT ACTIVITIES ---------------- */

  studentActivities: StudentActivity[];

  addStudentActivity: (
    activity: StudentActivity
  ) => void;

  getActivitiesForEvent: (
    eventId: string
  ) => StudentActivity[];

  /* ---------------- GENERAL ACTIVITIES ---------------- */

  activities: Activity[];

  addActivity: (
    activity: Activity
  ) => void;

  getActivities: (
    filter?: {
      type?: string;
      actorId?: string;
    }
  ) => Activity[];

  /* ---------------- MESSAGES ---------------- */

  messages: Message[];

  sendMessage: (
    msg: Omit<
      Message,
      'id' | 'read' | 'createdAt' | 'replies'
    >
  ) => Promise<void>;

  replyMessage: (
    msgId: string,
    reply: Omit<
      MessageReply,
      'id' | 'createdAt'
    >
  ) => Promise<void>;

  markMessageRead: (
    msgId: string
  ) => Promise<void>;

  deleteMessage: (
    msgId: string
  ) => Promise<void>;

  /* ---------------- NOTIFICATIONS ---------------- */

  notifications: NotificationItem[];

  addNotificationItem: (
    notif: Omit<
      NotificationItem,
      'id' | 'read' | 'createdAt'
    >
  ) => Promise<void>;

  markRead: (
    id: string
  ) => Promise<void>;

  markAllRead: (
    userId: string
  ) => Promise<void>;

  clearNotification: (
    id: string
  ) => Promise<void>;

  /* ---------------- FEEDBACK ---------------- */

  feedbacks: FeedbackType[];

  submitFeedback: (
    fb: Omit<
      FeedbackType,
      'id' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<void>;

  getFeedbackByStudent: (
    studentId: string
  ) => FeedbackType[];

  getFeedbackByRecipient: (
    recipientId: string
  ) => FeedbackType[];

  updateFeedback: (
    id: string,
    updates: Partial<
      Omit<
        FeedbackType,
        'id' | 'createdAt' | 'createdBy'
      >
    >
  ) => Promise<void>;

  deleteFeedback: (
    id: string
  ) => Promise<void>;

  /* ---------------- CERTIFICATES ---------------- */

  certificates: Certificate[];

  addCertificate: (
    cert: Omit<Certificate, 'id'>
  ) => Promise<void>;

  getCertificatesForStudent: (
    studentId: string
  ) => Certificate[];

  /* ---------------- TASKS ---------------- */

  tasks: ExtendedTask[];

  addTask: (
    task: Omit<
      Task,
      'id' | 'createdAt'
    >
  ) => Promise<void>;

  updateTask: (
    id: string,
    updates: Partial<Task>
  ) => Promise<void>;

  deleteTask: (
    id: string
  ) => Promise<void>;

  getTasksByUser: (
    userId: string
  ) => Task[];

  completeTask: (
    id: string
  ) => Promise<void>;

  createTask: (
    task: Omit<
      ExtendedTask,
      'id' | 'createdAt' | 'comments'
    >
  ) => Promise<void>;

  updateTaskStatus: (
    id: string,
    status: ExtendedTask['status']
  ) => Promise<void>;

  addTaskComment: (
    taskId: string,
    comment: TaskComment
  ) => Promise<void>;

  /* ---------------- ANNOUNCEMENT ---------------- */

  addAnnouncement: (
    announcement: Announcement
  ) => Promise<void>;

  /* ---------------- ASSIGNMENT ---------------- */

  submitAssignment: (
    assignment: Assignment
  ) => Promise<void>;

  /* ---------------- LEAVES ---------------- */

  leaves: LeaveRequest[];

  addLeave: (
    leave: LeaveRequest
  ) => Promise<void>;

  getStudentLeaves: (
    studentId: string
  ) => LeaveRequest[];

  getAllApprovedLeaves: () => LeaveRequest[];
}

/* =========================================================
   CONTEXT
========================================================= */

const DataContext =
  createContext<DataContextType | undefined>(
    undefined
  );

/* =========================================================
   PROVIDER
========================================================= */

export const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();

  /* =======================================================
     EMPTY STATE
     No mock/demo data.
  ======================================================= */

  const [
    attendanceRecords,
    setAttendanceRecords,
  ] = useState<AttendanceRecord[]>([]);

  const [
    classSummaries,
    setClassSummaries,
  ] = useState<ClassSummary[]>([]);

  const [
    studentActivities,
    setStudentActivities,
  ] = useState<StudentActivity[]>([]);

  const [
    activities,
    setActivities,
  ] = useState<Activity[]>([]);

  const [
    leaves,
    setLeaves,
  ] = useState<LeaveRequest[]>([]);

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([]);

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);

  const [
    feedbacks,
    setFeedbacks,
  ] = useState<FeedbackType[]>([]);

  const [
    certificates,
    setCertificates,
  ] = useState<Certificate[]>([]);

  const [
    tasks,
    setTasks,
  ] = useState<ExtendedTask[]>([]);

  const [, setAssignments] =
    useState<Assignment[]>([]);

  /* =======================================================
     API REFRESH HELPERS
  ======================================================= */

  const loadMessages =
    useCallback(async () => {
      const response =
        await axiosInstance.get(
          '/messages/inbox'
        );

      const data =
        response.data?.data?.messages;

      setMessages(
        Array.isArray(data) ? data : []
      );
    }, []);

  const loadNotifications =
    useCallback(async () => {
      const response =
        await axiosInstance.get(
          '/notifications'
        );

      const data =
        response.data?.data?.notifications;

      setNotifications(
        Array.isArray(data) ? data : []
      );
    }, []);

  const loadTasks =
    useCallback(async () => {
      const response =
        await axiosInstance.get('/tasks');

      const data =
        response.data?.data?.tasks;

      setTasks(
        Array.isArray(data) ? data : []
      );
    }, []);

  const loadCertificates =
    useCallback(async () => {
      if (user?.role !== 'student') {
        setCertificates([]);
        return;
      }

      const response =
        await axiosInstance.get(
          '/certificates/my'
        );

      const data =
        response.data?.data?.certificates;

      setCertificates(
        Array.isArray(data) ? data : []
      );
    }, [user?.role]);

  const loadFeedbacks =
    useCallback(async () => {
      try {
        const endpoint = user?.role === 'student' ? '/feedback/my' : '/feedback';
        const response = await axiosInstance.get(endpoint);
        const data = response.data?.data?.feedbacks || response.data?.feedbacks || [];
        const mapped = (Array.isArray(data) ? data : []).map((f: any) => ({
          ...f,
          id: f.id || f._id,
          _id: f._id || f.id,
        }));
        setFeedbacks(mapped);
      } catch (error) {
        console.error('Failed to load feedbacks:', error);
        setFeedbacks([]);
      }
    }, [user?.role]);

  const loadLeaves =
    useCallback(async () => {
      try {
        const endpoint = user?.role === 'student' ? '/leaves/my' : '/leaves';
        const response = await axiosInstance.get(endpoint);
        const data = response.data?.data?.leaves || response.data?.leaves || [];
        const mapped = (Array.isArray(data) ? data : []).map((l: any) => {
          const startStr = l.startDate ? new Date(l.startDate).toISOString().split('T')[0] : (l.start || '');
          const endStr = l.endDate ? new Date(l.endDate).toISOString().split('T')[0] : (l.end || '');
          return {
            ...l,
            id: l.id || l._id,
            _id: l._id || l.id,
            start: startStr,
            end: endStr,
            days: Array.isArray(l.days) ? l.days : [startStr],
          };
        });
        setLeaves(mapped);
      } catch (error) {
        console.error('Failed to load leaves:', error);
        setLeaves([]);
      }
    }, [user?.role]);

  const loadAttendance =
    useCallback(async () => {
      try {
        const endpoint = user?.role === 'student' ? '/attendance/student' : '/attendance/all';
        const response = await axiosInstance.get(endpoint);
        const data = response.data?.data?.attendance || response.data?.attendance || [];
        const mapped = (Array.isArray(data) ? data : []).map((a: any) => ({
          ...a,
          id: a.id || a._id,
          _id: a._id || a.id,
          studentId: a.userId || a.studentId,
          studentName: a.userName || a.studentName,
          studentEmail: a.userEmail || a.studentEmail,
          isPresent: a.isPresent !== undefined ? a.isPresent : (a.status === 'present' || a.status === 'late'),
          joinTime: a.joinedAt ? new Date(a.joinedAt).toISOString() : (a.joinTime || null),
          leaveTime: a.leftAt ? new Date(a.leftAt).toISOString() : (a.leaveTime || null),
        }));
        setAttendanceRecords(mapped);
      } catch (error) {
        console.error('Failed to load attendance:', error);
        setAttendanceRecords([]);
      }
    }, [user?.role]);

  const loadClassSummaries =
    useCallback(async () => {
      try {
        const response = await axiosInstance.get('/attendance/summary');
        const data = response.data?.data?.summaries || response.data?.summaries || [];
        setClassSummaries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load class summaries:', error);
        setClassSummaries([]);
      }
    }, []);

  const loadStudentActivities =
    useCallback(async () => {
      try {
        const response = await axiosInstance.get('/attendance/student-activity');
        const data = response.data?.data?.activities || response.data?.activities || [];
        setStudentActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load student activities:', error);
        setStudentActivities([]);
      }
    }, []);

  const loadActivities =
    useCallback(async () => {
      try {
        const response = await axiosInstance.get('/activity');
        const data = response.data?.data?.activities || response.data?.activities || [];
        setActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load activities:', error);
        setActivities([]);
      }
    }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setNotifications([]);
      setTasks([]);
      setCertificates([]);

      setFeedbacks([]);
      setLeaves([]);

      setAttendanceRecords([]);
      setClassSummaries([]);
      setStudentActivities([]);
      setActivities([]);

      return;
    }

    const loadData = async () => {
      await Promise.allSettled([
        loadMessages(),
        loadNotifications(),
        loadTasks(),
        loadCertificates(),
        loadFeedbacks(),
        loadLeaves(),
        loadAttendance(),
        loadClassSummaries(),
        loadStudentActivities(),
        loadActivities(),
      ]);
    };

    void loadData();
  }, [
    user,
    loadMessages,
    loadNotifications,
    loadTasks,
    loadCertificates,
    loadFeedbacks,
    loadLeaves,
    loadAttendance,
    loadClassSummaries,
    loadStudentActivities,
    loadActivities,
  ]);

  /* =======================================================
     ATTENDANCE
     Backend / MySQL backed via Prisma.
  ======================================================= */

  const addAttendanceRecord =
    useCallback(
      async (record: AttendanceRecord) => {
        try {
          const res = await axiosInstance.post('/attendance/join', { eventId: record.eventId });
          const newRecord = res.data?.data?.attendance || res.data?.attendance;
          if (newRecord) {
            setAttendanceRecords((prev) => [
              { ...newRecord, isPresent: true },
              ...prev.filter((r) => r.id !== newRecord.id),
            ]);
          }
          await loadAttendance();
        } catch (error) {
          console.error('Failed to add attendance record:', error);
          setAttendanceRecords((prev) => [record, ...prev.filter((r) => r.id !== record.id)]);
        }
      },
      [loadAttendance]
    );

  const updateAttendanceRecord =
    useCallback(
      async (id: string, updates: Partial<AttendanceRecord>) => {
        try {
          if (updates.leftAt || updates.leaveTime) {
            const res = await axiosInstance.post('/attendance/leave', { eventId: updates.eventId || id });
            const updated = res.data?.data?.attendance || res.data?.attendance;
            if (updated) {
              setAttendanceRecords((prev) =>
                prev.map((r) => (r.id === (updated.id || id) ? { ...r, ...updated } : r))
              );
            }
          } else {
            setAttendanceRecords((prev) =>
              prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
            );
          }
          await loadAttendance();
        } catch (error) {
          console.error('Failed to update attendance record:', error);
          setAttendanceRecords((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
          );
        }
      },
      [loadAttendance]
    );

  /* =======================================================
     CLASS SUMMARIES
     Backend / MySQL backed via Prisma.
  ======================================================= */

  const addClassSummary =
    useCallback(
      async (summary: ClassSummary) => {
        try {
          const res = await axiosInstance.post('/attendance/summary', summary);
          const saved = res.data?.data?.summary || res.data?.summary || summary;
          setClassSummaries((prev) => [
            saved,
            ...prev.filter((s) => s.id !== saved.id && s.eventId !== saved.eventId),
          ]);
        } catch (error) {
          console.error('Failed to save class summary:', error);
          setClassSummaries((prev) => [
            summary,
            ...prev.filter((s) => s.id !== summary.id && s.eventId !== summary.eventId),
          ]);
        }
      },
      []
    );

  const getClassSummary =
    useCallback(
      (
        eventId: string
      ): ClassSummary | undefined => {
        return classSummaries.find(
          (summary) =>
            summary.eventId === eventId
        );
      },
      [classSummaries]
    );

  /* =======================================================
     STUDENT ACTIVITIES
     Backend / MySQL backed via Prisma.
  ======================================================= */

  const addStudentActivity =
    useCallback(
      async (activity: StudentActivity) => {
        try {
          const res = await axiosInstance.post('/attendance/student-activity', activity);
          const saved = res.data?.data?.activity || res.data?.activity || activity;
          setStudentActivities((prev) => [saved, ...prev]);
        } catch (error) {
          console.error('Failed to save student activity:', error);
          setStudentActivities((prev) => [activity, ...prev]);
        }
      },
      []
    );

  const getActivitiesForEvent =
    useCallback(
      (
        eventId: string
      ): StudentActivity[] => {
        return studentActivities.filter(
          (activity) =>
            activity.eventId === eventId
        );
      },
      [studentActivities]
    );

  /* =======================================================
     GENERAL ACTIVITIES
     Backend / MySQL backed via Prisma.
  ======================================================= */

  const addActivity =
    useCallback(
      async (activity: Activity) => {
        try {
          const res = await axiosInstance.post('/activity', {
            type: activity.type,
            action: (activity as any).action || activity.type,
            details: activity.metadata ? JSON.stringify(activity.metadata) : (activity.targetName || ''),
          });
          const saved = res.data?.data?.activity || res.data?.activity;
          if (saved) {
            setActivities((prev) => [saved, ...prev]);
          }
        } catch (error) {
          console.error('Failed to save activity:', error);
          setActivities((prev) => [activity, ...prev]);
        }
      },
      []
    );

  const getActivities =
    useCallback(
      (
        filter?: {
          type?: string;
          actorId?: string;
        }
      ) => {
        if (!filter) {
          return activities;
        }

        return activities.filter(
          (activity) => {
            if (
              filter.type &&
              activity.type !== filter.type
            ) {
              return false;
            }

            if (
              filter.actorId &&
              activity.actorId !==
                filter.actorId
            ) {
              return false;
            }

            return true;
          }
        );
      },
      [activities]
    );

  /* =======================================================
     MESSAGES
     Backend / MySQL backed.
  ======================================================= */

  const sendMessage =
    useCallback(
      async (
        msg: Omit<
          Message,
          | 'id'
          | 'read'
          | 'createdAt'
          | 'replies'
        >
      ) => {
        try {
          await axiosInstance.post(
            '/messages',
            msg
          );

          /*
           * Reload from backend.
           * Backend/MySQL remains source of truth.
           */
          await loadMessages();
        } catch (error) {
          console.error(
            'Failed to send message:',
            error
          );

          throw error;
        }
      },
      [loadMessages]
    );

  const replyMessage =
    useCallback(
      async (
        msgId: string,
        reply: Omit<
          MessageReply,
          'id' | 'createdAt'
        >
      ) => {
        try {
          await axiosInstance.post(
            `/messages/${msgId}/reply`,
            reply
          );

          /*
           * No fake reply-${Date.now()} ID.
           * Reload server-generated data.
           */
          await loadMessages();
        } catch (error) {
          console.error(
            'Failed to reply to message:',
            error
          );

          throw error;
        }
      },
      [loadMessages]
    );

  const markMessageRead =
    useCallback(
      async (msgId: string) => {
        try {
          await axiosInstance.patch(
            `/messages/${msgId}/read`
          );

          await loadMessages();
        } catch (error) {
          console.error(
            'Failed to mark message as read:',
            error
          );

          throw error;
        }
      },
      [loadMessages]
    );

  const deleteMessage =
    useCallback(
      async (msgId: string) => {
        try {
          await axiosInstance.delete(
            `/messages/${msgId}`
          );

          await loadMessages();
        } catch (error) {
          console.error(
            'Failed to delete message:',
            error
          );

          throw error;
        }
      },
      [loadMessages]
    );

  /* =======================================================
     NOTIFICATIONS
     Backend / MySQL backed.
  ======================================================= */

  const addNotificationItem =
    useCallback(
      async (
        notif: Omit<
          NotificationItem,
          'id' | 'read' | 'createdAt'
        >
      ) => {
        try {
          await axiosInstance.post(
            '/notifications',
            notif
          );

          /*
           * No notif-${Date.now()}.
           */
          await loadNotifications();
        } catch (error) {
          console.error(
            'Failed to create notification:',
            error
          );

          throw error;
        }
      },
      [loadNotifications]
    );

  const markRead =
    useCallback(
      async (id: string) => {
        try {
          await axiosInstance.patch(
            `/notifications/${id}/read`
          );

          await loadNotifications();
        } catch (error) {
          console.error(
            'Failed to mark notification read:',
            error
          );

          throw error;
        }
      },
      [loadNotifications]
    );

  const markAllRead =
    useCallback(
      async (_userId: string) => {
        try {
          await axiosInstance.patch(
            '/notifications/mark-all-read'
          );

          await loadNotifications();
        } catch (error) {
          console.error(
            'Failed to mark all notifications read:',
            error
          );

          throw error;
        }
      },
      [loadNotifications]
    );

  const clearNotification =
    useCallback(
      async (id: string) => {
        try {
          await axiosInstance.delete(
            `/notifications/${id}`
          );

          await loadNotifications();
        } catch (error) {
          console.error(
            'Failed to delete notification:',
            error
          );

          throw error;
        }
      },
      [loadNotifications]
    );

  /* =======================================================
     FEEDBACK
     Backend / MySQL backed via Prisma.
  ======================================================= */

  const submitFeedback =
    useCallback(
      async (
        fb: Omit<
          FeedbackType,
          'id' | 'createdAt' | 'updatedAt'
        >
      ) => {
        try {
          await axiosInstance.post('/feedback', {
            recipientId: fb.recipientId,
            recipientType: fb.recipientType,
            recipientName: fb.recipientName,
            feedbackText: fb.feedbackText,
            rating: fb.rating,
            category: fb.category,
          });

          await loadFeedbacks();
        } catch (error) {
          console.error(
            'Failed to submit feedback:',
            error
          );
          throw error;
        }
      },
      [loadFeedbacks]
    );

  const getFeedbackByStudent =
    useCallback(
      (
        studentId: string
      ): FeedbackType[] => {
        return feedbacks.filter(
          (feedback) =>
            feedback.studentId ===
              studentId &&
            !feedback.isDeleted
        );
      },
      [feedbacks]
    );

  const getFeedbackByRecipient =
    useCallback(
      (
        recipientId: string
      ): FeedbackType[] => {
        return feedbacks.filter(
          (feedback) =>
            feedback.recipientId ===
              recipientId &&
            !feedback.isDeleted
        );
      },
      [feedbacks]
    );

  const updateFeedback =
    useCallback(
      async (
        id: string,
        updates: Partial<
          Omit<
            FeedbackType,
            'id' | 'createdAt' | 'createdBy'
          >
        >
      ) => {
        try {
          await axiosInstance.put(
            `/feedback/${id}`,
            updates
          );

          await loadFeedbacks();
        } catch (error) {
          console.error(
            'Failed to update feedback:',
            error
          );
          throw error;
        }
      },
      [loadFeedbacks]
    );

  const deleteFeedback =
    useCallback(
      async (id: string) => {
        try {
          await axiosInstance.delete(
            `/feedback/${id}`
          );

          await loadFeedbacks();
        } catch (error) {
          console.error(
            'Failed to delete feedback:',
            error
          );
          throw error;
        }
      },
      [loadFeedbacks]
    );

  /* =======================================================
     CERTIFICATES
     Backend / MySQL backed where endpoint supports it.
  ======================================================= */

  const addCertificate =
    useCallback(
      async (
        cert: Omit<
          Certificate,
          'id'
        >
      ) => {
        try {
          await axiosInstance.post(
            '/certificates/issue',
            cert
          );

          /*
           * Student certificate list can be refreshed
           * from backend when current role is student.
           */
          if (user?.role === 'student') {
            await loadCertificates();
          }
        } catch (error) {
          console.error(
            'Failed to issue certificate:',
            error
          );

          throw error;
        }
      },
      [
        user?.role,
        loadCertificates,
      ]
    );

  const getCertificatesForStudent =
    useCallback(
      (
        studentId: string
      ): Certificate[] => {
        return certificates.filter(
          (certificate) =>
            certificate.studentId ===
            studentId
        );
      },
      [certificates]
    );

  /* =======================================================
     TASKS
     Backend / MySQL backed.
  ======================================================= */

  const addTask =
    useCallback(
      async (
        task: Omit<
          Task,
          'id' | 'createdAt'
        >
      ) => {
        try {
          await axiosInstance.post(
            '/tasks',
            task
          );

          await loadTasks();
        } catch (error) {
          console.error(
            'Failed to add task:',
            error
          );

          throw error;
        }
      },
      [loadTasks]
    );

  const updateTask =
    useCallback(
      async (
        id: string,
        updates: Partial<Task>
      ) => {
        try {
          await axiosInstance.put(
            `/tasks/${id}`,
            updates
          );

          await loadTasks();
        } catch (error) {
          console.error(
            'Failed to update task:',
            error
          );

          throw error;
        }
      },
      [loadTasks]
    );

  const deleteTask =
    useCallback(
      async (id: string) => {
        try {
          await axiosInstance.delete(
            `/tasks/${id}`
          );

          await loadTasks();
        } catch (error) {
          console.error(
            'Failed to delete task:',
            error
          );

          throw error;
        }
      },
      [loadTasks]
    );

  const getTasksByUser =
    useCallback(
      (
        userId: string
      ): Task[] => {
        return tasks.filter(
          (task) =>
            task.assignedToId ===
              userId ||
            task.assignedById ===
              userId
        ) as unknown as Task[];
      },
      [tasks]
    );

  const completeTask =
    useCallback(
      async (id: string) => {
        try {
          await axiosInstance.patch(
            `/tasks/${id}/status`,
            {
              status: 'completed',
            }
          );

          await loadTasks();
        } catch (error) {
          console.error(
            'Failed to complete task:',
            error
          );

          throw error;
        }
      },
      [loadTasks]
    );

  const createTask =
    useCallback(
      async (
        task: Omit<
          ExtendedTask,
          | 'id'
          | 'createdAt'
          | 'comments'
        >
      ) => {
        try {
          await axiosInstance.post(
            '/tasks',
            task
          );

          await loadTasks();
        } catch (error) {
          console.error(
            'Failed to create task:',
            error
          );

          throw error;
        }
      },
      [loadTasks]
    );

  const updateTaskStatus =
    useCallback(
      async (
        id: string,
        status: ExtendedTask['status']
      ) => {
        try {
          await axiosInstance.patch(
            `/tasks/${id}/status`,
            {
              status,
            }
          );

          await loadTasks();
        } catch (error) {
          console.error(
            'Failed to update task status:',
            error
          );

          throw error;
        }
      },
      [loadTasks]
    );

  const addTaskComment =
    useCallback(
      async (
        taskId: string,
        comment: TaskComment
      ) => {
        try {
          await axiosInstance.post(
            `/tasks/${taskId}/comments`,
            comment
          );

          /*
           * Do not append the client object directly.
           * Reload backend-generated comment/ID.
           */
          await loadTasks();
        } catch (error) {
          console.error(
            'Failed to add task comment:',
            error
          );

          throw error;
        }
      },
      [loadTasks]
    );

  /* =======================================================
     ANNOUNCEMENT
     Uses real notification API.
  ======================================================= */

  const addAnnouncement =
    useCallback(
      async (
        announcement: Announcement
      ) => {
        await addNotificationItem({
          userId: 'all',
          title:
            announcement.title,
          message:
            announcement.message,
          type:
            announcement.type,
        });
      },
      [addNotificationItem]
    );

  /* =======================================================
     ASSIGNMENT
     Backend / MySQL backed.
  ======================================================= */

  const submitAssignment =
    useCallback(
      async (
        assignment: Assignment
      ) => {
        try {
          const response =
            await axiosInstance.post(
              `/assignments/${assignment.id}/submit`,
              {
                submittedText:
                  assignment.submittedText,
              }
            );

          const submitted =
            response.data?.data?.assignment ||
            response.data?.data?.submission;

          if (submitted) {
            setAssignments(
              (previous) => [
                ...previous,
                submitted,
              ]
            );
          }

          /*
           * Notification creation may be restricted
           * by backend roles.
           *
           * Assignment itself is already saved even
           * if notification creation fails.
           */
          try {
            await addNotificationItem({
              userId:
                assignment.studentId,
              title:
                'Assignment Submitted',
              message: `Your assignment "${assignment.title}" has been submitted successfully`,
              type: 'success',
            });
          } catch (notificationError) {
            console.warn(
              'Assignment saved, but notification could not be created:',
              notificationError
            );
          }
        } catch (error) {
          console.error(
            'Failed to submit assignment:',
            error
          );

          throw error;
        }
      },
      [addNotificationItem]
    );

  /* =======================================================
     LEAVES
     Backend / MySQL backed via Prisma.
  ======================================================= */

  const addLeave =
    useCallback(
      async (leave: LeaveRequest) => {
        try {
          await axiosInstance.post('/leaves/apply', {
            reason: leave.reason,
            startDate: leave.start,
            endDate: leave.end,
          });

          await loadLeaves();
        } catch (error) {
          console.error(
            'Failed to apply for leave:',
            error
          );
          throw error;
        }
      },
      [loadLeaves]
    );

  const getStudentLeaves =
    useCallback(
      (
        studentId: string
      ): LeaveRequest[] => {
        return leaves.filter(
          (leave) =>
            leave.studentId === studentId
        );
      },
      [leaves]
    );

  const getAllApprovedLeaves =
    useCallback((): LeaveRequest[] => {
      return leaves.filter(
        (leave) =>
          leave.status === 'approved'
      );
    }, [leaves]);

  /* =======================================================
     VALUE
  ======================================================= */

  const value: DataContextType = {
    /* Attendance */
    attendanceRecords,
    addAttendanceRecord,
    updateAttendanceRecord,

    /* Class Summary */
    classSummaries,
    addClassSummary,
    getClassSummary,

    /* Student Activities */
    studentActivities,
    addStudentActivity,
    getActivitiesForEvent,

    /* General Activities */
    activities,
    addActivity,
    getActivities,

    /* Messages */
    messages,
    sendMessage,
    replyMessage,
    markMessageRead,
    deleteMessage,

    /* Notifications */
    notifications,
    addNotificationItem,
    markRead,
    markAllRead,
    clearNotification,

    /* Feedback */
    feedbacks,
    submitFeedback,
    getFeedbackByStudent,
    getFeedbackByRecipient,
    updateFeedback,
    deleteFeedback,

    /* Certificates */
    certificates,
    addCertificate,
    getCertificatesForStudent,

    /* Tasks */
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTasksByUser,
    completeTask,
    createTask,
    updateTaskStatus,
    addTaskComment,

    /* Announcement */
    addAnnouncement,

    /* Assignment */
    submitAssignment,

    /* Leaves */
    leaves,
    addLeave,
    getStudentLeaves,
    getAllApprovedLeaves,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

/* =========================================================
   HOOK
========================================================= */

export const useData =
  (): DataContextType => {
    const context =
      useContext(DataContext);

    if (!context) {
      throw new Error(
        'useData must be used within a DataProvider'
      );
    }

    return context;
  };

export type {
  ExtendedTask as Task,
  TaskComment,
};