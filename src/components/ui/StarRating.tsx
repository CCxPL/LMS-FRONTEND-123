import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
  showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  readonly = false, 
  size = 'md', 
  onChange,
  showValue = false
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <Star 
            className={`${sizeClass[size]} ${
              star <= value 
                ? 'fill-gray-900 text-gray-900' 
                : 'text-gray-300'
            }`} 
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;