import React, { useEffect, useState, useMemo } from 'react';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import AttendanceFilters from '../../components/reports/AttendanceFilters';
import AttendanceTable from '../../components/reports/AttendanceTable';
import { generateAttendancePDF } from '../../utils/pdfGenerator';
import type { AttendanceFilter, AttendanceStats } from '../../types/attendance.types';
import { getAllAttendanceApi } from '../../api/attendanceApi';
import { getAllCoursesApi } from '../../api/courseApi';

const StudentAttendanceReport: React.FC = () => {
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

  const filteredRecords = useMemo(() => {
    let records = [...attendanceRecords];
    if (filters.courseId) records = records.filter(r => r.courseId === filters.courseId);
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return records;
  }, [attendanceRecords, filters]);

  const stats: AttendanceStats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status === 'present').length;
    const absent = filteredRecords.filter(r => r.status === 'absent').length;
    const late = filteredRecords.filter(r => r.status === 'late').length;
    const totalDuration = filteredRecords.reduce((sum, r) => sum + r.duration, 0);
    return {
      totalClasses: total, present, absent, late,
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
        <div className="p-2 bg-gray-100 rounded-lg"><FileText className="w-6 h-6 text-gray-700" /></div>
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: <Calendar className="w-5 h-5 text-gray-700" />, bg: 'bg-gray-100', value: stats.totalClasses, label: 'Total Classes', color: 'text-gray-900' },
          { icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-100', value: stats.present, label: 'Present', color: 'text-green-600' },
          { icon: <XCircle className="w-5 h-5 text-red-600" />, bg: 'bg-red-100', value: stats.absent, label: 'Absent', color: 'text-red-600' },
          { icon: <Clock className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-100', value: stats.late, label: 'Late', color: 'text-yellow-600' },
          { icon: <TrendingUp className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-100', value: `${stats.attendancePercentage}%`, label: 'Attendance Rate', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${s.bg} rounded-lg`}>{s.icon}</div>
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AttendanceTable records={filteredRecords} showStudent={true} showCourse={!filters.courseId} />
    </div>
  );
};

export default StudentAttendanceReport;