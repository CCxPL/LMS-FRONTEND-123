import type { CalendarEvent, EventFormData, DayEvent } from '../types/calendar.types';

export const filterEventsByDate = (events: CalendarEvent[], date: string): CalendarEvent[] => {
  return events.filter(e => e.date === date && e.isActive);
};

export const filterEventsByCourse = (events: CalendarEvent[], courseId: string): CalendarEvent[] => {
  return events.filter(e => e.courseId === courseId && e.isActive);
};

export const filterEventsByTeacher = (events: CalendarEvent[], teacherId: string): CalendarEvent[] => {
  return events.filter(e => e.teacherId === teacherId && e.isActive);
};

export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
  return [...events].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });
};

export const getEventColor = (type: 'class' | 'test'): string => {
  return type === 'class' ? '#3B82F6' : '#EF4444';
};

export const toDayEvent = (event: CalendarEvent): DayEvent => {
  return {
    ...event,
    color: getEventColor(event.type),
  };
};

export const validateEventForm = (formData: EventFormData): string[] => {
  const errors: string[] = [];

  if (!formData.title.trim()) {
    errors.push('Title is required');
  }

  if (!formData.courseId) {
    errors.push('Please select a course');
  }

  if (!formData.meetingLink.trim()) {
    errors.push('Meeting link is required');
  } else if (!isValidUrl(formData.meetingLink)) {
    errors.push('Please enter a valid meeting URL');
  }

  if (!formData.date) {
    errors.push('Date is required');
  }

  if (!formData.startTime) {
    errors.push('Start time is required');
  }

  if (!formData.endTime) {
    errors.push('End time is required');
  }

  if (formData.startTime && formData.endTime) {
    if (formData.startTime >= formData.endTime) {
      errors.push('End time must be after start time');
    }
  }

  return errors;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
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
  const [currentHours, currentMins] = currentTime.split(':').map(Number);
  const [eventHours, eventMins] = event.startTime.split(':').map(Number);
  
  const currentTotalMins = currentHours * 60 + currentMins;
  const eventTotalMins = eventHours * 60 + eventMins;
  
  const diffMins = eventTotalMins - currentTotalMins;
  
  return diffMins > 0 && diffMins <= 60;
};