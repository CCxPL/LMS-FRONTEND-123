// ============================================
// useCalendar Hook - COMPLETE FILE
// ============================================

import { useState, useEffect, useCallback } from 'react';
import type { 
  CalendarEvent, 
  EventFormData,
  RecurringEditType 
} from '../types/calendar.types';
import { calendarService } from '../services/calendarService';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

interface UseCalendarReturn {
  events: CalendarEvent[];
  loading: boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  createEvent: (formData: EventFormData) => Promise<boolean>;
  updateEvent: (eventId: string, formData: Partial<EventFormData>) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  refreshEvents: () => Promise<void>;
  updateRecurringEvent: (
    eventId: string,
    updates: Partial<EventFormData>,
    editType: RecurringEditType
  ) => Promise<boolean>;
  deleteRecurringEvent: (
    eventId: string,
    editType: RecurringEditType
  ) => Promise<boolean>;
  isRecurringEvent: (eventId: string) => boolean;
}

export const useCalendar = (courseId?: string): UseCalendarReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchEvents = useCallback(async (): Promise<void> => {
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

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (formData: EventFormData): Promise<boolean> => {
    if (!user) {
      showToast('User not authenticated', 'error');
      return false;
    }

    try {
      const newEvents = await calendarService.createEvent(formData, user);
      setEvents(prev => [...prev, ...newEvents]);
      showToast(
        formData.isRecurring 
          ? `${newEvents.length} recurring events created successfully` 
          : 'Event created successfully', 
        'success'
      );
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('Failed to create event', 'error');
      return false;
    }
  }, [user, showToast]);

  const updateEvent = useCallback(
    async (eventId: string, formData: Partial<EventFormData>): Promise<boolean> => {
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
    }, 
    [showToast]
  );

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

  // ============================================
  // ✅ FIXED: Update Recurring Events
  // ============================================
  const updateRecurringEvent = useCallback(
    async (
      eventId: string,
      updates: Partial<EventFormData>,
      editType: RecurringEditType
    ): Promise<boolean> => {
      try {
       

        const updatedEvents = calendarService.updateRecurringEvent(
          eventId,
          updates,
          editType
        );

   

        // Update all affected events in state
        setEvents(prev => {
  
          const updatedMap = new Map(updatedEvents.map(e => [e.id, e]));
          const newEvents = prev.map(e => updatedMap.get(e.id) || e);
   
          return newEvents;
        });

        showToast(
          editType === 'THIS_EVENT'
            ? 'Event updated successfully'
            : `${updatedEvents.length} events updated successfully`,
          'success'
        );
        return true;
      } catch (error) {
        console.error('Error updating recurring event:', error);
        showToast('Failed to update event', 'error');
        return false;
      }
    },
    [showToast]
  );

  // ============================================
  // ✅ FIXED: Delete Recurring Events
  // ============================================
  const deleteRecurringEvent = useCallback(
    async (eventId: string, editType: RecurringEditType): Promise<boolean> => {
      try {
       

        const deletedIds = calendarService.deleteRecurringEvent(eventId, editType);

      

        // Remove all deleted events from state
        setEvents(prev => {
          const newEvents = prev.filter(e => !deletedIds.includes(e.id));
          
          return newEvents;
        });

        showToast(
          editType === 'THIS_EVENT'
            ? 'Event deleted successfully'
            : `${deletedIds.length} events deleted successfully`,
          'success'
        );
        return true;
      } catch (error) {
        console.error('Error deleting recurring event:', error);
        showToast('Failed to delete event', 'error');
        return false;
      }
    },
    [showToast]
  );

  const isRecurringEvent = useCallback((eventId: string): boolean => {
    return calendarService.isRecurringEvent(eventId);
  }, []);

  const refreshEvents = useCallback(async (): Promise<void> => {
    await fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    selectedDate,
    setSelectedDate,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
    updateRecurringEvent,
    deleteRecurringEvent,
    isRecurringEvent,
  };
};