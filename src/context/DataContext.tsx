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
      try {
        await loadMessages();
      } catch (error) {
        console.error(
          'Failed to load messages:',
          error
        );

        setMessages([]);
      }

      try {
        await loadNotifications();
      } catch (error) {
        console.error(
          'Failed to load notifications:',
          error
        );

        setNotifications([]);
      }

      try {
        await loadTasks();
      } catch (error) {
        console.error(
          'Failed to load tasks:',
          error
        );

        setTasks([]);
      }

      try {
        await loadCertificates();
      } catch (error) {
        console.error(
          'Failed to load certificates:',
          error
        );

        setCertificates([]);
      }

      /*
       * Feedback backend is currently unavailable.
       * Do NOT call /feedback/my until backend
       * route is implemented.
       */
      setFeedbacks([]);

      /*
       * Leave backend is currently unavailable.
       * Do NOT call /leaves/my until backend
       * route is implemented.
       */
      setLeaves([]);

      /*
       * Attendance backend is currently unavailable.
       */
      setAttendanceRecords([]);

      /*
       * Class summaries are currently not persisted
       * in backend.
       */
      setClassSummaries([]);

      /*
       * Student activity backend is currently
       * not available.
       */
      setStudentActivities([]);

      /*
       * General activity backend is currently
       * not available.
       */
      setActivities([]);
    };

    void loadData();
  }, [
    user,
    loadMessages,
    loadNotifications,
    loadTasks,
    loadCertificates,
  ]);

  /* =======================================================
     ATTENDANCE
     Disabled until real backend API exists.
  ======================================================= */

  const addAttendanceRecord =
    useCallback(
      (_record: AttendanceRecord) => {
        console.warn(
          'Attendance API is not implemented. Attendance was not saved.'
        );
      },
      []
    );

  const updateAttendanceRecord =
    useCallback(
      (
        _id: string,
        _updates: Partial<AttendanceRecord>
      ) => {
        console.warn(
          'Attendance API is not implemented. Attendance was not updated.'
        );
      },
      []
    );

  /* =======================================================
     CLASS SUMMARIES
     Disabled until backend API exists.
  ======================================================= */

  const addClassSummary =
    useCallback(
      (_summary: ClassSummary) => {
        console.warn(
          'Class Summary API is not implemented. Summary was not saved.'
        );
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
     Disabled until backend API exists.
  ======================================================= */

  const addStudentActivity =
    useCallback(
      (_activity: StudentActivity) => {
        console.warn(
          'Student Activity API is not implemented. Activity was not saved.'
        );
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
     Disabled until backend API exists.
  ======================================================= */

  const addActivity =
    useCallback(
      (_activity: Activity) => {
        console.warn(
          'Activity API is not implemented. Activity was not saved.'
        );
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
     Backend route not implemented yet.
     No local fake data.
  ======================================================= */

  const submitFeedback =
    useCallback(
      async (
        _fb: Omit<
          FeedbackType,
          'id' | 'createdAt' | 'updatedAt'
        >
      ) => {
        console.error(
          'Feedback API is not implemented yet.'
        );

        throw new Error(
          'Feedback service is currently unavailable.'
        );
      },
      []
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
        _id: string,
        _updates: Partial<
          Omit<
            FeedbackType,
            'id' | 'createdAt' | 'createdBy'
          >
        >
      ) => {
        console.error(
          'Feedback API is not implemented yet.'
        );

        throw new Error(
          'Feedback service is currently unavailable.'
        );
      },
      []
    );

  const deleteFeedback =
    useCallback(
      async (_id: string) => {
        console.error(
          'Feedback API is not implemented yet.'
        );

        throw new Error(
          'Feedback service is currently unavailable.'
        );
      },
      []
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
     Backend route not implemented yet.
     No local fake save.
  ======================================================= */

  const addLeave =
    useCallback(
      async (
        _leave: LeaveRequest
      ) => {
        console.error(
          'Leave API is not implemented yet.'
        );

        throw new Error(
          'Leave service is currently unavailable.'
        );
      },
      []
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