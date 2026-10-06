import React from 'react';
import { Users, UserPlus, UserMinus, Clock } from 'lucide-react';
import type { StudentActivity } from '../../types/attendance.types';
import { getRelativeTime } from '../../utils/dateHelpers';

interface LiveActivityPanelProps {
  activities: StudentActivity[];
  onlineCount: number;
  isLive: boolean;
}

const LiveActivityPanel: React.FC<LiveActivityPanelProps> = ({
  activities,
  onlineCount,
  isLive,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Live Activity
          </h3>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
            <span className="text-sm text-gray-600">
              {onlineCount} online
            </span>
          </div>
        </div>
      </div>

      <div className="max-h-75 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No activity yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map(activity => (
              <div
                key={activity.id}
                className="p-3 flex items-center gap-3 hover:bg-gray-50"
              >
                <div className={`p-1.5 rounded-full ${
                  activity.action === 'joined' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {activity.action === 'joined' ? (
                    <UserPlus className="w-4 h-4" />
                  ) : (
                    <UserMinus className="w-4 h-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.studentName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.action === 'joined' ? 'Joined' : 'Left'} the class
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {getRelativeTime(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveActivityPanel;