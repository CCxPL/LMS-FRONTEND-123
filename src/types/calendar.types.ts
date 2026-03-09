export type EventType = 'class' | 'test';

export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  meetingLink: string;
  date: string; // ISO format YYYY-MM-DD
  startTime: string; // HH:mm format (24hr)
  endTime: string; // HH:mm format (24hr)
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  // New fields
  createdBy?: string; // userId who created
  lastModifiedBy?: string; // userId who last modified
  isLive?: boolean; // Is class currently live
  teacherJoinedAt?: string; // When teacher joined
}

export interface EventFormData {
  title: string;
  type: EventType;
  courseId: string;
  meetingLink: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface DayEvent extends CalendarEvent {
  color: string;
}

export interface CalendarFilters {
  courseId?: string;
  type?: EventType;
  teacherId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}