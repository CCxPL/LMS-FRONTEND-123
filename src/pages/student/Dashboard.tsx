import React, { useEffect, useState } from 'react';
import { BookOpen, ClipboardList, HelpCircle, Trophy, Play, Target, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getStudentDashboardApi } from '../../api/dashboardApi';

const StudentDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashData, setDashData] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getStudentDashboardApi();
        setDashData(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) return <Loader />;

  const stats = [
    { title: 'Enrolled', value: dashData?.enrolledCourses ?? '0', icon: <BookOpen className="w-5 h-5" />, path: '/student/my-courses' },
    { title: 'Assignments', value: dashData?.pendingAssignments ?? '0', icon: <ClipboardList className="w-5 h-5" />, path: '/student/assignments' },
    { title: 'Quizzes', value: dashData?.pendingQuizzes ?? '0', icon: <HelpCircle className="w-5 h-5" />, path: '/student/quizzes' },
    { title: 'Certificates', value: dashData?.certificates ?? '0', icon: <Trophy className="w-5 h-5" />, path: '/student/certificates' },
  ];

  const courses = dashData?.recentCourses ?? [];
  const deadlines = dashData?.upcomingDeadlines ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-black text-white rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-gray-400">Keep up the great work!</p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Avg Score</p>
                  <p className="font-bold">{dashData?.averageScore ?? 0}%</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={() => navigate('/student/my-courses')}>
            <Play className="w-4 h-4" /> Continue Learning
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card
            key={i}
            hover
            onClick={() => navigate(s.path)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
                {s.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.title}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Continue Learning</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/student/my-courses')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {courses.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No courses yet. Browse and enroll!
                </p>
              )}
              {courses.map((c: any) => (
                <div
                  key={c._id || c.id}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/student/course/${c._id || c.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{c.title}</p>
                      <p className="text-sm text-gray-500">
                        by {c.teacher?.name || c.instructor?.name || 'Unknown'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/course/${c._id || c.id}`);
                      }}
                    >
                      <Play className="w-3 h-3" /> Resume
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${c.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{c.progress ?? 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Next: {c.nextLesson || 'Continue'}</span>
                    <span>
                      Last: {c.lastAccessed
                        ? new Date(c.lastAccessed).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deadlines */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Upcoming Deadlines</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {deadlines.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">
                  No upcoming deadlines!
                </p>
              )}
              {deadlines.map((d: any) => (
                <div
                  key={d._id || d.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${d.urgent ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  onClick={() =>
                    navigate(d.type === 'quiz' ? '/student/quizzes' : '/student/assignments')
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 capitalize">
                      {d.type}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${d.urgent ? 'font-bold text-gray-900' : 'text-gray-500'
                      }`}>
                      <Clock className="w-3 h-3" /> {d.due || d.dueDate}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{d.title}</p>
                  <p className="text-xs text-gray-500">{d.course || d.courseName}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/student/browse-courses')}
              >
                Browse Courses
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/student/messages')}
              >
                Messages
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/student/notifications')}
              >
                Notifications
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;