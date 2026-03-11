// ============================================
// CALENDAR SERVICE - With Recurring Events
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

  // ============================================
  // EXISTING METHODS (Unchanged)
  // ============================================

  getAllEvents(): CalendarEvent[] {
    console.log('CalendarService - getAllEvents:', this.events.length);
    return sortEventsByTime(this.events.filter(e => e.isActive));
  }

  getEventById(id: string): CalendarEvent | undefined {
    return this.events.find(e => e.id === id && e.isActive);
  }

  getEventsByCourse(courseId: string): CalendarEvent[] {
    return sortEventsByTime(filterEventsByCourse(this.events, courseId));
  }

  getEventsByTeacher(teacherId: string): CalendarEvent[] {
    console.log('CalendarService - getEventsByTeacher:', teacherId);
    const filtered = filterEventsByTeacher(this.events, teacherId);
    console.log('Filtered events:', filtered);
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
    console.log('CalendarService - createEvent called');
    console.log('FormData:', formData);
    console.log('User:', user);

    const course = mockCourses.find(c => c.id === formData.courseId);
    const now = new Date().toISOString();

    // ✅ NEW: Handle Recurring Events
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
      console.log('Recurring events created:', newEvents.length);
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

    console.log('New event created:', newEvent);
    this.events.push(newEvent);
    console.log('Total events now:', this.events.length);
    
    return [newEvent];
  }

  async updateEvent(
    eventId: string, 
    formData: Partial<EventFormData>
  ): Promise<CalendarEvent> {
    console.log('CalendarService - updateEvent:', eventId, formData);
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
  // ✅ NEW: RECURRING EVENT METHODS
  // ============================================

  /**
   * Generate dates for recurring events
   */
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
      // Check end date
      if (endDate && currentDate > endDate) break;

      // Check if this day is valid for weekly recurrence
      if (rule.type === 'WEEKLY') {
        if (rule.daysOfWeek?.includes(currentDate.getDay())) {
          dates.push(currentDate.toISOString().split('T')[0]);
          count++;
        }
      } else {
        dates.push(currentDate.toISOString().split('T')[0]);
        count++;
      }

      // Move to next occurrence
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

      // Safety: max 1 year ahead
      if (currentDate.getTime() - start.getTime() > 365 * 24 * 60 * 60 * 1000) {
        break;
      }
    }

    return dates;
  }

  /**
   * Update recurring event
   * editType: 'THIS_EVENT' or 'THIS_AND_FOLLOWING'
   */
  updateRecurringEvent(
    eventId: string,
    updates: Partial<EventFormData>,
    editType: RecurringEditType
  ): CalendarEvent {
    const targetEvent = this.events.find(e => e.id === eventId);
    if (!targetEvent) throw new Error('Event not found');

    if (!targetEvent.isRecurring || !targetEvent.seriesId) {
      // Not a recurring event, just update normally
      return this.updateEvent(eventId, updates) as unknown as CalendarEvent;
    }

    const now = new Date().toISOString();

    if (editType === 'THIS_EVENT') {
      // Only update this specific event, mark as exception
      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) throw new Error('Event not found');

      this.events[eventIndex] = {
        ...this.events[eventIndex],
        ...updates,
        isException: true,
        updatedAt: now,
      };

      return this.events[eventIndex];
    } else {
      // THIS_AND_FOLLOWING: Update this and all future events in series
      const targetDate = new Date(targetEvent.date);
      
      this.events = this.events.map(e => {
        if (e.seriesId === targetEvent.seriesId && new Date(e.date) >= targetDate) {
          return {
            ...e,
            ...updates,
            updatedAt: now,
          };
        }
        return e;
      });

      return this.events.find(e => e.id === eventId) || targetEvent;
    }
  }

  /**
   * Delete recurring event
   * editType: 'THIS_EVENT' or 'THIS_AND_FOLLOWING'
   */
  deleteRecurringEvent(
    eventId: string,
    editType: RecurringEditType
  ): void {
    const targetEvent = this.events.find(e => e.id === eventId);
    if (!targetEvent) throw new Error('Event not found');

    if (!targetEvent.isRecurring || !targetEvent.seriesId) {
      // Not a recurring event, just delete
      this.deleteEvent(eventId);
      return;
    }

    const now = new Date().toISOString();

    if (editType === 'THIS_EVENT') {
      // Only delete this specific event
      this.deleteEvent(eventId);
    } else {
      // THIS_AND_FOLLOWING: Delete this and all future events in series
      const targetDate = new Date(targetEvent.date);
      
      this.events = this.events.map(e => {
        if (e.seriesId === targetEvent.seriesId && new Date(e.date) >= targetDate) {
          return {
            ...e,
            isActive: false,
            updatedAt: now,
          };
        }
        return e;
      });
    }
  }

  /**
   * Check if event is recurring
   */
  isRecurringEvent(eventId: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    return event?.isRecurring || false;
  }

  /**
   * Get events by series ID
   */
  getEventsBySeries(seriesId: string): CalendarEvent[] {
    return this.events.filter(e => e.seriesId === seriesId && e.isActive);
  }
}

export const calendarService = new CalendarService();