import React from 'react';
import { Calendar, Filter, Download, Users, BookOpen } from 'lucide-react';
import type { AttendanceFilter } from '../../types/attendance.types';

interface AttendanceFiltersProps {
  filters: AttendanceFilter;
  onFilterChange: (filters: AttendanceFilter) => void;
  onExportPDF: () => void;
  students?: { id: string; name: string }[];
  courses?: { id: string; name: string }[];
  showStudentFilter?: boolean;
  isExporting?: boolean;
}

const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  filters,
  onFilterChange,
  onExportPDF,
  students = [],
  courses = [],
  showStudentFilter = true,
  isExporting = false
}) => {
  const dateRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Icon */}
        <div className="flex items-center gap-2 text-gray-700">
          <Filter className="w-5 h-5" />
          <span className="font-medium text-sm">Filters:</span>
        </div>

        {/* Student Filter */}
        {showStudentFilter && students.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <select
              value={filters.studentId || ''}
              onChange={(e) => onFilterChange({ ...filters, studentId: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Course Filter */}
        {courses.length > 0 && (
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <select
              value={filters.courseId || ''}
              onChange={(e) => onFilterChange({ ...filters, courseId: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ 
              ...filters, 
              dateRange: e.target.value as AttendanceFilter['dateRange'] 
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>

        {/* Custom Date Range */}
        {filters.dateRange === 'custom' && (
          <>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </>
        )}

        {/* Export Button */}
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilters;