import React, { useState } from 'react';
import { Video, Loader, ExternalLink, LogOut } from 'lucide-react';
import type { CalendarEvent } from '../../types/calendar.types';
import { useAttendance } from '../../hooks/useAttendance';
import { isEventLive } from '../../utils/eventHelpers';

interface JoinClassButtonProps {
  event: CalendarEvent;
  onJoin?: () => void;
  onLeave?: () => void;
}

const JoinClassButton: React.FC<JoinClassButtonProps> = ({
  event,
  onJoin,
  onLeave,
}) => {
  const { isJoined, joinClass, leaveClass } = useAttendance(event.id);
  const [isLoading, setIsLoading] = useState(false);
  const isLive = isEventLive(event);

  const handleJoin = async () => {
    setIsLoading(true);
    joinClass();
    
    if (event.meetingLink) {
      window.open(event.meetingLink, '_blank');
    }
    
    onJoin?.();
    setIsLoading(false);
  };

  const handleLeave = () => {
    leaveClass();
    onLeave?.();
  };

  if (!isLive && !isJoined) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
      >
        <Video className="w-4 h-4" />
        Class Not Live
      </button>
    );
  }

  if (isJoined) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          In Class
        </span>
        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
        >
          <LogOut className="w-4 h-4" />
          Leave
        </button>
        <a
          href={event.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
    >
      {isLoading ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : (
        <Video className="w-4 h-4" />
      )}
      Join Class
    </button>
  );
};

export default JoinClassButton;