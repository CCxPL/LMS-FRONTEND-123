import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Star } from 'lucide-react';
import type { Feedback } from '../../types/feedback.types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface FeedbackModalProps {
  feedback: Feedback;
  isOpen: boolean;
  canEdit: boolean;
  timeRemaining?: { hours: number; minutes: number };
  onClose: () => void;
  onSave: (updates: Partial<Feedback>) => Promise<void>;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  feedback,
  isOpen,
  canEdit,
  timeRemaining,
  onClose,
  onSave,
}) => {
  const [rating, setRating] = useState(feedback.rating);
  const [feedbackText, setFeedbackText] = useState(feedback.feedbackText);
  const [category, setCategory] = useState(feedback.category);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(feedback.rating);
    setFeedbackText(feedback.feedbackText);
    setCategory(feedback.category);
  }, [feedback, isOpen]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave({
        rating,
        feedbackText,
        category,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'teaching', label: 'Teaching Quality' },
    { value: 'behavior', label: 'Behavior & Conduct' },
    { value: 'support', label: 'Student Support' },
    { value: 'other', label: 'Other' },
  ];

  const getRatingLabel = (r: number) => {
    switch(r) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Edit Feedback</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Recipient Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600">Feedback for:</p>
            <p className="font-bold text-gray-900">{feedback.recipientName}</p>
          </div>

          {/* Warning Messages */}
          {!canEdit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-700">
                <span className="font-bold">Locked:</span> Cannot edit after 48 hours. Only Super Admin can delete.
              </p>
            </div>
          )}

          {canEdit && timeRemaining && timeRemaining.hours < 1 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Hurry!</span> Less than 1 hour left to edit!
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={!canEdit}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="disabled:cursor-not-allowed transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1 font-medium">{getRatingLabel(rating)}</p>
            )}
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-500"
              rows={5}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              fullWidth
              disabled={!canEdit || isSubmitting}
              isLoading={isSubmitting}
              onClick={handleSave}
            >
              Save Changes
            </Button>
            <Button variant="outline" fullWidth onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeedbackModal;