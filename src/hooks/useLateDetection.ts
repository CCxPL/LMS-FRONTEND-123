import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalendarEvent } from '../types/calendar.types';
import type { Notification } from '../types/notification.types';
import { getNotificationTitle, createNotificationMessage } from '../utils/notificationHelpers';

interface LateDetectionConfig {
  gracePeriodMinutes?: number;
  checkIntervalSeconds?: number;
}

export const useLateDetection = (
  events: CalendarEvent[],
  onLateDetected: (notification: Notification) => void,
  config: LateDetectionConfig = {}
) => {
  const { gracePeriodMinutes = 5, checkIntervalSeconds = 60 } = config;
  const [checkedEvents, setCheckedEvents] = useState<Set<string>>(new Set());
  
  // Use refs to prevent infinite loops
  const onLateDetectedRef = useRef(onLateDetected);
  const eventsRef = useRef(events);
  
  onLateDetectedRef.current = onLateDetected;
  eventsRef.current = events;

  const checkForLateTeachers = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    eventsRef.current.forEach(event => {
      // Skip if already checked
      if (checkedEvents.has(event.id)) return;
      
      // Skip if not today
      if (event.date !== today) return;
      
      // Skip if not active
      if (!event.isActive) return;

      // Parse event times
      const [eventHours, eventMinutes] = event.startTime.split(':').map(Number);
      const eventTotalMinutes = eventHours * 60 + eventMinutes;
      const [endHours, endMinutes] = event.endTime.split(':').map(Number);
      const endTotalMinutes = endHours * 60 + endMinutes;

      // Check if late (past start + grace period, but before end)
      const lateThreshold = eventTotalMinutes + gracePeriodMinutes;
      const isLate = currentTotalMinutes > lateThreshold && currentTotalMinutes < endTotalMinutes;

      if (isLate && !event.isLive) {
        setCheckedEvents(prev => new Set(prev).add(event.id));

        const lateByMinutes = currentTotalMinutes - eventTotalMinutes;
        
        const formatTime12hr = (time24: string): string => {
          const [hours, minutes] = time24.split(':').map(Number);
          const period = hours >= 12 ? 'PM' : 'AM';
          const hours12 = hours % 12 || 12;
          return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
        };

        const notification: Notification = {
          id: `late-${event.id}-${Date.now()}`,
          type: 'teacher_late',
          title: '⚠️ Teacher Late Alert',
          message: `${event.teacherName} is ${lateByMinutes} mins late for "${event.title}" (scheduled at ${formatTime12hr(event.startTime)})`,
          recipientId: 'admin-1',
          recipientRole: 'admin',
          isRead: false,
          eventId: event.id,
          createdAt: new Date().toISOString(),
        };

        onLateDetectedRef.current(notification);
      }
    });
  }, [checkedEvents, gracePeriodMinutes]); // Minimal dependencies

  useEffect(() => {
    // Initial check
    const timeoutId = setTimeout(checkForLateTeachers, 1000);

    // Set up interval
    const intervalId = setInterval(checkForLateTeachers, checkIntervalSeconds * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [checkForLateTeachers, checkIntervalSeconds]);

  return {
    checkedEvents: Array.from(checkedEvents),
    resetCheckedEvents: () => setCheckedEvents(new Set()),
  };
};