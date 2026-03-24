import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface FeedbackFormProps {
  recipientId: string;
  recipientName: string;
  recipientType: 'admin' | 'teacher';
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
  onSubmit?: (data: any) => Promise<void>;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  
  recipientName,
  recipientType,
  onSubmitSuccess,
  onCancel,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [category, setCategory] = useState<'teaching' | 'behavior' | 'support' | 'other'>('teaching');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (rating === 0 || !feedbackText.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          feedbackText,
          rating,
          category,
        });
      }
      setRating(0);
      setFeedbackText('');
      setCategory('teaching');
      onSubmitSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border border-gray-200">
      <div className="space-y-6">
        {/* Recipient Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-gray-600">Giving feedback to:</p>
          <p className="font-bold text-gray-900 mt-1">{recipientName}</p>
          <p className="text-xs text-gray-500 capitalize mt-0.5">{recipientType === 'teacher' ? '👨‍🏫 Teacher' : '🏢 Administrator'}</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Rating *</label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-125"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2 font-medium">{getRatingLabel(rating)}</p>
          )}
        </div>

        {/* Feedback Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback *</label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your experience, suggestions, or concerns..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={5}
          />
          <p className="text-xs text-gray-500 mt-1">{feedbackText.length}/500 characters</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button 
            fullWidth 
            isLoading={isSubmitting} 
            onClick={handleSubmit}
            disabled={rating === 0 || !feedbackText.trim()}
          >
            <Send className="w-4 h-4" /> Submit Feedback
          </Button>
          {onCancel && (
            <Button variant="outline" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FeedbackForm;