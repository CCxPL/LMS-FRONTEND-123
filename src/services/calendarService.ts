import axiosInstance from '../api/axiosInstance';
import type { CalendarEvent, EventFormData, RecurringEditType } from '../types/calendar.types';
import { sortEventsByTime } from '../utils/eventHelpers';

class CalendarService {
  async getAllEvents(): Promise<CalendarEvent[]> {
    const res = await axiosInstance.get('/events');
    return sortEventsByTime(res.data?.data?.events || []);
  }

  async getEventsByCourse(courseId: string): Promise<CalendarEvent[]> {
    const res = await axiosInstance.get('/events', { params: { courseId } });
    return sortEventsByTime(res.data?.data?.events || []);
  }

  async getEventsByTeacher(teacherId: string): Promise<CalendarEvent[]> {
    const res = await axiosInstance.get('/events', { params: { teacherId } });
    return sortEventsByTime(res.data?.data?.events || []);
  }

  async getEventsByStudentCourses(courseIds: string[]): Promise<CalendarEvent[]> {
    const res = await axiosInstance.get('/events', {
      params: { courseIds: courseIds.join(',') }
    });
    return sortEventsByTime(res.data?.data?.events || []);
  }

  async createEvent(formData: EventFormData): Promise<CalendarEvent[]> {
    const res = await axiosInstance.post('/events', formData);
    const events = res.data?.data?.events || [res.data?.data?.event];
    return events.filter(Boolean);
  }

  async updateEvent(eventId: string, formData: Partial<EventFormData>): Promise<CalendarEvent> {
    const res = await axiosInstance.put(`/events/${eventId}`, formData);
    return res.data?.data?.event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await axiosInstance.delete(`/events/${eventId}`);
  }

  async updateRecurringEvent(
    eventId: string,
    updates: Partial<EventFormData>,
    editType: RecurringEditType
  ): Promise<void> {
    await axiosInstance.put(`/events/${eventId}/recurring`, {
      ...updates,
      editType
    });
  }

  async deleteRecurringEvent(
    eventId: string,
    editType: RecurringEditType,
    date: string
  ): Promise<void> {
    await axiosInstance.delete(`/events/${eventId}/recurring`, {
      data: { editType, date }
    });
  }

  checkTeacherLate(event: CalendarEvent, currentTime: Date): boolean {
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const scheduledTime = new Date(currentTime);
    scheduledTime.setHours(hours, minutes, 0, 0);
    return currentTime > new Date(scheduledTime.getTime() + 5 * 60000);
  }
}

export const calendarService = new CalendarService();