import {
  getAllCoursesApi,
  getCourseByIdApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
  enrollCourseApi,
  getMyCoursesApi,
  getMyTeachingCoursesApi,
} from '../api/courseApi';
import {
  getStudentAssignmentsApi,
  submitAssignmentApi,
  createAssignmentApi,
  getTeacherAssignmentsApi,
  gradeSubmissionApi,
  deleteAssignmentApi,
} from '../api/assignmentApi';
import {
  getQuizzesByCourseApi,
  getQuizByIdApi,
  createQuizApi,
  attemptQuizApi,
} from '../api/quizApi';

export const courseService = {
  // Courses
  getAllCourses: async () => {
    const res = await getAllCoursesApi();
    return res.data.courses;
  },

  getCourseById: async (id: string) => {
    const res = await getCourseByIdApi(id);
    return res.data.course;
  },

  getMyTeachingCourses: async () => {
    const res = await getMyTeachingCoursesApi();
    return res.data.courses;
  },

  getPublishedCourses: async () => {
    const res = await getAllCoursesApi();
    return res.data.courses.filter((c: any) => c.status === 'published');
  },

  getMyCourses: async () => {
    const res = await getMyCoursesApi();
    return res.data.courses;
  },

  createCourse: async (courseData: any) => {
    const res = await createCourseApi(courseData);
    return res.data.course;
  },

  updateCourse: async (id: string, updates: any) => {
    const res = await updateCourseApi(id, updates);
    return res.data.course;
  },

  deleteCourse: async (id: string) => {
    await deleteCourseApi(id);
    return true;
  },

  enrollStudent: async (courseId: string) => {
    const res = await enrollCourseApi(courseId);
    return res.data;
  },

  // Assignments
  getAssignments: async () => {
    const res = await getStudentAssignmentsApi();
    return res.data.assignments;
  },

  getAssignmentsByCourse: async (courseId: string) => {
    const res = await getStudentAssignmentsApi();
    return res.data.assignments.filter((a: any) => a.courseId === courseId);
  },

  getTeacherAssignments: async () => {
    const res = await getTeacherAssignmentsApi();
    return res.data.assignments;
  },

  createAssignment: async (data: any) => {
    const res = await createAssignmentApi(data);
    return res.data.assignment;
  },

  submitAssignment: async (id: string, _studentId: string, submittedText: string) => {
    const res = await submitAssignmentApi(id, { submittedText });
    return res.data.assignment;
  },

  gradeAssignment: async (id: string, grade: number, feedback: string) => {
    const res = await gradeSubmissionApi(id, { obtainedMarks: grade, feedback });
    return res.data.assignment;
  },

  deleteAssignment: async (id: string) => {
    await deleteAssignmentApi(id);
    return true;
  },

  // Quizzes
  getQuizzesByCourse: async (courseId: string) => {
    const res = await getQuizzesByCourseApi(courseId);
    return res.data.quizzes;
  },

  getQuizById: async (id: string) => {
    const res = await getQuizByIdApi(id);
    return res.data.quiz;
  },

  createQuiz: async (data: any) => {
    const res = await createQuizApi(data);
    return res.data.quiz;
  },

  submitQuiz: async (quizId: string, answers: any) => {
    const res = await attemptQuizApi(quizId, answers);
    return res.data;
  },
};