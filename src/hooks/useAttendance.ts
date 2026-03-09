import { useState, useCallback } from 'react';
import type { AttendanceRecord, StudentActivity } from '../types/attendance.types';
import { useData } from '../context/DataContext';
import { useAuth } from './useAuth';

export const useAttendance = (eventId: string) => {
  const { user } = useAuth();
  const { 
    attendanceRecords, 
    addAttendanceRecord, 
    updateAttendanceRecord,
    addStudentActivity 
  } = useData();
  
  const [isJoined, setIsJoined] = useState(false);

  const eventAttendance = attendanceRecords.filter(r => r.eventId === eventId);

  const joinClass = useCallback(() => {
    if (!user || isJoined) return;

    const now = new Date().toISOString();

    const record: AttendanceRecord = {
      id: `attendance-${eventId}-${user.id}-${Date.now()}`,
      eventId,
      studentId: user.id,
      studentName: user.name,
      isPresent: true,
      joinedAt: now,
    };

    addAttendanceRecord(record);

    const activity: StudentActivity = {
      id: `activity-${Date.now()}`,
      eventId,
      studentId: user.id,
      studentName: user.name,
      action: 'joined',
      timestamp: now,
    };

    addStudentActivity(activity);
    setIsJoined(true);

    console.log(`✅ ${user.name} joined the class`);
  }, [user, eventId, isJoined, addAttendanceRecord, addStudentActivity]);

  const leaveClass = useCallback(() => {
    if (!user || !isJoined) return;

    const now = new Date().toISOString();

    const record = attendanceRecords.find(
      r => r.eventId === eventId && r.studentId === user.id && !r.leftAt
    );

    if (record) {
      const joinedTime = new Date(record.joinedAt || now).getTime();
      const leftTime = new Date(now).getTime();
      const duration = Math.round((leftTime - joinedTime) / 60000);

      updateAttendanceRecord(record.id, {
        leftAt: now,
        duration,
      });
    }

    const activity: StudentActivity = {
      id: `activity-${Date.now()}`,
      eventId,
      studentId: user.id,
      studentName: user.name,
      action: 'left',
      timestamp: now,
    };

    addStudentActivity(activity);
    setIsJoined(false);

    console.log(`👋 ${user.name} left the class`);
  }, [user, eventId, isJoined, attendanceRecords, updateAttendanceRecord, addStudentActivity]);

  return {
    isJoined,
    joinClass,
    leaveClass,
    eventAttendance,
    presentCount: eventAttendance.filter(r => r.isPresent).length,
  };
};