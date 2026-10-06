import React, { useState } from 'react';
import { Star, Edit2, Trash2, Clock, User, } from 'lucide-react';
import type { Feedback } from '../../types/feedback.types';
import Card from '../ui/Card';

interface FeedbackCardProps {
  feedback: Feedback;
  isAdmin?: boolean;
  canEdit?: boolean;
  timeRemaining?: { hours: number; minutes: number };
  onEdit?: () => void;
  onDelete?: () => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  isAdmin = false,
  canEdit = false,
  timeRemaining,
  onEdit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryColors = {
    teaching: { bg: 'bg-blue-100', text: 'text-blue-700', label: '📚' },
    behavior: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '⚠️' },
    support: { bg: 'bg-green-100', text: 'text-green-700', label: '🤝' },
    other: { bg: 'bg-gray-100', text: 'text-gray-700', label: '📝' },
  };

  const categoryInfo = categoryColors[feedback.category];

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      setIsDeleting(true);
      await onDelete?.();
      setIsDeleting(false);
    }
  };

  return (
    <Card hover className="p-4 border border-gray-200 hover:border-gray-300">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <p className="font-bold text-gray-900 text-sm">{feedback.studentName}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Feedback for: <span className="font-semibold text-gray-700">{feedback.recipientName}</span>
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${categoryInfo.bg} ${categoryInfo.text} whitespace-nowrap`}>
            {categoryInfo.label} {feedback.category}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= feedback.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700 ml-2">{feedback.rating}/5</span>
        </div>

        {/* Feedback Text */}
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
          "{feedback.feedbackText}"
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(feedback.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isAdmin && canEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 hover:bg-red-50 rounded text-red-600 disabled:opacity-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Time Warning */}
        {isAdmin && canEdit && timeRemaining && timeRemaining.hours < 12 && (
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
            <p className="text-xs text-yellow-700">
              <span className="font-semibold">{timeRemaining.hours}h {timeRemaining.minutes}m</span> left to edit
            </p>
          </div>
        )}

        {/* Locked Badge */}
        {isAdmin && !canEdit && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <p className="text-xs text-red-700 font-medium">Locked - Cannot edit (48h passed)</p>
          </div>
        )}

        {/* Edit Info */}
        {feedback.updatedAt !== feedback.createdAt && (
          <p className="text-xs text-gray-400 italic pt-2 border-t border-gray-100">
            ✏️ Edited: {new Date(feedback.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
};

export default FeedbackCard;