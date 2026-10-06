import axiosInstance from '../api/axiosInstance';
import type { Course, Assignment, Quiz, Enrollment } from '../types/course.types';

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const res = await axiosInstance.get('/courses');
    return res.data?.data?.courses || [];
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    const res = await axiosInstance.get(`/courses/${id}`);
    return res.data?.data?.course;
  },

  getCoursesByInstructor: async (instructorId: string): Promise<Course[]> => {
    const res = await axiosInstance.get('/courses', { params: { teacher: instructorId } });
    return res.data?.data?.courses || [];
  },

  getPublishedCourses: async (): Promise<Course[]> => {
    const res = await axiosInstance.get('/courses', { params: { status: 'published' } });
    return res.data?.data?.courses || [];
  },

  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    const res = await axiosInstance.post('/courses', courseData);
    return res.data?.data?.course;
  },

  updateCourse: async (id: string, updates: Partial<Course>): Promise<Course | null> => {
    const res = await axiosInstance.put(`/courses/${id}`, updates);
    return res.data?.data?.course;
  },

  deleteCourse: async (id: string): Promise<boolean> => {
    await axiosInstance.delete(`/courses/${id}`);
    return true;
  },

  // Assignments
  getAssignments: async (): Promise<Assignment[]> => {
    const res = await axiosInstance.get('/assignments');
    return res.data?.data?.assignments || [];
  },

  getAssignmentsByCourse: async (courseId: string): Promise<Assignment[]> => {
    const res = await axiosInstance.get('/assignments', { params: { courseId } });
    return res.data?.data?.assignments || [];
  },

  getAssignmentsByStudent: async (studentId: string): Promise<Assignment[]> => {
    const res = await axiosInstance.get('/assignments', { params: { studentId } });
    return res.data?.data?.assignments || [];
  },

  createAssignment: async (data: Partial<Assignment>): Promise<Assignment> => {
    const res = await axiosInstance.post('/assignments', data);
    return res.data?.data?.assignment;
  },

  submitAssignment: async (id: string, studentId: string, submittedText: string): Promise<Assignment | null> => {
    const res = await axiosInstance.post(`/assignments/${id}/submit`, { studentId, submittedText });
    return res.data?.data?.assignment;
  },

  gradeAssignment: async (id: string, grade: number, feedback: string): Promise<Assignment | null> => {
    const res = await axiosInstance.patch(`/assignments/${id}/grade`, { grade, feedback });
    return res.data?.data?.assignment;
  },

  // Quizzes
  getQuizzes: async (): Promise<Quiz[]> => {
    const res = await axiosInstance.get('/quizzes');
    return res.data?.data?.quizzes || [];
  },

  getQuizzesByCourse: async (courseId: string): Promise<Quiz[]> => {
    const res = await axiosInstance.get('/quizzes', { params: { courseId } });
    return res.data?.data?.quizzes || [];
  },

  getQuizById: async (id: string): Promise<Quiz | undefined> => {
    const res = await axiosInstance.get(`/quizzes/${id}`);
    return res.data?.data?.quiz;
  },

  createQuiz: async (data: Partial<Quiz>): Promise<Quiz> => {
    const res = await axiosInstance.post('/quizzes', data);
    return res.data?.data?.quiz;
  },

  submitQuiz: async (quizId: string, score: number): Promise<Quiz | null> => {
    const res = await axiosInstance.post(`/quizzes/${quizId}/submit`, { score });
    return res.data?.data?.quiz;
  },

  // Enrollments
  getEnrollments: async (): Promise<Enrollment[]> => {
    const res = await axiosInstance.get('/student/enrollments');
    return res.data?.data?.enrollments || [];
  },

  getEnrollmentsByStudent: async (studentId: string): Promise<Enrollment[]> => {
    const res = await axiosInstance.get('/student/enrollments', { params: { studentId } });
    return res.data?.data?.enrollments || [];
  },

  getEnrollmentsByCourse: async (courseId: string): Promise<Enrollment[]> => {
    const res = await axiosInstance.get(`/courses/${courseId}/enrollments`);
    return res.data?.data?.enrollments || [];
  },

  enrollStudent: async (courseId: string, studentId: string, studentName: string, studentEmail: string): Promise<Enrollment> => {
    const res = await axiosInstance.post(`/courses/${courseId}/enroll`, { studentId, studentName, studentEmail });
    return res.data?.data?.enrollment;
  },

  updateProgress: async (enrollmentId: string, progress: number): Promise<Enrollment | null> => {
    const res = await axiosInstance.patch(`/student/enrollments/${enrollmentId}/progress`, { progress });
    return res.data?.data?.enrollment;
  },

  isEnrolled: async (courseId: string, studentId: string): Promise<boolean> => {
    const res = await axiosInstance.get(`/courses/${courseId}/is-enrolled`, { params: { studentId } });
    return res.data?.data?.isEnrolled || false;
  },
};