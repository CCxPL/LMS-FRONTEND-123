// =====================
// Basic Attendance Types
// =====================
export interface AttendanceRecord {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  eventTitle: string;
  teacherId: string;
  teacherName: string;
  date: string;
  isPresent: boolean;
  joinedAt?: string;
  leftAt?: string;
  joinTime: string | null;
  leaveTime: string | null;
  duration: number;
  status: 'present' | 'absent' | 'late' | 'on-leave'; // ✅ UPDATED
  createdAt: string;
  leaveReason?: string; // ✅ NEW
}

export interface StudentActivity {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  action: 'joined' | 'left';
  timestamp: string;
}

export interface ClassSummary {
  id: string;
  eventId: string;
  teacherId?: string;
  teacherName: string;
  courseId?: string;
  courseName: string;
  totalStudentsEnrolled: number;
  studentsAttended: number;
  classStartTime: string;
  classEndTime: string;
  classDuration: number;
  teacherWasLate?: boolean;
  teacherLateByMinutes?: number;
  attendanceRecords: AttendanceRecord[];
  createdAt: string;
}

export interface LiveClassState {
  eventId: string;
  isLive: boolean;
  teacherJoined: boolean;
  teacherJoinedAt?: string;
  studentsOnline: string[];
  activities: StudentActivity[];
}

// =====================
// Report Types
// =====================
export interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  onLeave?: number; // ✅ NEW
  attendancePercentage: number;
  totalDuration: number;
}

export interface AttendanceFilter {
  studentId?: string;
  courseId?: string;
  teacherId?: string;
  dateRange: 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

// =====================
// Helper Functions
// =====================
export const isWithinGracePeriod = (
  startTime: string,
  currentTime: Date,
  gracePeriodMinutes: number = 5
): boolean => {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const scheduledTime = new Date(currentTime);
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  const graceEndTime = new Date(scheduledTime.getTime() + gracePeriodMinutes * 60000);
  
  return currentTime > graceEndTime;
};

export const formatTime12hr = (time24: string): string => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const convertTo24hr = (time12: string, period: 'AM' | 'PM'): string => {
  if (!time12) return '';
  
  const [hours, minutes] = time12.split(':').map(Number);
  let hours24 = hours;
  
  if (period === 'PM' && hours !== 12) {
    hours24 = hours + 12;
  } else if (period === 'AM' && hours === 12) {
    hours24 = 0;
  }
  
  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return time.toLocaleDateString();
};

export const isToday = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

export const getDurationMinutes = (startTime: string, endTime: string): number => {
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  
  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;
  
  return endTotalMins - startTotalMins;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

export const formatDate = (date: string | Date, _formatStr?: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTime = (time: string | Date): string => {
  const d = new Date(time);
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};