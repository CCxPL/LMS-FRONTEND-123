import type { Feedback, FeedbackStats } from '../types/feedback.types';

// Mock storage
let feedbacks: Feedback[] = [
  {
    id: 'fb-1',
    studentId: 'student-1',
    studentName: 'Emma Student',
    recipientId: 'teacher-1',
    recipientType: 'teacher',
    recipientName: 'Sarah Teacher',
    feedbackText: 'Great teaching methodology! Very clear explanations.',
    rating: 5,
    category: 'teaching',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString(),
    createdBy: 'student-1',
  },
  {
    id: 'fb-2',
    studentId: 'student-2',
    studentName: 'John Learner',
    recipientId: 'admin-1',
    recipientType: 'admin',
    recipientName: 'Admin Office',
    feedbackText: 'Good support from administration team',
    rating: 4,
    category: 'support',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString(),
    createdBy: 'student-2',
  },
  {
    id: 'fb-3',
    studentId: 'student-3',
    studentName: 'Sarah Learner',
    recipientId: 'teacher-2',
    recipientType: 'teacher',
    recipientName: 'John Smith',
    feedbackText: 'Could improve communication with students',
    rating: 3,
    category: 'behavior',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    createdBy: 'student-3',
  },
];

export const feedbackService = {
  // Submit feedback
  submitFeedback: async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback> => {
    const newFeedback: Feedback = {
      ...feedback,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    feedbacks.push(newFeedback);
    return newFeedback;
  },

  // Get all feedbacks (Super Admin)
  getAllFeedbacks: async (): Promise<Feedback[]> => {
    return feedbacks.filter(f => !f.isDeleted);
  },

  // Get feedbacks by recipient
  getFeedbacksByRecipient: async (recipientId: string): Promise<Feedback[]> => {
    return feedbacks.filter(f => f.recipientId === recipientId && !f.isDeleted);
  },

  // Get feedbacks by student
  getFeedbacksByStudent: async (studentId: string): Promise<Feedback[]> => {
    return feedbacks.filter(f => f.studentId === studentId && !f.isDeleted);
  },

  // Get single feedback
  getFeedbackById: async (feedbackId: string): Promise<Feedback | null> => {
    return feedbacks.find(f => f.id === feedbackId && !f.isDeleted) || null;
  },

  // Check if can edit (48 hour window)
  canEditFeedback: (feedback: Feedback): boolean => {
    const createdTime = new Date(feedback.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursPassed = (currentTime - createdTime) / (1000 * 60 * 60);
    return hoursPassed < 48;
  },

  // Get time remaining for edit
  getTimeRemainingForEdit: (feedback: Feedback): { hours: number; minutes: number } => {
    const createdTime = new Date(feedback.createdAt).getTime();
    const currentTime = new Date().getTime();
    const millisecondsRemaining = 48 * 60 * 60 * 1000 - (currentTime - createdTime);
    
    const hours = Math.floor(millisecondsRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((millisecondsRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { 
      hours: Math.max(0, hours), 
      minutes: Math.max(0, minutes) 
    };
  },

  // Update feedback (only within 48 hours)
  updateFeedback: async (feedbackId: string, updates: Partial<Omit<Feedback, 'id' | 'createdAt' | 'createdBy'>>): Promise<Feedback | null> => {
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return null;

    if (!feedbackService.canEditFeedback(feedback)) {
      throw new Error('Cannot edit feedback after 48 hours');
    }

    const updatedFeedback: Feedback = {
      ...feedback,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const index = feedbacks.findIndex(f => f.id === feedbackId);
    feedbacks[index] = updatedFeedback;
    return updatedFeedback;
  },

  // Delete feedback (Super Admin only)
  deleteFeedback: async (feedbackId: string): Promise<boolean> => {
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (!feedback) return false;

    const index = feedbacks.findIndex(f => f.id === feedbackId);
    feedbacks[index].isDeleted = true;
    return true;
  },

  // Get feedback statistics
  getFeedbackStats: async (): Promise<FeedbackStats> => {
    const activeFeedbacks = feedbacks.filter(f => !f.isDeleted);
    
    const categoryCount: Record<string, number> = {};
    const recipientCount: Record<string, number> = {};
    let totalRating = 0;

    activeFeedbacks.forEach(f => {
      categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
      recipientCount[f.recipientName] = (recipientCount[f.recipientName] || 0) + 1;
      totalRating += f.rating;
    });

    return {
      totalFeedbacks: activeFeedbacks.length,
      averageRating: activeFeedbacks.length > 0 ? totalRating / activeFeedbacks.length : 0,
      feedbacksByCategory: categoryCount,
      feedbacksByRecipient: recipientCount,
    };
  },
};