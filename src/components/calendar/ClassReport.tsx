import React from 'react';
import { Download, Users, Clock, TrendingUp, FileText } from 'lucide-react';
import type { ClassSummary } from '../../types/attendance.types';
import { exportClassSummaryToPDF } from '../../utils/pdfExport';
import Button from '../ui/Button';

interface ClassReportProps {
  summary: ClassSummary;
}

const ClassReport: React.FC<ClassReportProps> = ({ summary }) => {
  const attendanceRate = Math.round((summary.studentsAttended / summary.totalStudentsEnrolled) * 100);

  const handleDownloadPDF = () => {
    exportClassSummaryToPDF(summary);
  };

  const handleDownloadJSON = () => {
    const data = JSON.stringify(summary, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-report-${summary.id}.json`;
    a.click();
    URL.revokeObjectURL(url); // ✅ Added cleanup
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Class Summary Report</h3>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPDF} variant="primary" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleDownloadJSON} variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Enrolled</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.totalStudentsEnrolled}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Attended</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.studentsAttended}</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Attendance</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{attendanceRate}%</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Duration</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.classDuration} min</div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4 border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Teacher</div>
            <div className="font-semibold text-gray-900">{summary.teacherName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Course</div>
            <div className="font-semibold text-gray-900">{summary.courseName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Start Time</div>
            <div className="font-semibold text-gray-900">
              {new Date(summary.classStartTime).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">End Time</div>
            <div className="font-semibold text-gray-900">
              {new Date(summary.classEndTime).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-700 mb-3">Detailed Attendance</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Student Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Join Time</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Leave Time</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Duration</th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {summary.attendanceRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{record.studentName}</td>
                  <td className="px-4 py-3">
                    {/* ✅ FIXED: Changed joinTime to joinedAt */}
                    {record.joinedAt ? new Date(record.joinedAt).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {/* ✅ FIXED: Changed leaveTime to leftAt */}
                    {record.leftAt ? new Date(record.leftAt).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-4 py-3">{record.duration || 0} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.isPresent ? 'Present' : 'Absent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassReport;