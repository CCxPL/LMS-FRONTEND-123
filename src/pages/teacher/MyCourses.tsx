import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, Edit, Eye, Search, Filter, RefreshCw, MoreVertical, Star } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { getTeacherCoursesApi } from '../../api/teacherApi';
import { deleteCourseApi } from '../../api/courseApi';

const TeacherMyCourses: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const handleClick = () => setActiveDropdown(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const loadCourses = async () => {
    try {
      const res = await getTeacherCoursesApi({ limit: 100 });
      setCourses(res.data?.courses || []);
    } catch (error) {
      showToast('Failed to load courses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCourses();
    setIsRefreshing(false);
    showToast('Courses refreshed', 'success');
  };

  const filtered = courses.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const isPublished = c.isPublished ? 'published' : 'draft';
    const matchesStatus = statusFilter === 'all' || isPublished === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCourseApi(deleteConfirm._id || deleteConfirm.id);
      showToast(`Course "${deleteConfirm.title}" deleted`, 'info');
      setDeleteConfirm(null);
      await loadCourses();
    } catch (error) {
      showToast('Failed to delete course', 'error');
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.isPublished).length,
    draft: courses.filter(c => !c.isPublished).length,
    totalStudents: new Set(
      courses.flatMap(c => (c.enrolledStudents || []).map((s: any) => s._id || s))
    ).size,
  };

  if (isLoading) return <Loader text="Loading courses..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Manage your created courses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => navigate('/teacher/create-course')}>
            <Plus className="w-4 h-4" /> Create Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Courses</p>
        </Card>
        <Card className="text-center p-4 bg-emerald-50 border-emerald-100">
          <p className="text-2xl font-black text-emerald-600">{stats.published}</p>
          <p className="text-xs text-emerald-600">Published</p>
        </Card>
        <Card className="text-center p-4 bg-amber-50 border-amber-100">
          <p className="text-2xl font-black text-amber-600">{stats.draft}</p>
          <p className="text-xs text-amber-600">Drafts</p>
        </Card>
        <Card className="text-center p-4 bg-blue-50 border-blue-100">
          <p className="text-2xl font-black text-blue-600">{stats.totalStudents}</p>
          <p className="text-xs text-blue-600">Total Students</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search courses..."
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
              className="input-field w-auto"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 self-center">{filtered.length} course(s)</span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm mb-4">Create your first course to get started</p>
          <Button onClick={() => navigate('/teacher/create-course')}>
            <Plus className="w-4 h-4" /> Create Course
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Card key={course._id || course.id} hover className="flex flex-col h-full group">
              <div
                className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/teacher/course/${course._id || course.id}`)}
              >
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-4xl">📚</span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {course.isPublished ? 'published' : 'draft'}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                    {course.level}
                  </span>
                  {course.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="w-3 h-3 fill-current" /> {course.rating}
                    </span>
                  )}
                </div>

                <h3
                  className="font-semibold text-gray-800 text-lg mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => navigate(`/teacher/course/${course._id || course.id}`)}
                >
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {course.enrolledStudents?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {course.duration || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/teacher/course/${course._id || course.id}`)}
                >
                  <Eye className="w-4 h-4" /> View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/teacher/course/${course._id || course.id}`)}
                >
                  <Edit className="w-4 h-4" /> Edit
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === (course._id || course.id) ? null : (course._id || course.id));
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  {activeDropdown === (course._id || course.id) && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => { setDeleteConfirm(course); setActiveDropdown(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Course?"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default TeacherMyCourses;