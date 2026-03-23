export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  recipientId: string; // admin/teacher id
  recipientType: 'admin' | 'teacher'; // who receives feedback
  recipientName: string;
  feedbackText: string;
  rating: number; // 1-5
  category: 'teaching' | 'behavior' | 'support' | 'other';
  createdAt: string;
  updatedAt: string;
  createdBy: string; // student id
  isDeleted?: boolean;
}

export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  feedbacksByCategory: Record<string, number>;
  feedbacksByRecipient: Record<string, number>;
}