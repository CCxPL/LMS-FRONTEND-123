import { useState, useEffect, useCallback, useRef } from 'react';
import type { LiveClassState } from '../types/attendance.types';
import { useData } from '../context/DataContext';

export const useLiveActivity = (eventId: string) => {
  const { studentActivities, getActivitiesForEvent } = useData();
  
  const [liveState, setLiveState] = useState<LiveClassState>({
    eventId,
    isLive: false,
    teacherJoined: false,
    studentsOnline: [],
    activities: [],
  });

  // Use ref to prevent infinite loops
  const eventIdRef = useRef(eventId);
  eventIdRef.current = eventId;

  // Get activities for this event - memoized
  const eventActivities = eventId ? getActivitiesForEvent(eventId) : [];

  // Update live state when activities change
  useEffect(() => {
    if (!eventIdRef.current) return;

    const studentStatus = new Map<string, boolean>();

    // Get activities for current event
    const currentActivities = studentActivities.filter(
      a => a.eventId === eventIdRef.current
    );

    currentActivities.forEach(activity => {
      if (activity.action === 'joined') {
        studentStatus.set(activity.studentId, true);
      } else if (activity.action === 'left') {
        studentStatus.set(activity.studentId, false);
      }
    });

    const onlineStudents: string[] = [];
    studentStatus.forEach((isOnline, studentId) => {
      if (isOnline) onlineStudents.push(studentId);
    });

    setLiveState(prev => ({
      ...prev,
      eventId: eventIdRef.current,
      studentsOnline: onlineStudents,
      activities: currentActivities,
    }));
  }, [studentActivities, eventId]); // Only depend on studentActivities array

  const startClass = useCallback(() => {
    setLiveState(prev => ({
      ...prev,
      isLive: true,
      teacherJoined: true,
      teacherJoinedAt: new Date().toISOString(),
    }));
  }, []);

  const endClass = useCallback(() => {
    setLiveState(prev => ({
      ...prev,
      isLive: false,
    }));
  }, []);

  return {
    liveState,
    eventActivities,
    onlineCount: liveState.studentsOnline.length,
    startClass,
    endClass,
  };
};