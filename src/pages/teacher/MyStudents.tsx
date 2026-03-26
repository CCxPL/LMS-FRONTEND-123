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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewStudent, setViewStudent] = useState<any | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      // ✅ Sab courses fetch karo
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
                // ✅ Already exists — courses list mein add karo
                const existing = studentMap.get(id);
                existing.courses = existing.courses || [existing.courseName];
                existing.courses.push(course.title);
                existing.courseName = existing.courses.join(', ');
              } else {
                // ✅ New student — add karo
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

  const filtered = students.filter(s => {
    const name = s.name || s.studentName || '';
    const email = s.email || s.studentEmail || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExport = () => {
    const csv = [
      ['Student', 'Email', 'Course'].join(','),
      ...filtered.map(s => [
        s.name || s.studentName || '',
        s.email || s.studentEmail || 'N/A',
        s.courseName || '',
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Students</p>
        </Card>
      </div>

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