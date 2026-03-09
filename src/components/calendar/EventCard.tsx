import React from 'react';
import { Clock, Video, FileText, ExternalLink } from 'lucide-react';
import type { CalendarEvent } from '../../types/calendar.types';
import { formatTime12hr } from '../../utils/dateHelpers';
import { isEventLive, isEventUpcoming } from '../../utils/eventHelpers';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  showActions?: boolean;
  onJoin?: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  showActions = true,
  onJoin,
  onEdit,
  canEdit = false,
}) => {
  const isLive = isEventLive(event);
  const isUpcoming = isEventUpcoming(event);

  const bgColor = event.type === 'class' 
    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
    : 'bg-red-50 border-red-200 hover:bg-red-100';

  const typeColor = event.type === 'class' ? 'text-blue-600' : 'text-red-600';
  const typeBg = event.type === 'class' ? 'bg-blue-100' : 'bg-red-100';

  return (
    <div
      className={`p-4 rounded-lg border-2 ${bgColor} transition-all cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBg} ${typeColor}`}>
              {event.type === 'class' ? 'CLASS' : 'TEST'}
            </span>
            {isLive && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-600 animate-pulse">
                🔴 LIVE
              </span>
            )}
            {isUpcoming && !isLive && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-600">
                ⏰ Starting Soon
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">{event.title}</h3>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{event.courseName}</span>
        </div>
        <div className="text-gray-500 mt-1">
          by {event.teacherName}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
        <Clock className="w-4 h-4" />
        <span>
          {formatTime12hr(event.startTime)} - {formatTime12hr(event.endTime)}
        </span>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          {(isLive || isUpcoming) && onJoin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Video className="w-4 h-4" />
              {isLive ? 'Join Now' : 'Join Class'}
            </button>
          )}
          
          {event.meetingLink && (
            <a
              href={event.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;