import React from 'react';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AttendanceRecord } from '../../types/attendance.types';
import { formatDuration } from '../../utils/dateHelpers';

interface AttendancePanelProps {
  records: AttendanceRecord[];
  totalEnrolled: number;
}

const AttendancePanel: React.FC<AttendancePanelProps> = ({
  records,
  totalEnrolled,
}) => {
  const presentCount = records.filter(r => r.isPresent).length;
  const absentCount = totalEnrolled - presentCount;
  const attendancePercentage = totalEnrolled > 0 
    ? Math.round((presentCount / totalEnrolled) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Attendance
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          <div className="text-xs text-gray-500">Present</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          <div className="text-xs text-gray-500">Absent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{attendancePercentage}%</div>
          <div className="text-xs text-gray-500">Rate</div>
        </div>
      </div>

      <div className="max-h-75 overflow-y-auto">
        {records.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No attendance records yet
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map(record => (
              <div
                key={record.id}
                className="p-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-full ${
                    record.isPresent ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {record.isPresent ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {record.studentName}
                  </span>
                </div>
                
                {record.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDuration(record.duration)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePanel;