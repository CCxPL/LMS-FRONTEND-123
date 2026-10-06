import type { CalendarEvent, EventFormData, DayEvent, RecurrenceRule } from '../types/calendar.types';

// ============================================
// ✅ CORE: Recurring dates frontend pe calculate karo
// ============================================

const generateRecurringDates = (
  startDate: string,
  rule: RecurrenceRule & { excludedDates?: string[] },
  excludedDates: string[] = []
): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  let current = new Date(start);
  let count = 0;

  const maxCount = rule.endType === 'AFTER_COUNT' ? (rule.endAfterCount || 10) : 500;
  const endDate = rule.endType === 'ON_DATE' && rule.endDate
    ? new Date(rule.endDate + 'T23:59:59')
    : null;

  // Max 2 saal
  const hardLimit = new Date(start);
  hardLimit.setFullYear(hardLimit.getFullYear() + 2);

  // Combine excludedDates from rule and parameter
  const allExcluded = [...excludedDates, ...(rule.excludedDates || [])];

  if (rule.type === 'WEEKLY') {
    // Weekly: har din check karo, sirf selected days pe add karo
    while (current <= hardLimit && count < maxCount) {
      if (endDate && current > endDate) break;

      // ✅ FIX — local date use karo
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      const dayOfWeek = current.getDay();

      if (rule.daysOfWeek && rule.daysOfWeek.includes(dayOfWeek)) {
        if (!allExcluded.includes(dateStr)) {
          dates.push(dateStr);
          count++;
        }
      }

      // Next day
      current.setDate(current.getDate() + 1);
    }
  } else if (rule.type === 'DAILY') {
    while (count < maxCount) {
      if (endDate && current > endDate) break;
      if (current > hardLimit) break;

      // ✅ FIX
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      if (!allExcluded.includes(dateStr)) {
        dates.push(dateStr);
        count++;
      }
      current.setDate(current.getDate() + (rule.interval || 1));
    }
  } else if (rule.type === 'MONTHLY') {
    while (count < maxCount) {
      if (endDate && current > endDate) break;
      if (current > hardLimit) break;

      // ✅ FIX
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      if (!allExcluded.includes(dateStr)) {
        dates.push(dateStr);
        count++;
      }
      current.setMonth(current.getMonth() + (rule.interval || 1));
    }
  }

  return dates;
};

// ============================================
// ✅ CHECK: Kya ye date is recurring event mein aati hai?
// ============================================

export const doesRecurringEventFallOn = (event: CalendarEvent, date: string): boolean => {
  if (!event.recurrenceRule) return false;
  const excludedDates = (event.recurrenceRule as any).excludedDates || [];
  const dates = generateRecurringDates(event.date, event.recurrenceRule as any, excludedDates);
  return dates.includes(date);
};

// ============================================
// ✅ MAIN: filterEventsByDate
// ============================================

export const filterEventsByDate = (events: CalendarEvent[], date: string): CalendarEvent[] => {
  const result: CalendarEvent[] = [];

  for (const event of events) {
    if (!event.isActive) continue;

    if (!event.isRecurring) {
      // Non-recurring ya exception event: simple date match
      if (event.date === date) {
        result.push(event);
      }
    } else {
      // Recurring: calculate karo
      if (event.recurrenceRule && doesRecurringEventFallOn(event, date)) {
        result.push({
          ...event,
          date, // Is specific occurrence ki date override karo
        });
      }
    }
  }

  return result;
};

// ============================================
// ✅ FIXED: isRecurringEventOnDate — AdminSchedule todayEvents ke liye
// ============================================

export const getExpandedEvents = (events: CalendarEvent[], date: string): CalendarEvent[] => {
  return filterEventsByDate(events, date);
};

// ============================================
// Other helpers
// ============================================

export const filterEventsByCourse = (events: CalendarEvent[], courseId: string): CalendarEvent[] => {
  return events.filter(e => e.courseId === courseId && e.isActive);
};

export const filterEventsByTeacher = (events: CalendarEvent[], teacherId: string): CalendarEvent[] => {
  return events.filter(e => e.teacherId === teacherId && e.isActive);
};

export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
};

export const getEventColor = (type: 'class' | 'test'): string => {
  return type === 'class' ? '#3B82F6' : '#EF4444';
};

export const toDayEvent = (event: CalendarEvent): DayEvent => {
  return { ...event, color: getEventColor(event.type) };
};

export const validateEventForm = (formData: EventFormData): string[] => {
  const errors: string[] = [];
  if (!formData.title.trim()) errors.push('Title is required');
  if (!formData.courseId) errors.push('Please select a course');
  if (!formData.meetingLink.trim()) errors.push('Meeting link is required');
  else if (!isValidUrl(formData.meetingLink)) errors.push('Please enter a valid meeting URL');
  if (!formData.date) errors.push('Date is required');
  if (!formData.startTime) errors.push('Start time is required');
  if (!formData.endTime) errors.push('End time is required');
  if (formData.startTime && formData.endTime) {
    if (formData.startTime >= formData.endTime) errors.push('End time must be after start time');
  }
  return errors;
};

export const isValidUrl = (url: string): boolean => {
  try { new URL(url); return true; } catch { return false; }
};

export const isEventLive = (event: CalendarEvent): boolean => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (event.date !== today) return false;
  const currentTime = now.toTimeString().slice(0, 5);
  return currentTime >= event.startTime && currentTime <= event.endTime;
};

export const isEventUpcoming = (event: CalendarEvent): boolean => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (event.date !== today) return false;
  const currentTime = now.toTimeString().slice(0, 5);
  const [ch, cm] = currentTime.split(':').map(Number);
  const [eh, em] = event.startTime.split(':').map(Number);
  const diff = (eh * 60 + em) - (ch * 60 + cm);
  return diff > 0 && diff <= 60;
};