import { useMemo, useCallback, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from './useAuth';
import axiosInstance from '../api/axiosInstance';

export const useAttendance = (eventId: string) => {
  const { user } = useAuth();
  const { attendanceRecords, addAttendanceRecord, updateAttendanceRecord } = useData();

  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => record.eventId === eventId);
  }, [attendanceRecords, eventId]);

  const currentUserAttendance = useMemo(() => {
    if (!user) return undefined;
    return eventAttendance.find((record) => record.studentId === user.id);
  }, [eventAttendance, user]);

  // Sync isJoined status if active record exists
  useEffect(() => {
    if (currentUserAttendance) {
      const active = Boolean(currentUserAttendance.isPresent && !currentUserAttendance.leaveTime && !currentUserAttendance.leftAt);
      setIsJoined(active);
    } else {
      setIsJoined(false);
    }
  }, [currentUserAttendance]);

  const joinClass = useCallback(async () => {
    if (!user) {
      setError('User is not logged in.');
      return;
    }

    if (!eventId) {
      setError('Invalid class/event.');
      return;
    }

    if (isJoined) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/attendance/join', { eventId });
      const attendance = response.data?.data?.attendance || response.data?.attendance;

      setIsJoined(true);
      if (attendance) {
        addAttendanceRecord(attendance);
      }
    } catch (err: any) {
      console.error('Failed to join class:', err);
      setError(err?.response?.data?.message || 'Unable to mark attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, isJoined, addAttendanceRecord]);

  const leaveClass = useCallback(async () => {
    if (!user) {
      setError('User is not logged in.');
      return;
    }

    if (!eventId) {
      setError('Invalid class/event.');
      return;
    }

    if (!isJoined) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/attendance/leave', { eventId });
      const attendance = response.data?.data?.attendance || response.data?.attendance;

      setIsJoined(false);
      if (attendance) {
        updateAttendanceRecord(attendance.id || eventId, attendance);
      }
    } catch (err: any) {
      console.error('Failed to leave class:', err);
      setError(err?.response?.data?.message || 'Unable to update attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, isJoined, updateAttendanceRecord]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isJoined,
    isLoading,
    error,
    clearError,

    joinClass,
    leaveClass,

    eventAttendance,
    currentUserAttendance,

    presentCount: eventAttendance.filter((record) => record.isPresent).length,
  };
};