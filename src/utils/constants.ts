import type { UserRole } from '../types/auth.types';

export const APP_NAME = 'LMS Portal';

export const ROLE_LABELS: Record<UserRole, string> = {
  'super-admin': 'Super Admin',
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
};

export const COURSE_CATEGORIES = [
  'Web Development',
  'Data Science',
  'Mobile Development',
  'Design',
  'Marketing',
  'Business',
  'Photography',
  'Music',
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

// ---------------------------
// FORMATTERS
// ---------------------------

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const truncateText = (
  text: string,
  maxLength: number
): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ---------------------------
// STATUS STYLES
// ---------------------------

export const getStatusStyle = (
  status: string
): string => {
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

export const getPriorityStyle = (
  priority: string
): string => {
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