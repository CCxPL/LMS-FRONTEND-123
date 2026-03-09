import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalendarEvent, EventFormData } from '../types/calendar.types';
import { calendarService } from '../services/calendarService';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

export const useCalendar = (courseId?: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Use ref to track if already fetched
  const hasFetchedRef = useRef(false);

  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let fetchedEvents: CalendarEvent[];

      if (user.role === 'student' && user.courseIds) {
        fetchedEvents = calendarService.getEventsByStudentCourses(user.courseIds);
      } else if (user.role === 'teacher') {
        fetchedEvents = calendarService.getEventsByTeacher(user.id);
      } else if (courseId) {
        fetchedEvents = calendarService.getEventsByCourse(courseId);
      } else {
        fetchedEvents = calendarService.getAllEvents();
      }

      setEvents(fetchedEvents || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  // Only fetch once on mount or when user/courseId changes
  useEffect(() => {
    fetchEvents();
  }, [user?.id, user?.role, courseId]); // Specific dependencies

  const createEvent = useCallback(async (formData: EventFormData): Promise<boolean> => {
    if (!user) {
      showToast('User not authenticated', 'error');
      return false;
    }

    try {
      const newEvent = await calendarService.createEvent(formData, user);
      setEvents(prev => [...prev, newEvent]);
      showToast('Event created successfully', 'success');
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('Failed to create event', 'error');
      return false;
    }
  }, [user, showToast]);

  const updateEvent = useCallback(async (eventId: string, formData: Partial<EventFormData>): Promise<boolean> => {
    try {
      const updatedEvent = await calendarService.updateEvent(eventId, formData);
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      showToast('Event updated successfully', 'success');
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      showToast('Failed to update event', 'error');
      return false;
    }
  }, [showToast]);

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      await calendarService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      showToast('Event deleted successfully', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Failed to delete event', 'error');
      return false;
    }
  }, [showToast]);

  return {
    events,
    loading,
    selectedDate,
    setSelectedDate,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
  };
};