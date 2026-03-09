export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'pending' | 'published' | 'archived' | 'rejected';
  price: number;
  duration: string;
  enrolledStudents: number;
  maxStudents?: number;
  rating: number;
  reviewsCount?: number;
  thumbnail?: string;
  modules?: CourseModule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  order?: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  content?: string;
  videoUrl?: string;
  isCompleted?: boolean;
  order?: number;
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
  submissionsCount?: number;
  submittedText?: string;
  feedback?: string;
  createdAt?: string;
  submittedAt?: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  passingPercentage: number;
  maxAttempts: number;
  attempts: number;
  status: 'not-started' | 'in-progress' | 'completed';
  obtainedMarks?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  enrolledAt: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  completedAt?: string;
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
  certificateUrl?: string;
}