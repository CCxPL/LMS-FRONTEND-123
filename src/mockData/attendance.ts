import type { AttendanceRecord, StudentActivity, ClassSummary } from '../types/attendance.types';

// ✅ FIXED: Use AttendanceRecord instead of StudentActivity
export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'attend-1',
    studentId: 'student-1',
    studentName: 'Alice Student',
    eventId: 'event-1',
    joinedAt: '2024-06-15T10:02:00Z', // ✅ Changed from joinTime
    leftAt: '2024-06-15T10:58:00Z',   // ✅ Changed from leaveTime
    duration: 56,
    isPresent: true,
  },
  {
    id: 'attend-2',
    studentId: 'student-2',
    studentName: 'Bob Student',
    eventId: 'event-1',
    joinedAt: '2024-06-15T10:05:00Z', // ✅ Changed from joinTime
    leftAt: '2024-06-15T11:00:00Z',   // ✅ Changed from leaveTime
    duration: 55,
    isPresent: true,
  },
];

// ✅ ADDED: StudentActivity examples (separate from attendance records)
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
    teacherName: 'Sarah Teacher',
    courseName: 'Python Development',
    totalStudentsEnrolled: 3,
    studentsAttended: 2,
    classStartTime: '2024-06-15T10:00:00Z',
    classEndTime: '2024-06-15T11:00:00Z',
    classDuration: 60,
    attendanceRecords: mockAttendance, // ✅ Now correctly typed as AttendanceRecord[]
    createdAt: '2024-06-15T11:05:00Z',
  },
];