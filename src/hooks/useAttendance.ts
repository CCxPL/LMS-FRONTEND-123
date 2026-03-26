import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { joinClassApi, leaveClassApi } from '../api/attendanceApi';
import { getSocket } from '../services/socketService';

export const useAttendance = (eventId: string) => {
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const joinClass = useCallback(async () => {
    if (!user || isJoined || isLoading) return;
    setIsLoading(true);
    try {
      await joinClassApi(eventId);
      getSocket()?.emit("class:join", {
        eventId,
        userId: user.id,
        userName: user.name,
      });
      setIsJoined(true);
    } catch (error) {
      console.error("Failed to join class:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, isJoined, isLoading]);

  const leaveClass = useCallback(async () => {
    if (!user || !isJoined || isLoading) return;
    setIsLoading(true);
    try {
      await leaveClassApi(eventId);
      getSocket()?.emit("class:leave", {
        eventId,
        userId: user.id,
        userName: user.name,
      });
      setIsJoined(false);
    } catch (error) {
      console.error("Failed to leave class:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, isJoined, isLoading]);

  return {
    isJoined,
    isLoading,
    joinClass,
    leaveClass,
    eventAttendance: [],
    presentCount: 0,
  };
};