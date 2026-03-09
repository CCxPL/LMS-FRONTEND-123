import type { Course, Assignment, Quiz, Enrollment } from '../types/course.types';
import { MOCK_COURSES_DATA } from '../utils/constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for dynamic data
let courses: Course[] = [...MOCK_COURSES_DATA];
let enrollments: Enrollment[] = [
  {
    id: 'e1',
    courseId: '1',
    courseName: 'React.js Complete Course',
    studentId: '4',
    studentName: 'Aakash Student',
    studentEmail: 'student@lms.com',
    enrolledAt: '2024-01-20',
    progress: 45,
    status: 'active'
  }
];

let assignments: Assignment[] = [
  {
    id: 'a1',
    title: 'Build a React Component',
    description: 'Create a reusable React component with props and state',
    courseId: '1',
    courseName: 'React.js Complete Course',
    dueDate: '2024-05-20',
    totalMarks: 100,
    status: 'pending',
    submissionsCount: 5
  },
  {
    id: 'a2',
    title: 'State Management Project',
    description: 'Implement state management using Context API',
    courseId: '1',
    courseName: 'React.js Complete Course',
    dueDate: '2024-05-25',
    totalMarks: 150,
    status: 'pending',
    submissionsCount: 3
  }
];

let quizzes: Quiz[] = [
  {
    id: 'q1',
    title: 'React Fundamentals Quiz',
    courseId: '1',
    courseName: 'React.js Complete Course',
    totalQuestions: 10,
    totalMarks: 100,
    duration: 30,
    passingPercentage: 60,
    maxAttempts: 3,
    attempts: 1,
    status: 'completed',
    obtainedMarks: 85
  },
  {
    id: 'q2',
    title: 'Hooks & State Quiz',
    courseId: '1',
    courseName: 'React.js Complete Course',
    totalQuestions: 15,
    totalMarks: 150,
    duration: 45,
    passingPercentage: 60,
    maxAttempts: 2,
    attempts: 0,
    status: 'not-started'
  }
];

export const courseService = {
  // Courses
  getAllCourses: async (): Promise<Course[]> => {
    await delay(500);
    return courses;
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    await delay(300);
    return courses.find(c => c.id === id);
  },

  getCoursesByInstructor: async (instructorId: string): Promise<Course[]> => {
    await delay(400);
    return courses.filter(c => c.instructorId === instructorId);
  },

  getPublishedCourses: async (): Promise<Course[]> => {
    await delay(400);
    return courses.filter(c => c.status === 'published');
  },

  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    await delay(600);
    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseData.title || '',
      description: courseData.description || '',
      instructor: courseData.instructor || '',
      instructorId: courseData.instructorId || '',
      category: courseData.category || 'General',
      level: courseData.level || 'beginner',
      status: 'draft',
      price: courseData.price || 0,
      duration: courseData.duration || '0h',
      enrolledStudents: 0,
      rating: 0,
      modules: courseData.modules || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    courses = [newCourse, ...courses];
    return newCourse;
  },

  updateCourse: async (id: string, updates: Partial<Course>): Promise<Course | null> => {
    await delay(500);
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    courses[index] = { ...courses[index], ...updates, updatedAt: new Date().toISOString() };
    return courses[index];
  },

  deleteCourse: async (id: string): Promise<boolean> => {
    await delay(400);
    const initialLength = courses.length;
    courses = courses.filter(c => c.id !== id);
    return courses.length < initialLength;
  },

  // Assignments
  getAssignments: async (): Promise<Assignment[]> => {
    await delay(400);
    return assignments;
  },

  getAssignmentsByCourse: async (courseId: string): Promise<Assignment[]> => {
    await delay(300);
    return assignments.filter(a => a.courseId === courseId);
  },

  getAssignmentsByStudent: async (studentId: string): Promise<Assignment[]> => {
    await delay(300);
    return assignments.filter(a => a.studentId === studentId);
  },

  createAssignment: async (data: Partial<Assignment>): Promise<Assignment> => {
    await delay(500);
    const newAssignment: Assignment = {
      id: Date.now().toString(),
      title: data.title || '',
      description: data.description || '',
      courseId: data.courseId || '',
      courseName: data.courseName || '',
      dueDate: data.dueDate || '',
      totalMarks: data.totalMarks || 100,
      status: 'pending',
      submissionsCount: 0,
      createdAt: new Date().toISOString()
    };
    assignments = [newAssignment, ...assignments];
    return newAssignment;
  },

  submitAssignment: async (id: string, studentId: string, submittedText: string): Promise<Assignment | null> => {
    await delay(500);
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    assignments[index] = {
      ...assignments[index],
      studentId,
      submittedText,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };
    return assignments[index];
  },

  gradeAssignment: async (id: string, grade: number, feedback: string): Promise<Assignment | null> => {
    await delay(500);
    const index = assignments.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    assignments[index] = {
      ...assignments[index],
      obtainedMarks: grade,
      feedback,
      status: 'graded'
    };
    return assignments[index];
  },

  // Quizzes
  getQuizzes: async (): Promise<Quiz[]> => {
    await delay(400);
    return quizzes;
  },

  getQuizzesByCourse: async (courseId: string): Promise<Quiz[]> => {
    await delay(300);
    return quizzes.filter(q => q.courseId === courseId);
  },

  getQuizById: async (id: string): Promise<Quiz | undefined> => {
    await delay(300);
    return quizzes.find(q => q.id === id);
  },

  createQuiz: async (data: Partial<Quiz>): Promise<Quiz> => {
    await delay(500);
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: data.title || '',
      courseId: data.courseId || '',
      courseName: data.courseName || '',
      totalQuestions: data.totalQuestions || 0,
      totalMarks: data.totalMarks || 0,
      duration: data.duration || 30,
      passingPercentage: data.passingPercentage || 60,
      maxAttempts: data.maxAttempts || 1,
      attempts: 0,
      status: 'not-started'
    };
    quizzes = [newQuiz, ...quizzes];
    return newQuiz;
  },

  submitQuiz: async (quizId: string, score: number): Promise<Quiz | null> => {
    await delay(500);
    const index = quizzes.findIndex(q => q.id === quizId);
    if (index === -1) return null;
    
    quizzes[index] = {
      ...quizzes[index],
      attempts: quizzes[index].attempts + 1,
      obtainedMarks: score,
      status: 'completed'
    };
    return quizzes[index];
  },

  // Enrollments
  getEnrollments: async (): Promise<Enrollment[]> => {
    await delay(400);
    return enrollments;
  },

  getEnrollmentsByStudent: async (studentId: string): Promise<Enrollment[]> => {
    await delay(300);
    return enrollments.filter(e => e.studentId === studentId);
  },

  getEnrollmentsByCourse: async (courseId: string): Promise<Enrollment[]> => {
    await delay(300);
    return enrollments.filter(e => e.courseId === courseId);
  },

  enrollStudent: async (courseId: string, studentId: string, studentName: string, studentEmail: string): Promise<Enrollment> => {
    await delay(500);
    const course = courses.find(c => c.id === courseId);
    
    const newEnrollment: Enrollment = {
      id: Date.now().toString(),
      courseId,
      courseName: course?.title || '',
      studentId,
      studentName,
      studentEmail,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      status: 'active'
    };
    
    enrollments = [newEnrollment, ...enrollments];
    
    // Update course enrolled count
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      courses[courseIndex].enrolledStudents += 1;
    }
    
    return newEnrollment;
  },

  updateProgress: async (enrollmentId: string, progress: number): Promise<Enrollment | null> => {
    await delay(300);
    const index = enrollments.findIndex(e => e.id === enrollmentId);
    if (index === -1) return null;
    
    enrollments[index] = {
      ...enrollments[index],
      progress,
      status: progress >= 100 ? 'completed' : 'active'
    };
    return enrollments[index];
  },

  isEnrolled: async (courseId: string, studentId: string): Promise<boolean> => {
    await delay(200);
    return enrollments.some(e => e.courseId === courseId && e.studentId === studentId);
  }
};