import React from 'react';
import { Users, Clock, CheckCircle, AlertTriangle, Download, X } from 'lucide-react';
import type { ClassSummary } from '../../types/attendance.types';
import { formatDuration } from '../../utils/dateHelpers';

interface ClassSummaryModalProps {
  summary: ClassSummary;
  onClose: () => void;
  onExport?: () => void;
}

const ClassSummaryModal: React.FC<ClassSummaryModalProps> = ({
  summary,
  onClose,
  onExport,
}) => {
  const attendancePercentage = summary.totalStudentsEnrolled > 0
    ? Math.round((summary.studentsAttended / summary.totalStudentsEnrolled) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Class Summary</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Attendance</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {summary.studentsAttended} / {summary.totalStudentsEnrolled}
                </p>
                <p className="text-sm text-blue-600">{attendancePercentage}%</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatDuration(summary.classDuration)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Course</span>
                <span className="font-medium">{summary.courseName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Teacher</span>
                <span className="font-medium">{summary.teacherName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Teacher Status</span>
                <span className={`font-medium flex items-center gap-1 ${
                  summary.teacherWasLate ? 'text-red-600' : 'text-green-600'
                }`}>
                  {summary.teacherWasLate ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Late by {summary.teacherLateByMinutes} min
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      On Time
                    </>
                  )}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Attendance Details</h4>
              <div className="max-h-50 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-3">Student</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {summary.attendanceRecords.map(record => (
                      <tr key={record.id}>
                        <td className="p-3">{record.studentName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.isPresent 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.isPresent ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">
                          {record.duration ? `${record.duration} min` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              {onExport && (
                <button
                  onClick={onExport}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSummaryModal;