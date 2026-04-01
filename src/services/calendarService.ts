// ============================================
// CALENDAR SERVICE - COMPLETE FILE
// ============================================

import type { 
  CalendarEvent, 
  EventFormData, 
  RecurrenceRule,
  RecurringEditType,
} from '../types/calendar.types';
import { mockEvents } from '../mockData/events';
import { mockCourses } from '../mockData/courses';
import type { AuthUser } from '../types/auth.types';
import { 
  filterEventsByCourse, 
  filterEventsByTeacher, 
  sortEventsByTime 
} from '../utils/eventHelpers';

class CalendarService {
  private events: CalendarEvent[] = [...mockEvents];

  getAllEvents(): CalendarEvent[] {
   
    return sortEventsByTime(this.events.filter(e => e.isActive));
  }

  getEventById(id: string): CalendarEvent | undefined {
    return this.events.find(e => e.id === id && e.isActive);
  }

  getEventsByCourse(courseId: string): CalendarEvent[] {
    return sortEventsByTime(filterEventsByCourse(this.events, courseId));
  }

  getEventsByTeacher(teacherId: string): CalendarEvent[] {
    
    const filtered = filterEventsByTeacher(this.events, teacherId);
  
    return sortEventsByTime(filtered);
  }

  getEventsByStudentCourses(courseIds: string[]): CalendarEvent[] {
    const events = this.events.filter(
      e => e.isActive && courseIds.includes(e.courseId)
    );
    return sortEventsByTime(events);
  }

  async createEvent(
    formData: EventFormData, 
    user: AuthUser
  ): Promise<CalendarEvent[]> {
   

    const course = mockCourses.find(c => c.id === formData.courseId);
    const now = new Date().toISOString();

    // Handle Recurring Events
    if (formData.isRecurring && formData.recurrenceRule) {
      const seriesId = `series-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const dates = this.generateRecurringDates(formData.date, formData.recurrenceRule);
      
      const newEvents: CalendarEvent[] = dates.map(date => ({
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        type: formData.type,
        courseId: formData.courseId,
        courseName: course?.name || '',
        teacherId: user.id,
        teacherName: user.name,
        meetingLink: formData.meetingLink,
        date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        createdAt: now,
        updatedAt: now,
        isActive: true,
        isRecurring: true,
        recurrenceRule: formData.recurrenceRule,
        seriesId,
        originalDate: date,
        isException: false,
      }));

      this.events.push(...newEvents);
    
      return newEvents;
    }

    // Single Event
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: formData.title,
      type: formData.type,
      courseId: formData.courseId,
      courseName: course?.name || '',
      teacherId: user.id,
      teacherName: user.name,
      meetingLink: formData.meetingLink,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      isRecurring: false,
    };

   
    this.events.push(newEvent);
   
    
    return [newEvent];
  }

  async updateEvent(
    eventId: string, 
    formData: Partial<EventFormData>
  ): Promise<CalendarEvent> {
    
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');

    const updatedEvent: CalendarEvent = {
      ...this.events[eventIndex],
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    this.events[eventIndex] = updatedEvent;
    return updatedEvent;
  }

  async deleteEvent(eventId: string): Promise<void> {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');

    this.events[eventIndex].isActive = false;
    this.events[eventIndex].updatedAt = new Date().toISOString();
  }

  checkTeacherLate(event: CalendarEvent, currentTime: Date): boolean {
    const gracePeriod = 5;
    const [hours, minutes] = event.startTime.split(':').map(Number);
    
    const scheduledTime = new Date(currentTime);
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    const graceEndTime = new Date(scheduledTime.getTime() + gracePeriod * 60000);
    
    return currentTime > graceEndTime;
  }

  // ============================================
  // ✅ FIXED: Update Recurring Events
  // ============================================
  updateRecurringEvent(
    eventId: string,
    updates: Partial<EventFormData>,
    editType: RecurringEditType
  ): CalendarEvent[] {
    const targetEvent = this.events.find(e => e.id === eventId);
    if (!targetEvent) throw new Error('Event not found');



    // If not recurring, treat as normal update
    if (!targetEvent.isRecurring || !targetEvent.seriesId) {
   
      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) throw new Error('Event not found');

      this.events[eventIndex] = {
        ...this.events[eventIndex],
        title: updates.title ?? this.events[eventIndex].title,
        type: updates.type ?? this.events[eventIndex].type,
        courseId: updates.courseId ?? this.events[eventIndex].courseId,
        meetingLink: updates.meetingLink ?? this.events[eventIndex].meetingLink,
        date: updates.date ?? this.events[eventIndex].date,
        startTime: updates.startTime ?? this.events[eventIndex].startTime,
        endTime: updates.endTime ?? this.events[eventIndex].endTime,
        isRecurring: updates.isRecurring ?? this.events[eventIndex].isRecurring,
        recurrenceRule: updates.recurrenceRule ?? this.events[eventIndex].recurrenceRule,
        updatedAt: new Date().toISOString(),
      };

      return [this.events[eventIndex]];
    }

    const now = new Date().toISOString();

    if (editType === 'THIS_EVENT') {
    
      // Only update this specific event
      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) throw new Error('Event not found');

      this.events[eventIndex] = {
        ...this.events[eventIndex],
        title: updates.title ?? this.events[eventIndex].title,
        type: updates.type ?? this.events[eventIndex].type,
        courseId: updates.courseId ?? this.events[eventIndex].courseId,
        meetingLink: updates.meetingLink ?? this.events[eventIndex].meetingLink,
        date: updates.date ?? this.events[eventIndex].date,
        startTime: updates.startTime ?? this.events[eventIndex].startTime,
        endTime: updates.endTime ?? this.events[eventIndex].endTime,
        isException: true,
        updatedAt: now,
      };

      return [this.events[eventIndex]];
    } else {
      // THIS_AND_FOLLOWING: Update this and all future events
     
      const targetDate = new Date(targetEvent.date);
     
      
      const updatedEvents: CalendarEvent[] = [];
      
      this.events = this.events.map(e => {
        if (e.seriesId === targetEvent.seriesId && new Date(e.date) >= targetDate) {
        
          const updated: CalendarEvent = {
            ...e,
            title: updates.title ?? e.title,
            type: updates.type ?? e.type,
            courseId: updates.courseId ?? e.courseId,
            meetingLink: updates.meetingLink ?? e.meetingLink,
            startTime: updates.startTime ?? e.startTime,
            endTime: updates.endTime ?? e.endTime,
            updatedAt: now,
          };
          updatedEvents.push(updated);
          return updated;
        }
        return e;
      });

     
      return updatedEvents;
    }
  }

  // ============================================
  // ✅ FIXED: Delete Recurring Events
  // ============================================
  deleteRecurringEvent(
    eventId: string,
    editType: RecurringEditType
  ): string[] {
    const targetEvent = this.events.find(e => e.id === eventId);
    if (!targetEvent) throw new Error('Event not found');

   

    // If not recurring, treat as normal delete
    if (!targetEvent.isRecurring || !targetEvent.seriesId) {
      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        this.events[eventIndex].isActive = false;
        this.events[eventIndex].updatedAt = new Date().toISOString();
      }
      return [eventId];
    }

    const now = new Date().toISOString();
    const deletedIds: string[] = [];

    if (editType === 'THIS_EVENT') {
      // Only delete this specific event
      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        this.events[eventIndex].isActive = false;
        this.events[eventIndex].updatedAt = now;
        deletedIds.push(eventId);
      }
      return deletedIds;
    } else {
      // THIS_AND_FOLLOWING: Delete this and all future events
      const targetDate = new Date(targetEvent.date);
      
      this.events = this.events.map(e => {
        if (e.seriesId === targetEvent.seriesId && new Date(e.date) >= targetDate) {
          deletedIds.push(e.id);
          return {
            ...e,
            isActive: false,
            updatedAt: now,
          };
        }
        return e;
      });

     
      return deletedIds;
    }
  }

  // ============================================
  // Generate Recurring Dates
  // ============================================
  private generateRecurringDates(
    startDate: string, 
    rule: RecurrenceRule
  ): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    let currentDate = new Date(start);
    let count = 0;
    
    const maxCount = rule.endType === 'AFTER_COUNT' ? (rule.endAfterCount || 10) : 100;
    const endDate = rule.endType === 'ON_DATE' && rule.endDate 
      ? new Date(rule.endDate) 
      : null;

    while (count < maxCount) {
      if (endDate && currentDate > endDate) break;

      if (rule.type === 'WEEKLY') {
        if (rule.daysOfWeek?.includes(currentDate.getDay())) {
          dates.push(currentDate.toISOString().split('T')[0]);
          count++;
        }
      } else {
        dates.push(currentDate.toISOString().split('T')[0]);
        count++;
      }

      switch (rule.type) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() + (rule.interval || 1));
          break;
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + (rule.interval || 1));
          break;
      }

      if (currentDate.getTime() - start.getTime() > 365 * 24 * 60 * 60 * 1000) {
        break;
      }
    }

    return dates;
  }

  isRecurringEvent(eventId: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    return event?.isRecurring || false;
  }

  getEventsBySeries(seriesId: string): CalendarEvent[] {
    return this.events.filter(e => e.seriesId === seriesId && e.isActive);
  }
}

export const calendarService = new CalendarService();