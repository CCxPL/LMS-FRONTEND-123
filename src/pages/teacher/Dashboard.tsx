import React, { useEffect, useState } from 'react';
import { BookOpen, Users, ClipboardList, Star, Play, Eye, Calendar, MessageSquare, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getTeacherDashboardApi } from '../../api/dashboardApi';

const TeacherDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashData, setDashData] = useState<any>(null);
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await getTeacherDashboardApi();
      setDashData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboard();
      showToast('Dashboard refreshed', 'success');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) return <Loader />;

  const stats = [
    { title: 'My Courses', value: dashData?.totalCourses ?? '0', icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50', path: '/teacher/my-courses' },
    { title: 'Active Students', value: dashData?.activeStudents ?? '0', icon: <Users className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50', path: '/teacher/my-students' },
    { title: 'Assignments', value: `${dashData?.totalAssignments ?? 0} Total`, icon: <ClipboardList className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50', path: '/teacher/assignments' },
    { title: 'Instructor Rating', value: dashData?.averageRating ?? '0.0', icon: <Star className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50', path: '/teacher/feedback' },
  ];

  const recentSubmissions = dashData?.recentSubmissions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0] || 'Teacher'}!</h1>
          <p className="text-sm text-gray-500 mt-1">Here is your teaching activity summary.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="secondary" onClick={() => navigate('/teacher/my-courses')}>
            <Calendar className="w-4 h-4" /> My Courses
          </Button>
          <Button onClick={() => navigate('/teacher/create-course')}>
            <Play className="w-4 h-4" /> Create Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="p-6 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate(s.path)}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color} group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{s.title}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Recent Submissions</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/grade-assignments')}>View All</Button>
            </div>
            <div className="space-y-3">
              {recentSubmissions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No recent submissions.</p>
              )}
              {recentSubmissions.map((sub: any) => (
                <div key={sub._id || sub.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {/* ✅ Fix: student populated object hai, .name se charAt karo */}
                      {sub.student?.name?.charAt(0) || sub.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {sub.student?.name || sub.studentName || 'Student'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sub.quiz?.title || sub.assignmentTitle || 'Quiz'} • {sub.quiz?.course || sub.courseName || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : sub.time}
                    </span>
                    <button
                      onClick={() => navigate('/teacher/grade-assignments')}
                      className="p-2 bg-white border border-gray-200 rounded-lg hover:border-black hover:text-black text-gray-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => navigate('/teacher/create-course')}>
                <BookOpen className="w-6 h-6" /><span className="text-xs">Create Course</span>
              </Button>
              <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => navigate('/teacher/create-quiz')}>
                <ClipboardList className="w-6 h-6" /><span className="text-xs">Create Quiz</span>
              </Button>
              <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => navigate('/teacher/assignments')}>
                <Play className="w-4 h-4" /><span className="text-xs">Assignments</span>
              </Button>
              <Button variant="outline" className="flex-col h-24 gap-2" onClick={() => navigate('/teacher/feedback')}>
                <MessageSquare className="w-6 h-6" /><span className="text-xs">Feedback</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;