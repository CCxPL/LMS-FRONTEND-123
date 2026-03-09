import type { CalendarEvent, EventFormData } from '../types/calendar.types';
import { mockEvents } from '../mockData/events';
import { mockCourses } from '../mockData/courses';
import type { AuthUser } from '../types/auth.types';
import { filterEventsByCourse, filterEventsByTeacher, sortEventsByTime } from '../utils/eventHelpers';

class CalendarService {
  private events: CalendarEvent[] = [...mockEvents];

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

  async createEvent(formData: EventFormData, user: AuthUser): Promise<CalendarEvent> {
    console.log('CalendarService - createEvent called');
    console.log('FormData:', formData);
    console.log('User:', user);

    const course = mockCourses.find(c => c.id === formData.courseId);
    
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    console.log('New event created:', newEvent);
    this.events.push(newEvent);
    console.log('Total events now:', this.events.length);
    
    return newEvent;
  }

  async updateEvent(eventId: string, formData: Partial<EventFormData>): Promise<CalendarEvent> {
    console.log('CalendarService - updateEvent:', eventId, formData);
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');

    const updatedEvent = {
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
}

export const calendarService = new CalendarService();