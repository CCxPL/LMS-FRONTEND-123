// ============================================
// CALENDAR TYPES - With Recurring Events
// ============================================

export type EventType = 'class' | 'test';

export type CalendarView = 'month' | 'week' | 'day';

// ✅ NEW: Recurrence Types
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type RecurringEditType = 'THIS_EVENT' | 'THIS_AND_FOLLOWING';

// ✅ NEW: Recurrence Rule Interface
export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number;
  daysOfWeek?: number[]; // [0,1,2,3,4,5,6] for weekly
  endType: 'NEVER' | 'AFTER_COUNT' | 'ON_DATE';
  endAfterCount?: number;
  endDate?: string;
}

// ============================================
// CALENDAR EVENT - Updated with Recurring Fields
// ============================================

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
  createdBy?: string;
  lastModifiedBy?: string;
  isLive?: boolean;
  teacherJoinedAt?: string;

  // ✅ NEW: Recurring Event Fields
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  seriesId?: string; // Groups all events in same series
  originalDate?: string; // Original date before any edits
  isException?: boolean; // Was this event individually edited?
}

// ============================================
// EVENT FORM DATA - Updated with Recurring Fields
// ============================================

export interface EventFormData {
  title: string;
  type: EventType;
  courseId: string;
  meetingLink: string;
  date: string;
  startTime: string;
  endTime: string;

  // ✅ NEW: Recurring Fields
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
}

// ============================================
// DAY EVENT (Existing)
// ============================================

export interface DayEvent extends CalendarEvent {
  color: string;
}

// ============================================
// CALENDAR FILTERS (Existing)
// ============================================

export interface CalendarFilters {
  courseId?: string;
  type?: EventType;
  teacherId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================
// RECURRING EVENT ACTION (For Dialog)
// ============================================

export interface RecurringEventAction {
  eventId: string;
  actionType: 'EDIT' | 'DELETE';
  editType: RecurringEditType;
  updatedData?: Partial<EventFormData>;
}