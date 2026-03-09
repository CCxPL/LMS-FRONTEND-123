export interface Course {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  isActive: boolean;
}

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Python Development',
    description: 'Learn Python from basics to advanced',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2', 'student-3'],
    isActive: true,
  },
  {
    id: 'course-2',
    name: 'Java Programming',
    description: 'Master Java and OOP concepts',
    teacherId: 'teacher-2',
    studentIds: ['student-2', 'student-4', 'student-5'],
    isActive: true,
  },
  {
    id: 'course-3',
    name: 'Web Development',
    description: 'Full stack web development with React',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-3', 'student-5'],
    isActive: true,
  },
];