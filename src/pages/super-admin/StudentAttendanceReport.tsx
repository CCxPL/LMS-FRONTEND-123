import React, { useEffect, useState, useMemo } from 'react';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp, Calendar, Umbrella } from 'lucide-react';
import { useData } from '../../context/DataContext';
import AttendanceFilters from '../../components/reports/AttendanceFilters';
import AttendanceTable from '../../components/reports/AttendanceTable';
import { generateAttendancePDF } from '../../utils/pdfGenerator';
import type { AttendanceFilter, AttendanceStats } from '../../types/attendance.types';
import { getAllAttendanceApi } from '../../api/attendanceApi';
import { getAllCoursesApi } from '../../api/courseApi';

const StudentAttendanceReport: React.FC = () => {
  const { leaves } = useData();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AttendanceFilter>({ dateRange: 'month' });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [attendanceRes, coursesRes] = await Promise.all([
        getAllAttendanceApi(),
        getAllCoursesApi({ limit: 100 }),
      ]);

      const rawAttendance = attendanceRes.data?.attendance || [];
      const mapped = rawAttendance.map((a: any) => ({
        id: a._id,
        studentId: a.student?._id || '',
        studentName: a.student?.name || '',
        studentEmail: a.student?.email || '',
        courseId: a.course?._id || '',
        courseName: a.course?.title || '',
        eventId: a.event?._id || '',
        eventTitle: a.event?.title || '',
        teacherId: '',
        teacherName: '',
        date: a.event?.date || new Date(a.createdAt).toISOString().split('T')[0],
        isPresent: a.isPresent,
        joinTime: a.joinTime,
        leaveTime: a.leaveTime,
        duration: a.duration || 0,
        status: a.status,
        createdAt: a.createdAt,
      }));

      setAttendanceRecords(mapped);
      const rawCourses = coursesRes.data?.courses || [];
      setCourses(rawCourses.map((c: any) => ({ id: c._id, name: c.title })));
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStudentOnLeave = (studentId: string, date: string) => {
    return leaves.find(leave =>
      leave.studentId === studentId &&
      leave.status === 'approved' &&
      leave.days.includes(date)
    );
  };

  const filteredRecords = useMemo(() => {
    let records = [...attendanceRecords];

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
          duration: 0,
        };
      }
      return record;
    });

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return records;
  }, [attendanceRecords, filters, leaves]);

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
      totalDuration,
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
    const courseName = filters.courseId ? courses.find(c => c.id === filters.courseId)?.name : undefined;
    setTimeout(() => {
      generateAttendancePDF({
        title: 'Student Attendance Report',
        courseName,
        dateRange: getDateRangeLabel(),
        stats,
        records: filteredRecords,
      });
      setIsExporting(false);
    }, 500);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
    </div>
  );

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
        students={[]}
        courses={courses}
        isExporting={isExporting}
      />

      {/* Stats — 6 cards (friend ka UI) */}
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
        showStudent={true}
        showCourse={!filters.courseId}
      />
    </div>
  );
};

export default StudentAttendanceReport;