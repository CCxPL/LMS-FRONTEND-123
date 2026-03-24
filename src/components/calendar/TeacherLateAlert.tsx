import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Phone } from 'lucide-react';
import type { CalendarEvent } from '../../types/calendar.types';

interface TeacherLateAlertProps {
  event: CalendarEvent;
  onDismiss: () => void;
  onContactTeacher?: () => void;
}

// Helper function
const formatTime12hr = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const TeacherLateAlert: React.FC<TeacherLateAlertProps> = ({
  event,
  onDismiss,
  onContactTeacher,
}) => {
  const [lateMinutes, setLateMinutes] = useState(0);

  useEffect(() => {
    const calculateLateTime = () => {
      const now = new Date();
      const [hours, mins] = event.startTime.split(':').map(Number);
      
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, mins, 0, 0);
      
      const diffMs = now.getTime() - scheduledTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      setLateMinutes(Math.max(0, diffMins));
    };

    calculateLateTime();
    const interval = setInterval(calculateLateTime, 30000); // Update every 30 sec

    return () => clearInterval(interval);
  }, [event.startTime]);

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 relative">
      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 hover:bg-red-100 rounded transition"
      >
        <X className="w-4 h-4 text-red-400" />
      </button>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 bg-red-100 rounded-full shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        
        {/* Content */}
        <div className="flex-1 pr-6">
          <h3 className="font-semibold text-red-800 mb-1">
            Teacher Late Alert
          </h3>
          
          <div className="space-y-1 text-sm">
            <p className="text-red-700">
              <span className="font-medium">{event.teacherName}</span> has not joined the class
            </p>
            <p className="text-red-700">
              Class: <span className="font-medium">{event.title}</span>
            </p>
            <p className="text-red-700">
              Course: <span className="font-medium">{event.courseName}</span>
            </p>
            <p className="text-red-700">
              Scheduled: <span className="font-medium">{formatTime12hr(event.startTime)}</span>
            </p>
          </div>

          {/* Late Badge */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Late by {lateMinutes} minutes
          </div>

          {/* Contact Button */}
          {onContactTeacher && (
            <button
              onClick={onContactTeacher}
              className="mt-3 ml-3 inline-flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              <Phone className="w-4 h-4" />
              Contact Teacher
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherLateAlert;