import type { UserRole } from './auth.types';

export interface Notification {
  id: string;
  userId: string;
  userRole: UserRole | string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: UserRole;
  toId: string;
  toName: string;
  toRole: UserRole | string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
  replies: MessageReply[];
  attachments?: string[];
}

export interface MessageReply {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: UserRole;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: UserRole;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: UserRole | string;
  comments: TaskComment[];
  createdAt?: string;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  createdAt?: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseName: string;
  rating: number;
  comment: string;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  courseName: string;
  studentId?: string;
  studentName?: string;
  dueDate: string;
  totalMarks: number;
  obtainedMarks?: number;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submittedText?: string;
  feedback?: string;
  submittedAt?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  instructorName: string;
  issueDate: string;
  grade: string;
  score: number;
}