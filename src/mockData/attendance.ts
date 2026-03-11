import type { AttendanceRecord, StudentActivity, ClassSummary } from '../types/attendance.types';

// ✅ FIXED: Complete AttendanceRecord matching your type definition
export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'attend-1',
    eventId: 'event-1',
    studentId: 'student-1',
    studentName: 'Alice Student',
    studentEmail: 'alice@example.com',
    courseId: 'course-1',
    courseName: 'Python Development',
    eventTitle: 'Python Basics - Introduction',
    teacherId: 'teacher-1', // ✅ ADDED
    teacherName: 'Sarah Teacher', // ✅ ADDED
    date: '2024-06-15', // ✅ CORRECT (not eventDate)
    isPresent: true,
    joinedAt: '2024-06-15T10:02:00Z',
    leftAt: '2024-06-15T10:58:00Z',
    joinTime: '2024-06-15T10:02:00Z', // ✅ ADDED
    leaveTime: '2024-06-15T10:58:00Z', // ✅ ADDED
    duration: 56,
    status: 'present',
    createdAt: '2024-06-15T10:02:00Z', // ✅ ADDED
  },
  {
    id: 'attend-2',
    eventId: 'event-1',
    studentId: 'student-2',
    studentName: 'Bob Student',
    studentEmail: 'bob@example.com',
    courseId: 'course-1',
    courseName: 'Python Development',
    eventTitle: 'Python Basics - Introduction',
    teacherId: 'teacher-1', // ✅ ADDED
    teacherName: 'Sarah Teacher', // ✅ ADDED
    date: '2024-06-15', // ✅ CORRECT
    isPresent: true,
    joinedAt: '2024-06-15T10:05:00Z',
    leftAt: '2024-06-15T11:00:00Z',
    joinTime: '2024-06-15T10:05:00Z', // ✅ ADDED
    leaveTime: '2024-06-15T11:00:00Z', // ✅ ADDED
    duration: 55,
    status: 'present',
    createdAt: '2024-06-15T10:05:00Z', // ✅ ADDED
  },
];

// StudentActivity examples (no changes needed)
export const mockStudentActivities: StudentActivity[] = [
  {
    id: 'activity-1',
    eventId: 'event-1',
    studentId: 'student-1',
    studentName: 'Alice Student',
    action: 'joined',
    timestamp: '2024-06-15T10:02:00Z',
  },
  {
    id: 'activity-2',
    eventId: 'event-1',
    studentId: 'student-1',
    studentName: 'Alice Student',
    action: 'left',
    timestamp: '2024-06-15T10:58:00Z',
  },
  {
    id: 'activity-3',
    eventId: 'event-1',
    studentId: 'student-2',
    studentName: 'Bob Student',
    action: 'joined',
    timestamp: '2024-06-15T10:05:00Z',
  },
  {
    id: 'activity-4',
    eventId: 'event-1',
    studentId: 'student-2',
    studentName: 'Bob Student',
    action: 'left',
    timestamp: '2024-06-15T11:00:00Z',
  },
];

export const mockClassSummaries: ClassSummary[] = [
  {
    id: 'summary-1',
    eventId: 'event-1',
    teacherId: 'teacher-1', // ✅ Optional but added
    teacherName: 'Sarah Teacher',
    courseId: 'course-1', // ✅ Optional but added
    courseName: 'Python Development',
    totalStudentsEnrolled: 3,
    studentsAttended: 2,
    classStartTime: '2024-06-15T10:00:00Z',
    classEndTime: '2024-06-15T11:00:00Z',
    classDuration: 60,
    attendanceRecords: mockAttendance,
    createdAt: '2024-06-15T11:05:00Z',
  },
];