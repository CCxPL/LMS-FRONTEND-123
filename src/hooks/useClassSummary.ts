import { useState, useEffect, useCallback, useRef } from 'react';
import type { CalendarEvent } from '../types/calendar.types';
import type { ClassSummary } from '../types/attendance.types';
import { useData } from '../context/DataContext';
import axiosInstance from '../api/axiosInstance';

export const useClassSummary = (events: CalendarEvent[]) => {
  const { attendanceRecords, addClassSummary, classSummaries } = useData();
  const [generatedEventIds, setGeneratedEventIds] = useState<Set<string>>(new Set());

  const eventsRef = useRef(events);
  eventsRef.current = events;

  const generateClassSummary = useCallback(async (event: CalendarEvent) => {
    if (generatedEventIds.has(event.id)) return;
    if (classSummaries.some(s => s.eventId === event.id)) return;

    try {
      // Fetch course from API instead of mockCourses
      const res = await axiosInstance.get(`/courses/${event.courseId}`);
      const course = res.data?.data?.course;
      if (!course) return;

      const eventAttendance = attendanceRecords.filter(r => r.eventId === event.id);

      const [startHour, startMin] = event.startTime.split(':').map(Number);
      const [endHour, endMin] = event.endTime.split(':').map(Number);
      const classDuration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

      const summary: ClassSummary = {
        id: `summary-${event.id}-${Date.now()}`,
        eventId: event.id,
        teacherName: event.teacherName,
        courseName: event.courseName,
        totalStudentsEnrolled: course.enrolledStudents?.length || course.studentCount || 0,
        studentsAttended: eventAttendance.filter(r => r.isPresent).length,
        classStartTime: `${event.date}T${event.startTime}:00Z`,
        classEndTime: `${event.date}T${event.endTime}:00Z`,
        classDuration,
        attendanceRecords: eventAttendance,
        createdAt: new Date().toISOString(),
      };

      addClassSummary(summary);
      setGeneratedEventIds(prev => new Set(prev).add(event.id));
    } catch (error) {
      console.error('Error generating class summary:', error);
    }
  }, [attendanceRecords, addClassSummary, classSummaries, generatedEventIds]);

  useEffect(() => {
    const checkForCompletedClasses = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      eventsRef.current.forEach(event => {
        if (event.date !== today || !event.isActive) return;
        if (generatedEventIds.has(event.id)) return;

        const [endHour, endMin] = event.endTime.split(':').map(Number);
        const eventEndTime = new Date(now);
        eventEndTime.setHours(endHour, endMin, 0, 0);

        if (now > eventEndTime) {
          generateClassSummary(event);
        }
      });
    };

    const timeoutId = setTimeout(checkForCompletedClasses, 2000);
    const intervalId = setInterval(checkForCompletedClasses, 60000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [generateClassSummary, generatedEventIds]);

  return {
    generatedEventIds: Array.from(generatedEventIds),
  };
};