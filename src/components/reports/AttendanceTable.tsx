import React from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, BookOpen, Umbrella } from 'lucide-react';
import type { AttendanceRecord } from '../../types/attendance.types';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  showStudent?: boolean;
  showCourse?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  showStudent = true,
  showCourse = true
}) => {
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3" />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3" />
            Absent
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3" />
            Late
          </span>
        );
      case 'on-leave':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            <Umbrella className="w-3 h-3" />
            On Leave
          </span>
        );
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (records.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
        <p className="text-gray-500 text-sm">No attendance data found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              {showStudent && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
              )}
              {showCourse && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Join Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Leave Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(record.date)}</span>
                  </div>
                </td>
                {showStudent && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{record.studentName}</p>
                        <p className="text-xs text-gray-500">{record.studentEmail}</p>
                      </div>
                    </div>
                  </td>
                )}
                {showCourse && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{record.courseName}</span>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{record.eventTitle}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    {getStatusBadge(record.status)}
                    {record.status === 'on-leave' && record.leaveReason && (
                      <p className="text-xs text-orange-600 mt-1">
                        Reason: {record.leaveReason}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {record.status === 'on-leave' ? 'N/A' : formatTime(record.joinTime)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {record.status === 'on-leave' ? 'N/A' : formatTime(record.leaveTime)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-medium">
                    {record.status === 'on-leave' ? 'N/A' : record.duration > 0 ? `${record.duration} min` : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;