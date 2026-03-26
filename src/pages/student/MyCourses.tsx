import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, GraduationCap, Play, Search, Filter, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import { useToast } from '../../context/ToastContext';
import { getMyEnrolledCoursesApi } from '../../api/studentApi';

const StudentMyCourses: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await getMyEnrolledCoursesApi();
      setCourses(res.data.courses || []);
    } catch (error) {
      showToast('Failed to load courses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = courses.filter(c => {
    // ✅ Fix: teacher field use karo
    const instructor = c.teacher?.name || c.instructor?.name || '';
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const progress = c.progress || 0;
    let matchesStatus = true;
    if (statusFilter === 'in-progress') matchesStatus = progress > 0 && progress < 100;
    if (statusFilter === 'completed') matchesStatus = progress === 100;
    if (statusFilter === 'not-started') matchesStatus = progress === 0;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).length,
    completed: courses.filter(c => (c.progress || 0) === 100).length,
  };

  const handleContinue = (course: any) => {
    navigate(`/student/course/${course._id || course.id}`);
    showToast(`Continuing "${course.title}"`, 'info');
  };

  if (isLoading) return <Loader text="Loading your courses..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Continue learning from where you left off</p>
        </div>
        <Button onClick={() => navigate('/student/browse-courses')}>
          Browse More Courses
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Enrolled</p>
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </Card>
        <Card className="text-center bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search your courses..."
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
              <option value="all">All Courses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 self-center">
            {filtered.length} course(s)
          </span>
        </div>
      </Card>

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm mb-4">
            {courses.length === 0 ? "You haven't enrolled in any courses yet" : "Try adjusting your filters"}
          </p>
          <Button onClick={() => navigate('/student/browse-courses')}>
            Browse Courses
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const progress = course.progress || 0;
            const isCompleted = progress === 100;
            const courseId = course._id || course.id;
            // ✅ Fix: teacher field use karo
            const instructorName = course.teacher?.name || course.instructor?.name || 'Unknown';

            return (
              <Card
                key={courseId}
                hover
                className="flex flex-col cursor-pointer group"
                onClick={() => navigate(`/student/course/${courseId}`)}
              >
                {/* Thumbnail */}
                <div className={`h-36 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden ${isCompleted ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-700 to-gray-900'
                  }`}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <GraduationCap className="w-12 h-12 text-white/50" />
                  )}
                  {isCompleted && (
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-bold text-gray-900">
                      ✓ Completed
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {course.level}
                    </span>
                    {course.rating > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-700">
                        <Star className="w-3 h-3 fill-current" /> {course.rating}
                      </span>
                    )}
                  </div>

                  {/* Title & Instructor */}
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                    {course.title}
                  </h3>
                  {/* ✅ Fix: instructorName use karo */}
                  <p className="text-sm text-gray-500 mb-3">
                    by {instructorName}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> {course.modules?.length || course.totalLectures || 0} modules
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-semibold text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-black transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    fullWidth
                    variant={isCompleted ? 'outline' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinue(course);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    {isCompleted ? 'Review Course' : 'Continue Learning'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentMyCourses;