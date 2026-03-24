import React, { useState, useMemo } from 'react';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp, Calendar, Umbrella } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import AttendanceFilters from '../../components/reports/AttendanceFilters';
import AttendanceTable from '../../components/reports/AttendanceTable';
import { generateAttendancePDF } from '../../utils/pdfGenerator';
import type { AttendanceFilter, AttendanceRecord, AttendanceStats } from '../../types/attendance.types';

const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    courseId: 'course-1',
    courseName: 'React Development',
    eventId: 'event-1',
    eventTitle: 'Introduction to React',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Teacher',
    date: '2024-01-15',
    isPresent: true,
    joinTime: '2024-01-15T10:02:00',
    leaveTime: '2024-01-15T11:00:00',
    duration: 58,
    status: 'present',
    createdAt: '2024-01-15T10:02:00'
  },
  {
    id: '2',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    courseId: 'course-1',
    courseName: 'React Development',
    eventId: 'event-2',
    eventTitle: 'React Components',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Teacher',
    date: '2024-01-16',
    isPresent: true,
    joinTime: '2024-01-16T10:15:00',
    leaveTime: '2024-01-16T11:00:00',
    duration: 45,
    status: 'late',
    createdAt: '2024-01-16T10:15:00'
  },
  {
    id: '3',
    studentId: 'student-1',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    courseId: 'course-1',
    courseName: 'React Development',
    eventId: 'event-3',
    eventTitle: 'React Hooks',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Teacher',
    date: '2024-01-17',
    isPresent: false,
    joinTime: null,
    leaveTime: null,
    duration: 0,
    status: 'absent',
    createdAt: '2024-01-17T10:00:00'
  },
  {
    id: '4',
    studentId: 'student-2',
    studentName: 'Jane Smith',
    studentEmail: 'jane@example.com',
    courseId: 'course-1',
    courseName: 'React Development',
    eventId: 'event-1',
    eventTitle: 'Introduction to React',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Teacher',
    date: '2024-01-15',
    isPresent: true,
    joinTime: '2024-01-15T10:00:00',
    leaveTime: '2024-01-15T11:00:00',
    duration: 60,
    status: 'present',
    createdAt: '2024-01-15T10:00:00'
  },
  {
    id: '5',
    studentId: 'student-2',
    studentName: 'Jane Smith',
    studentEmail: 'jane@example.com',
    courseId: 'course-2',
    courseName: 'Node.js Backend',
    eventId: 'event-4',
    eventTitle: 'Express Basics',
    teacherId: 'teacher-1',
    teacherName: 'Sarah Teacher',
    date: '2024-01-18',
    isPresent: true,
    joinTime: '2024-01-18T14:00:00',
    leaveTime: '2024-01-18T15:30:00',
    duration: 90,
    status: 'present',
    createdAt: '2024-01-18T14:00:00'
  }
];

const mockStudents = [
  { id: 'student-1', name: 'John Doe' },
  { id: 'student-2', name: 'Jane Smith' },
  { id: 'student-3', name: 'Bob Wilson' }
];

const mockCourses = [
  { id: 'course-1', name: 'React Development' },
  { id: 'course-2', name: 'Node.js Backend' },
  { id: 'course-3', name: 'Python Basics' }
];

const StudentAttendanceReport: React.FC = () => {
  const {  } = useAuth();
  const { leaves } = useData();
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<AttendanceFilter>({ dateRange: 'month' });

  const isStudentOnLeave = (studentId: string, date: string) => {
    return leaves.find(leave => 
      leave.studentId === studentId &&
      leave.status === 'approved' &&
      leave.days.includes(date)
    );
  };

  const filteredRecords = useMemo(() => {
    let records = [...mockAttendanceRecords];

    if (filters.studentId) records = records.filter(r => r.studentId === filters.studentId);
    if (filters.courseId) records = records.filter(r => r.courseId === filters.courseId);

    records = records.map(record => {
      const leaveInfo = isStudentOnLeave(record.studentId, record.date);
      if (leaveInfo) {
        return {
          ...record,
          status: 'on-leave' as const,
          leaveReason: leaveInfo.reason,
          joinTime: null,
          leaveTime: null,
          duration: 0
        };
      }
      return record;
    });

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return records;
  }, [filters, leaves]);

  const stats: AttendanceStats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status === 'present').length;
    const absent = filteredRecords.filter(r => r.status === 'absent').length;
    const late = filteredRecords.filter(r => r.status === 'late').length;
    const onLeave = filteredRecords.filter(r => r.status === 'on-leave').length;
    const totalDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalClasses: total,
      present,
      absent,
      late,
      onLeave,
      attendancePercentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
      totalDuration
    };
  }, [filteredRecords]);

  const getDateRangeLabel = () => {
    switch (filters.dateRange) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    const studentName = filters.studentId ? mockStudents.find(s => s.id === filters.studentId)?.name : undefined;
    const courseName = filters.courseId ? mockCourses.find(c => c.id === filters.courseId)?.name : undefined;

    setTimeout(() => {
      generateAttendancePDF({
        title: 'Student Attendance Report',
        studentName,
        courseName,
        dateRange: getDateRangeLabel(),
        stats,
        records: filteredRecords
      });
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <FileText className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
          <p className="text-sm text-gray-500">View and export student attendance records</p>
        </div>
      </div>

      <AttendanceFilters
        filters={filters}
        onFilterChange={setFilters}
        onExportPDF={handleExportPDF}
        students={mockStudents}
        courses={mockCourses}
        isExporting={isExporting}
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
              <p className="text-xs text-gray-500">Total Classes</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-xs text-gray-500">Late</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Umbrella className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.onLeave || 0}</p>
              <p className="text-xs text-gray-500">On Leave</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.attendancePercentage}%</p>
              <p className="text-xs text-gray-500">Attendance Rate</p>
            </div>
          </div>
        </div>
      </div>

      <AttendanceTable 
        records={filteredRecords}
        showStudent={!filters.studentId}
        showCourse={!filters.courseId}
      />
    </div>
  );
};

export default StudentAttendanceReport;