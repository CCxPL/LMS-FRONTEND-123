import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Check,
  X,
  Eye,
  BookOpen,
  Users,
  Clock,
  Download,
  RefreshCw,
  Star,
  Archive,
  Trash2,
  Filter
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { Course } from '../../types/course.types';
import { courseService } from '../../services/courseService';
import { useToast } from '../../context/ToastContext';

const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: 'approve' | 'reject' | 'archive' | 'delete';
    course?: Course;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      showToast('Failed to load courses', 'error');
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCourses();
    setIsRefreshing(false);
    showToast('Courses refreshed', 'success');
  };



  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchLevel = levelFilter === 'all' || c.level === levelFilter;
      return matchSearch && matchStatus && matchLevel;
    });
  }, [courses, searchTerm, statusFilter, levelFilter]);

  const stats = useMemo(() => ({
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    pending: courses.filter(c => c.status === 'pending').length,
    draft: courses.filter(c => c.status === 'draft').length,
  }), [courses]);

  const handleAction = (id: string, action: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;

    switch (action) {
      case 'approve':
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'published' as const } : c));
        showToast(`"${course.title}" approved!`, 'success');
        break;
      case 'reject':
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'draft' as const } : c));
        showToast(`"${course.title}" rejected.`, 'info');
        break;
      case 'archive':
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' as const } : c));
        showToast(`"${course.title}" archived.`, 'info');
        break;
      case 'delete':
        setCourses(prev => prev.filter(c => c.id !== id));
        showToast(`"${course.title}" deleted.`, 'info');
        break;
    }
    setConfirmAction(null);
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Instructor', 'Category', 'Level', 'Status', 'Students', 'Rating'].join(','),
      ...filtered.map(c => [c.title, c.instructor, c.category, c.level, c.status, c.enrolledStudents, c.rating || 'N/A'].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courses-export.csv';
    a.click();
    showToast('Courses exported', 'success');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setLevelFilter('all');
  };

  if (isLoading) return <Loader text="Loading courses..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Approve and manage platform courses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, active: statusFilter === 'all' },
          { label: 'Published', value: stats.published, active: statusFilter === 'published' },
          { label: 'Pending', value: stats.pending, active: statusFilter === 'pending' },
          { label: 'Drafts', value: stats.draft, active: statusFilter === 'draft' },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.label.toLowerCase() === 'total' ? 'all' : s.label.toLowerCase() === 'drafts' ? 'draft' : s.label.toLowerCase())}
            className={`rounded-xl p-3 text-center transition-all border-2 ${
              s.active ? 'border-black bg-gray-50' : 'border-transparent bg-gray-50 hover:border-gray-200'
            }`}
          >
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {(searchTerm || statusFilter !== 'all' || levelFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Course List */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-medium text-gray-500">No courses found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Instructor</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Students</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Level</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.category} • {course.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                          {course.instructor.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">{course.instructor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-gray-900">{course.enrolledStudents}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                        {course.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                        course.status === 'published' ? 'bg-black text-white' :
                        course.status === 'pending' ? 'bg-gray-200 text-gray-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {course.rating ? (
                        <div className="inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-gray-700 fill-gray-700" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {course.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ id: course.id, action: 'approve', course })}
                              className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ id: course.id, action: 'reject', course })}
                              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setSelectedCourse(course); setShowPreview(true); }}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ id: course.id, action: 'archive', course })}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ id: course.id, action: 'delete', course })}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => { setShowPreview(false); setSelectedCourse(null); }}
        title={selectedCourse?.title || 'Course Preview'}
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{selectedCourse.enrolledStudents}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <BookOpen className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{selectedCourse.modules?.length || 0}</p>
                <p className="text-xs text-gray-500">Modules</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{selectedCourse.duration}</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Star className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{selectedCourse.rating || 'N/A'}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{selectedCourse.description}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700">
                  {selectedCourse.instructor.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedCourse.instructor}</p>
                  <p className="text-xs text-gray-500">{selectedCourse.category} • {selectedCourse.level}</p>
                </div>
              </div>
            </div>

            {selectedCourse.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  fullWidth
                  onClick={() => {
                    setShowPreview(false);
                    setConfirmAction({ id: selectedCourse.id, action: 'approve', course: selectedCourse });
                  }}
                >
                  <Check className="w-4 h-4" /> Approve
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowPreview(false);
                    setConfirmAction({ id: selectedCourse.id, action: 'reject', course: selectedCourse });
                  }}
                >
                  <X className="w-4 h-4" /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && handleAction(confirmAction.id, confirmAction.action)}
        title={`${confirmAction?.action?.charAt(0).toUpperCase()}${confirmAction?.action?.slice(1)} Course?`}
        message={`Are you sure you want to ${confirmAction?.action} "${confirmAction?.course?.title}"?`}
        confirmText={confirmAction?.action?.charAt(0).toUpperCase() + (confirmAction?.action?.slice(1) || '')}
        type={confirmAction?.action === 'approve' ? 'info' : 'danger'}
      />
    </div>
  );
};

export default ManageCourses;