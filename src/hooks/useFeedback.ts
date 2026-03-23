import { useState, useCallback, } from 'react';
import { feedbackService } from '../services/feedbackService';
import type { Feedback, FeedbackStats } from '../types/feedback.types';

export const useFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all feedbacks
  const getAllFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getAllFeedbacks();
      setFeedbacks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get feedbacks by recipient
  const getFeedbacksByRecipient = useCallback(async (recipientId: string) => {
    setLoading(true);
    try {
      const data = await feedbackService.getFeedbacksByRecipient(recipientId);
      setFeedbacks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIXED: Direct return array instead of Promise
  const getFeedbacksByStudent = useCallback((studentId: string) => {
    return feedbacks.filter(f => f.studentId === studentId && !f.isDeleted);
  }, [feedbacks]);

  // Submit feedback
  const submitFeedback = useCallback(async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newFeedback = await feedbackService.submitFeedback(feedback);
      setFeedbacks(prev => [newFeedback, ...prev]);
      setError(null);
      return newFeedback;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update feedback
  const updateFeedback = useCallback(async (feedbackId: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'createdBy'>>) => {
    setLoading(true);
    try {
      const updated = await feedbackService.updateFeedback(feedbackId, updates);
      if (updated) {
        setFeedbacks(prev => prev.map(f => f.id === feedbackId ? updated : f));
        setError(null);
        return updated;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feedback');
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // Delete feedback
  const deleteFeedback = useCallback(async (feedbackId: string) => {
    setLoading(true);
    try {
      const success = await feedbackService.deleteFeedback(feedbackId);
      if (success) {
        setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
        setError(null);
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feedback');
    } finally {
      setLoading(false);
    }
    return false;
  }, []);

  // Check if can edit
  const canEditFeedback = useCallback((feedback: Feedback): boolean => {
    return feedbackService.canEditFeedback(feedback);
  }, []);

  // Get time remaining
  const getTimeRemaining = useCallback((feedback: Feedback) => {
    return feedbackService.getTimeRemainingForEdit(feedback);
  }, []);

  // Get stats
  const getStats = useCallback(async (): Promise<FeedbackStats | null> => {
    try {
      return await feedbackService.getFeedbackStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
      return null;
    }
  }, []);

  return {
    feedbacks,
    loading,
    error,
    getAllFeedbacks,
    getFeedbacksByRecipient,
    getFeedbacksByStudent, // ✅ Now returns array directly
    submitFeedback,
    updateFeedback,
    deleteFeedback,
    canEditFeedback,
    getTimeRemaining,
    getStats,
  };
};