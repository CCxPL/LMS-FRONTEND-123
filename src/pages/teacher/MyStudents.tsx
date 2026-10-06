import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, Mail, Download, RefreshCw, TrendingUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { getTeacherCoursesApi, getEnrolledStudentsApi } from '../../api/teacherApi';

const MyStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewStudent, setViewStudent] = useState<any | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  // ─── TERA API LOGIC ───────────────────────────────────────────────────────
  const loadStudents = async () => {
    try {
      const coursesRes = await getTeacherCoursesApi({ limit: 100 });
      const courses = coursesRes.data?.courses || [];

      const studentMap = new Map<string, any>();

      await Promise.all(
        courses.map(async (course: any) => {
          try {
            const res = await getEnrolledStudentsApi(course._id || course.id);
            const courseStudents = res.data?.students || [];
            courseStudents.forEach((s: any) => {
              const id = s._id || s.id;
              if (studentMap.has(id)) {
                const existing = studentMap.get(id);
                existing.courses = existing.courses || [existing.courseName];
                existing.courses.push(course.title);
                existing.courseName = existing.courses.join(', ');
              } else {
                studentMap.set(id, {
                  ...s,
                  courseName: course.title,
                  courses: [course.title],
                });
              }
            });
          } catch { }
        })
      );

      setStudents(Array.from(studentMap.values()));
    } catch (error) {
      showToast('Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStudents();
    setIsRefreshing(false);
    showToast('Students refreshed', 'success');
  };
  // ─────────────────────────────────────────────────────────────────────────

  const filtered = students.filter(s => {
    const name = s.name || s.studentName || '';
    const email = s.email || s.studentEmail || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ['Student', 'Email', 'Course', 'Progress', 'Status'].join(','),
      ...filtered.map(s => [
        s.name || s.studentName || '',
        s.email || s.studentEmail || 'N/A',
        s.courseName || '',
        s.progress !== undefined ? `${s.progress}%` : 'N/A',
        s.status || 'N/A',
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-students.csv';
    a.click();
    showToast('Students exported', 'success');
  };

  const handleSendMessage = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    completed: students.filter(s => s.status === 'completed').length,
    avgProgress: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length)
      : 0,
  };

  if (isLoading) return <Loader text="Loading students..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-sm text-gray-500 mt-1">Track progress of enrolled students</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Students</p>
        </Card>
        <Card className="text-center p-4 bg-blue-50">
          <p className="text-2xl font-black text-blue-600">{stats.active}</p>
          <p className="text-xs text-blue-600">Active</p>
        </Card>
        <Card className="text-center p-4 bg-emerald-50">
          <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
          <p className="text-xs text-emerald-600">Completed</p>
        </Card>
        <Card className="text-center p-4 bg-purple-50">
          <p className="text-2xl font-black text-purple-600">{stats.avgProgress}%</p>
          <p className="text-xs text-purple-600">Avg Progress</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No students found</p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Student</th>
                  <th className="px-4 py-4 text-left font-semibold">Course</th>
                  <th className="px-4 py-4 text-center font-semibold">Progress</th>
                  <th className="px-4 py-4 text-center font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student) => (
                  <tr key={student._id || student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(student.name || student.studentName || 'S').charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name || student.studentName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{student.email || student.studentEmail || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{student.courseName || ''}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${(student.progress || 0) >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                            style={{ width: `${student.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-600">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${student.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {student.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setViewStudent(student)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(student.email || student.studentEmail) && (
                          <button
                            onClick={() => handleSendMessage(student.email || student.studentEmail)}
                            className="p-1.5 hover:bg-blue-50 rounded text-blue-500"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal isOpen={!!viewStudent} onClose={() => setViewStudent(null)} title="Student Details" size="md">
        {viewStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(viewStudent.name || viewStudent.studentName || 'S').charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewStudent.name || viewStudent.studentName}</h3>
                <p className="text-gray-500">{viewStudent.email || viewStudent.studentEmail}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{viewStudent.progress || 0}%</p>
                <p className="text-sm text-gray-500">Progress</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="font-bold text-gray-900 capitalize mt-2">{viewStudent.status || 'active'}</p>
                <p className="text-sm text-gray-500">Status</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Course</p>
              <p className="font-medium text-gray-900">{viewStudent.courseName || 'N/A'}</p>
            </div>
            <div className="flex gap-3">
              {(viewStudent.email || viewStudent.studentEmail) && (
                <Button className="flex-1" onClick={() => handleSendMessage(viewStudent.email || viewStudent.studentEmail)}>
                  <Mail className="w-4 h-4" /> Send Email
                </Button>
              )}
              <Button variant="secondary" onClick={() => setViewStudent(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyStudents;