// src/types/data.types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  avatar?: string;
  phone?: string;
  batchId?: string;
}

export interface Batch {
  id: string;
  name: string;
  semester: number;
  startDate: string;
  endDate: string;
  totalStudents: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  instructorId: string;
  instructorName: string;
  credits: number;
  students: number;
  capacity: number;
  status: 'active' | 'inactive' | 'archived';
  enrollmentDeadline?: string;
  startDate?: string;
  endDate?: string;
  materials?: CourseMaterial[];
  assessments?: Assessment[];
  studentIds?: string[];
  isActive?: boolean;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'assignment';
  content: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadCount?: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  type: 'assignment' | 'quiz' | 'project';
  dueDate: string;
  totalPoints: number;
  submissionCount?: number;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  grade: string;
  score: number;
  issueDate: string;
  status?: 'pending' | 'approved' | 'uploaded' | 'denied';
  pdfUrl?: string;
  pdfFileName?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  totalQuestions: number;
  duration: number;
  passingScore: number;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  submissions?: AssignmentSubmission[];
  attachments?: string[];
  createdBy: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  files: string[];
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'dropped';
  grade?: string;
  gpa?: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  markedAt: string;
}

// ============================================
// UPDATED TYPES FOR dataService.ts
// ============================================

export interface TaskComment {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedById: string;
  assignedByName: string;
  assignedByRole: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: string;
  comments: TaskComment[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  userRole: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface MessageReply {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  body: string;
  createdAt: string;
}

export interface Message {
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

// ============================================
// OTHER TYPES
// ============================================

export interface Leave {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  leaveType: 'sick' | 'casual' | 'earned' | 'other';
  totalDays: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  eventType: 'class' | 'exam' | 'meeting' | 'holiday' | 'other';
  courseId?: string;
  courseName?: string;
  instructorId?: string;
  instructorName?: string;
  attendees?: string[];
  isRecurring?: boolean;
  recurringDays?: number[];
  color?: string;
  meetingLink?: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  type: 'festival' | 'announcement' | 'maintenance' | 'alert';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt?: string;
  targetRoles?: string[];
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
}