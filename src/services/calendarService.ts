import axiosInstance from '../api/axiosInstance';
import type {
  CalendarEvent,
  EventFormData,
  RecurringEditType,
} from '../types/calendar.types';
import type { AuthUser } from '../types/auth.types';
import { sortEventsByTime } from '../utils/eventHelpers';

class CalendarService {
  private events: CalendarEvent[] = [];

  // ── Fetch from backend ──────────────────────────────────
  async fetchEvents(courseId?: string): Promise<CalendarEvent[]> {
    const params = courseId ? { courseId } : {};
    const res = await axiosInstance.get('/events', { params });
    const raw = res.data?.data?.events ?? [];
    this.events = raw;
    return raw;
  }

  // ── Local getters (after fetch) ─────────────────────────
  getAllEvents(): CalendarEvent[] {
    return sortEventsByTime(this.events.filter(e => e.isActive));
  }

  getEventById(id: string): CalendarEvent | undefined {
    return this.events.find(e => e.id === id && e.isActive);
  }

  getEventsByCourse(courseId: string): CalendarEvent[] {
    return sortEventsByTime(this.events.filter(e => e.isActive && e.courseId === courseId));
  }

  getEventsByTeacher(teacherId: string): CalendarEvent[] {
    return sortEventsByTime(this.events.filter(e => e.isActive && e.teacherId === teacherId));
  }

  getEventsByStudentCourses(courseIds: string[]): CalendarEvent[] {
    return sortEventsByTime(this.events.filter(e => e.isActive && courseIds.includes(e.courseId)));
  }

  setEvents(events: CalendarEvent[]): void {
    this.events = events;
  }

  // ── Create ──────────────────────────────────────────────
  async createEvent(formData: EventFormData, user: AuthUser): Promise<CalendarEvent[]> {
    const res = await axiosInstance.post('/events', formData);
    const newEvents: CalendarEvent[] = res.data?.data?.events ?? [];
    this.events.push(...newEvents);
    return newEvents;
  }

  // ── Update single ───────────────────────────────────────
  async updateEvent(eventId: string, formData: Partial<EventFormData>): Promise<CalendarEvent> {
    const res = await axiosInstance.put(`/events/${eventId}`, formData);
    const updated: CalendarEvent = res.data?.data?.event;
    this.events = this.events.map(e => e.id === eventId ? updated : e);
    return updated;
  }

  // ── Delete single ───────────────────────────────────────
  async deleteEvent(eventId: string): Promise<void> {
    await axiosInstance.delete(`/events/${eventId}`);
    this.events = this.events.map(e =>
      e.id === eventId ? { ...e, isActive: false } : e
    );
  }

  // ── Update recurring ────────────────────────────────────
  updateRecurringEvent(eventId: string, updates: Partial<EventFormData>, editType: RecurringEditType): CalendarEvent {
    axiosInstance.put(`/events/${eventId}/recurring`, { editType, ...updates });
    const event = this.events.find(e => e.id === eventId);
    if (!event) throw new Error('Event not found');
    const updated = { ...event, ...updates, isException: true };
    this.events = this.events.map(e => e.id === eventId ? updated : e);
    return updated;
  }

  // ── Delete recurring ────────────────────────────────────
  deleteRecurringEvent(eventId: string, editType: RecurringEditType): void {
    axiosInstance.delete(`/events/${eventId}/recurring`, { data: { editType } });
    this.events = this.events.map(e =>
      e.id === eventId ? { ...e, isActive: false } : e
    );
  }

  isRecurringEvent(eventId: string): boolean {
    return this.events.find(e => e.id === eventId)?.isRecurring || false;
  }

  getEventsBySeries(seriesId: string): CalendarEvent[] {
    return this.events.filter(e => e.seriesId === seriesId && e.isActive);
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