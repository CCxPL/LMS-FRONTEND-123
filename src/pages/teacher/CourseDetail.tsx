import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users, Star,
  Play, FileText, Edit, Trash2, Plus, Eye,
  CheckCircle, Settings, BarChart
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { getCourseByIdApi, updateCourseApi } from '../../api/courseApi';
import { getEnrolledStudentsApi } from '../../api/teacherApi';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'students' | 'analytics'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editDuration, setEditDuration] = useState('');

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      const res = await getCourseByIdApi(id);
      const { course, videos } = res.data;
      setCourse(course);
      setVideos(videos || []);
      setEditTitle(course.title);
      setEditDesc(course.description);
      setEditPrice(course.price?.toString() || '');
      setEditLevel(course.level || 'beginner');
      setEditDuration(course.duration || '');

      try {
        const studRes = await getEnrolledStudentsApi(id);
        setStudents(studRes.data?.students || []);
      } catch { }
    } catch (error) {
      showToast('Failed to load course', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      showToast('Title cannot be empty', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await updateCourseApi(id!, {
        title: editTitle,
        description: editDesc,
        price: parseFloat(editPrice) || 0,
        level: editLevel,      // ✅ ADD
        duration: editDuration, // ✅ ADD
      });
      setCourse({ ...course, title: editTitle, description: editDesc, price: parseFloat(editPrice) || 0, level: editLevel, duration: editDuration });
      setShowEditModal(false);
      showToast('Course updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update course', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      await updateCourseApi(id!, { isPublished: !course.isPublished });
      setCourse({ ...course, isPublished: !course.isPublished });
      showToast(`Course ${!course.isPublished ? 'published' : 'unpublished'}`, 'success');
    } catch {
      showToast('Failed to update course', 'error');
    }
  };

  if (isLoading) return <Loader text="Loading course..." />;

  if (!course) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Course not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/teacher/my-courses')}>
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  const avgRating = course.reviews?.length > 0
    ? (course.reviews.reduce((s: number, r: any) => s + r.rating, 0) / course.reviews.length).toFixed(1)
    : course.rating?.toString() || '0.0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/my-courses')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">{course.category}</span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">{course.level}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded ${course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                {course.isPublished ? 'published' : 'draft'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button variant="outline" onClick={handleTogglePublish}>
            {course.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={() => navigate('/teacher/create-quiz')}>
            <Plus className="w-4 h-4" /> Add Quiz
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students', value: course.enrolledStudents?.length || 0, icon: <Users className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Videos', value: videos.length, icon: <BookOpen className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
          { label: 'Rating', value: avgRating, icon: <Star className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Quizzes', value: course.totalQuizzes || 0, icon: <Play className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
        ].map((s, i) => (
          <Card key={i} className="p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {(['overview', 'content', 'students', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-gray-900 mb-3">About This Course</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{course.description}</p>
            </Card>
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Course Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{course.category}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Level</p>
                  <p className="font-medium text-gray-900 capitalize">{course.level}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="font-medium text-gray-900">{course.price ? `$${course.price}` : 'Free'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Videos</p>
                  <p className="font-medium text-gray-900">{videos.length}</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" fullWidth className="justify-start" onClick={() => setActiveTab('content')}>
                  <Eye className="w-4 h-4" /> Manage Content
                </Button>
                <Button variant="outline" fullWidth className="justify-start" onClick={() => navigate('/teacher/grade-assignments')}>
                  <CheckCircle className="w-4 h-4" /> Grade Assignments
                </Button>
                <Button variant="outline" fullWidth className="justify-start" onClick={() => setActiveTab('analytics')}>
                  <BarChart className="w-4 h-4" /> View Analytics
                </Button>
                <Button variant="outline" fullWidth className="justify-start" onClick={() => setShowEditModal(true)}>
                  <Settings className="w-4 h-4" /> Course Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">Videos</h3>
          </div>
          {videos.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No videos added yet</p>
            </Card>
          ) : (
            <Card padding="none">
              <div className="divide-y divide-gray-100">
                {videos.map((video: any, idx: number) => (
                  <div key={video._id || video.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                      <Play className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{video.title}</p>
                      <p className="text-xs text-gray-400">Video • {video.duration || 'N/A'}</p>
                    </div>
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-900">Enrolled Students ({students.length})</h3>
          {students.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No students enrolled yet</p>
            </Card>
          ) : (
            <Card padding="none">
              <div className="divide-y divide-gray-100">
                {students.map((s: any) => (
                  <div key={s._id || s.id} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(s.name || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{s.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{s.email || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <Card className="text-center py-12">
          <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Analytics coming soon</p>
        </Card>
      )}

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course" size="lg">
        <div className="space-y-4">
          <Input label="Course Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea className="input-field min-h-[120px]" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          </div>
          <Input label="Price ($)" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />

          <Input label="Duration" placeholder="e.g., 24 hours"
            value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
            <select className="input-field" value={editLevel}
              onChange={(e) => setEditLevel(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveEdit} className="flex-1" isLoading={isSaving}>Save Changes</Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetail;