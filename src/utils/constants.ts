import type { UserRole } from '../types/auth.types';

export const APP_NAME = "LMS Portal";

export const ROLE_LABELS: Record<UserRole, string> = {
  'super-admin': 'Super Admin',
  'admin': 'Admin',
  'teacher': 'Teacher',
  'student': 'Student',
};

export const COURSE_CATEGORIES = [
  'Web Development',
  'Data Science',
  'Mobile Development',
  'Design',
  'Marketing',
  'Business',
  'Photography',
  'Music'
];

export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const COURSE_STATUS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'rejected', label: 'Rejected' },
];

export const USER_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const TASK_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

// Demo Users for Login (Credentials)
export const DEMO_USERS = [
  { 
    id: '1', 
    name: 'Vikram Singh', 
    email: 'super@lms.com', 
    password: 'password', 
    role: 'super-admin' as UserRole 
  },
  { 
    id: '2', 
    name: 'Ravi Kumar', 
    email: 'admin@lms.com', 
    password: 'password', 
    role: 'admin' as UserRole 
  },
  { 
    id: '3', 
    name: 'Dr. Anjali Mehta', 
    email: 'teacher@lms.com', 
    password: 'password', 
    role: 'teacher' as UserRole 
  },
  { 
    id: '4', 
    name: 'Arjun Sharma', 
    email: 'student@lms.com', 
    password: 'password', 
    role: 'student' as UserRole 
  },
];

// Mock Users Data (Dashboard Display)
export const MOCK_USERS_DATA = [
  { 
    id: '1', 
    name: 'Vikram Singh', 
    email: 'super@lms.com', 
    role: 'super-admin' as UserRole, 
    status: 'active' as const, 
    createdAt: '2023-01-01' 
  },
  { 
    id: '2', 
    name: 'Ravi Kumar', 
    email: 'admin@lms.com', 
    role: 'admin' as UserRole, 
    status: 'active' as const, 
    createdAt: '2023-02-01' 
  },
  { 
    id: '3', 
    name: 'Dr. Anjali Mehta', 
    email: 'teacher@lms.com', 
    role: 'teacher' as UserRole, 
    status: 'active' as const, 
    createdAt: '2023-03-01',
    specialization: 'Web Development',
    coursesCount: 5,
    studentsCount: 120,
    rating: 4.8
  },
  { 
    id: '4', 
    name: 'Arjun Sharma', 
    email: 'student@lms.com', 
    role: 'student' as UserRole, 
    status: 'active' as const, 
    createdAt: '2023-04-01',
    enrolledCourses: 3,
    completedCourses: 1,
    averageScore: 85,
    grade: 'A'
  },
  { 
    id: '5', 
    name: 'Suresh Patel', 
    email: 'suresh@lms.com', 
    role: 'teacher' as UserRole, 
    status: 'active' as const, 
    createdAt: '2023-05-01',
    specialization: 'Data Science',
    coursesCount: 3,
    studentsCount: 85,
    rating: 4.5
  },
  { 
    id: '6', 
    name: 'Priya Verma', 
    email: 'priya@lms.com', 
    role: 'student' as UserRole, 
    status: 'active' as const, 
    createdAt: '2023-06-01',
    enrolledCourses: 2,
    completedCourses: 0,
    averageScore: 78,
    grade: 'B+'
  },
];

// Mock Courses Data
export const MOCK_COURSES_DATA = [
  {
    id: '1',
    title: 'React.js Complete Course',
    description: 'Master React from scratch. Learn hooks, state management, and build real-world applications.',
    instructor: 'Dr. Anjali Mehta',
    instructorId: '3',
    category: 'Web Development',
    level: 'intermediate' as const,
    status: 'published' as const,
    price: 3999, // INR
    duration: '20h',
    enrolledStudents: 156,
    rating: 4.8,
    reviewsCount: 45,
    modules: [
      {
        id: 'm1',
        title: 'Introduction to React',
        lessons: [
          { id: 'l1', title: 'Welcome to the Course', type: 'video' as const, duration: '5:00' },
          { id: 'l2', title: 'Setting Up Environment', type: 'video' as const, duration: '10:00' },
          { id: 'l3', title: 'Your First Component', type: 'video' as const, duration: '15:00' },
        ]
      },
      {
        id: 'm2',
        title: 'React Hooks',
        lessons: [
          { id: 'l4', title: 'useState Hook', type: 'video' as const, duration: '12:00' },
          { id: 'l5', title: 'useEffect Hook', type: 'video' as const, duration: '18:00' },
        ]
      }
    ],
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Learn Python programming and data science fundamentals. Includes pandas, numpy, and visualization.',
    instructor: 'Suresh Patel',
    instructorId: '5',
    category: 'Data Science',
    level: 'beginner' as const,
    status: 'published' as const,
    price: 2999, // INR
    duration: '15h',
    enrolledStudents: 89,
    rating: 4.5,
    reviewsCount: 28,
    modules: [
      {
        id: 'm1',
        title: 'Python Basics',
        lessons: [
          { id: 'l1', title: 'Introduction to Python', type: 'video' as const, duration: '8:00' },
          { id: 'l2', title: 'Variables and Data Types', type: 'video' as const, duration: '12:00' },
        ]
      }
    ],
    createdAt: '2024-02-15'
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of user interface and user experience design.',
    instructor: 'Dr. Anjali Mehta',
    instructorId: '3',
    category: 'Design',
    level: 'beginner' as const,
    status: 'draft' as const,
    price: 0,
    duration: '10h',
    enrolledStudents: 0,
    rating: 0,
    modules: [],
    createdAt: '2024-03-01'
  }
];

// Quiz Questions Sample
export const SAMPLE_QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is React?',
    options: [
      'A JavaScript library for building user interfaces',
      'A programming language',
      'A database',
      'An operating system'
    ],
    correctAnswer: 0,
    marks: 10
  },
  {
    id: 'q2',
    question: 'Which hook is used for side effects in React?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correctAnswer: 1,
    marks: 10
  },
  {
    id: 'q3',
    question: 'What is JSX?',
    options: [
      'JavaScript XML',
      'Java Syntax Extension',
      'JSON XML',
      'JavaScript Extension'
    ],
    correctAnswer: 0,
    marks: 10
  }
];

// Formatters
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Status Styling
export const getStatusStyle = (status: string): string => {
  switch (status) {
    case 'active':
    case 'published':
    case 'completed':
      return 'bg-black text-white';
    case 'pending':
    case 'in-progress':
      return 'bg-gray-200 text-gray-800';
    case 'inactive':
    case 'draft':
      return 'bg-gray-100 text-gray-600';
    case 'suspended':
    case 'rejected':
    case 'overdue':
      return 'bg-gray-300 text-gray-900';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const getPriorityStyle = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-black text-white';
    case 'medium':
      return 'bg-gray-300 text-gray-900';
    case 'low':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};