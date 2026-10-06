import { useMemo, useCallback, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from './useAuth';

export const useAttendance = (eventId: string) => {
  const { user } = useAuth();

  const {
    attendanceRecords,
  } = useData();

  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventAttendance = useMemo(() => {
    return attendanceRecords.filter(
      (record) => record.eventId === eventId
    );
  }, [attendanceRecords, eventId]);

  const currentUserAttendance = useMemo(() => {
    if (!user) {
      return undefined;
    }

    return eventAttendance.find(
      (record) =>
        record.studentId === user.id
    );
  }, [eventAttendance, user]);

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
      /*
       * IMPORTANT:
       *
       * Attendance backend API is not implemented yet.
       *
       * Do NOT create fake attendance records here.
       * Do NOT use Date.now() as database ID.
       * Do NOT add dummy course/teacher values.
       *
       * When backend attendance API is ready,
       * replace this block with:
       *
       * const response = await axiosInstance.post(
       *   '/attendance/join',
       *   {
       *     eventId,
       *   }
       * );
       *
       * const attendance =
       *   response.data?.data?.attendance;
       *
       * Then refresh attendance from backend.
       */

      console.warn(
        'Attendance join API is not implemented yet. Nothing was saved to MySQL.'
      );

      setError(
        'Attendance service is not available yet.'
      );
    } catch (err) {
      console.error(
        'Failed to join class:',
        err
      );

      setError(
        'Unable to mark attendance. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, isJoined]);

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
      /*
       * IMPORTANT:
       *
       * When backend API is ready,
       * replace this block with:
       *
       * await axiosInstance.patch(
       *   '/attendance/leave',
       *   {
       *     eventId,
       *   }
       * );
       */

      console.warn(
        'Attendance leave API is not implemented yet. Nothing was updated in MySQL.'
      );

      setError(
        'Attendance service is not available yet.'
      );
    } catch (err) {
      console.error(
        'Failed to leave class:',
        err
      );

      setError(
        'Unable to update attendance. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, isJoined]);

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

    presentCount:
      eventAttendance.filter(
        (record) => record.isPresent
      ).length,
  };
};