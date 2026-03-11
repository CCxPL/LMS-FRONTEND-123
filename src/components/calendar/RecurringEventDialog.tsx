import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { CalendarEvent, RecurringEditType } from '../../types/calendar.types';

interface RecurringEventDialogProps {
  isOpen: boolean;
  event: CalendarEvent;
  actionType: 'EDIT' | 'DELETE';
  onConfirm: (editType: RecurringEditType) => void;
  onCancel: () => void;
}

const RecurringEventDialog: React.FC<RecurringEventDialogProps> = ({
  isOpen,
  event,
  actionType,
  onConfirm,
  onCancel,
}) => {
  const [selectedOption, setSelectedOption] = useState<RecurringEditType>('THIS_EVENT');

  if (!isOpen) return null;

  const isDelete = actionType === 'DELETE';
  const actionText = isDelete ? 'Delete' : 'Edit';
//   const actionColor = isDelete ? 'red' : 'black';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDelete ? 'bg-red-100' : 'bg-gray-100'}`}>
              <AlertCircle className={`w-5 h-5 ${isDelete ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {actionText} recurring event?
              </h3>
              <p className="text-sm text-gray-500">{event.title}</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="px-6 py-4 space-y-3">
          {/* Option 1: This event only */}
          <label 
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition
              ${selectedOption === 'THIS_EVENT' 
                ? 'border-gray-900 bg-gray-50' 
                : 'border-gray-200 hover:bg-gray-50'
              }`}
          >
            <input
              type="radio"
              name="recurringOption"
              value="THIS_EVENT"
              checked={selectedOption === 'THIS_EVENT'}
              onChange={() => setSelectedOption('THIS_EVENT')}
              className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
            />
            <div>
              <p className="font-medium text-gray-900">This event only</p>
              <p className="text-sm text-gray-500">
                {isDelete 
                  ? `Only the event on ${formatDate(event.date)} will be deleted`
                  : `Only the event on ${formatDate(event.date)} will be changed`
                }
              </p>
            </div>
          </label>

          {/* Option 2: This and following */}
          <label 
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition
              ${selectedOption === 'THIS_AND_FOLLOWING' 
                ? 'border-gray-900 bg-gray-50' 
                : 'border-gray-200 hover:bg-gray-50'
              }`}
          >
            <input
              type="radio"
              name="recurringOption"
              value="THIS_AND_FOLLOWING"
              checked={selectedOption === 'THIS_AND_FOLLOWING'}
              onChange={() => setSelectedOption('THIS_AND_FOLLOWING')}
              className="mt-1 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
            />
            <div>
              <p className="font-medium text-gray-900">This and following events</p>
              <p className="text-sm text-gray-500">
                {isDelete 
                  ? `This event and all future events in the series will be deleted`
                  : `This event and all future events in the series will be changed`
                }
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedOption)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition
              ${isDelete 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-900 hover:bg-gray-800'
              }`}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default RecurringEventDialog;