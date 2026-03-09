import React, { useEffect, useState } from 'react';
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
import { courseService } from '../../services/courseService';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import type { Course, CourseModule } from '../../types/course.types';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dataContext = useData();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'students' | 'analytics'>('overview');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLesson, setDeleteLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState('');

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'text'>('video');

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      const data = await courseService.getCourseById(id);
      if (data) {
        setCourse(data);
        setEditTitle(data.title);
        setEditDesc(data.description);
        setEditPrice(data.price?.toString() || '');
      }
    } catch (error) {
      showToast('Failed to load course', 'error');
    }
    setIsLoading(false);
  };

  // Mock feedbacks since getFeedbackForTeacher doesn't exist in context
  const feedbacks: Array<{ rating: number }> = [];
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s: number, f: { rating: number }) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : course?.rating?.toString() || '0.0';

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      showToast('Title cannot be empty', 'error');
      return;
    }
    if (course) {
      setCourse({ 
        ...course, 
        title: editTitle, 
        description: editDesc,
        price: parseFloat(editPrice) || 0
      });
    }
    setShowEditModal(false);
    showToast('Course updated successfully!', 'success');
  };

  const handleDeleteLesson = () => {
    if (!deleteLesson || !course) return;
    const updated = {
      ...course,
      modules: course.modules?.map((m: CourseModule) =>
        m.id === deleteLesson.moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== deleteLesson.lessonId) }
          : m
      ),
    };
    setCourse(updated);
    showToast('Lesson deleted', 'info');
    setDeleteLesson(null);
  };

  const handleAddLesson = () => {
    if (!newLessonTitle.trim() || !course) {
      showToast('Please enter lesson title', 'error');
      return;
    }

    const newLesson = {
      id: Date.now().toString(),
      title: newLessonTitle,
      type: newLessonType,
      duration: '10:00'
    };

    const updated = {
      ...course,
      modules: course.modules?.map((m: CourseModule) =>
        m.id === currentModuleId
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      ),
    };
    setCourse(updated);
    showToast('Lesson added', 'success');
    setShowAddLessonModal(false);
    setNewLessonTitle('');
  };

  const handleTogglePublish = () => {
    if (!course) return;
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    setCourse({ ...course, status: newStatus });
    showToast(`Course ${newStatus === 'published' ? 'published' : 'unpublished'}`, 'success');
  };

  if (isLoading) {
    return <Loader text="Loading course..." />;
  }

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

  const totalLessons = course.modules?.reduce((sum: number, m: CourseModule) => sum + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                course.status === 'published' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {course.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button variant="outline" onClick={handleTogglePublish}>
            {course.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button onClick={() => navigate('/teacher/create-quiz')}>
            <Plus className="w-4 h-4" /> Add Quiz
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students', value: course.enrolledStudents, icon: <Users className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Modules', value: course.modules?.length || 0, icon: <BookOpen className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
          { label: 'Rating', value: avgRating, icon: <Star className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Lessons', value: totalLessons, icon: <Play className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {(['overview', 'content', 'students', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${
              activeTab === tab
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
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
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{course.duration}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="font-medium text-gray-900">{course.price ? `$${course.price}` : 'Free'}</p>
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
            <h3 className="font-bold text-lg text-gray-900">Modules & Lessons</h3>
            <Button variant="secondary" size="sm" onClick={() => showToast('Add module functionality coming soon', 'info')}>
              <Plus className="w-4 h-4" /> Add Module
            </Button>
          </div>

          {!course.modules || course.modules.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No content added yet</p>
              <Button variant="outline" className="mt-4">
                <Plus className="w-4 h-4" /> Add First Module
              </Button>
            </Card>
          ) : (
            course.modules.map((mod, idx) => (
              <Card key={mod.id} padding="none" className="overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{mod.title}</p>
                      <p className="text-xs text-gray-500">{mod.lessons?.length || 0} lessons</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setCurrentModuleId(mod.id);
                      setShowAddLessonModal(true);
                    }}
                  >
                    <Plus className="w-4 h-4" /> Add Lesson
                  </Button>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {mod.lessons && mod.lessons.length > 0 ? (
                    mod.lessons.map((lesson) => (
                      <div key={lesson.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 group transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          lesson.type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                        }`}>
                          {lesson.type === 'video' ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{lesson.title}</p>
                          <p className="text-xs text-gray-400 capitalize">{lesson.type} • {lesson.duration}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteLesson({ moduleId: mod.id, lessonId: lesson.id })}
                            className="p-2 hover:bg-red-100 text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500 text-sm">
                      No lessons in this module yet
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course" size="lg">
        <div className="space-y-4">
          <Input
            label="Course Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              className="input-field min-h-[120px]"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>
          <Input
            label="Price ($)"
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveEdit} className="flex-1">Save Changes</Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={showAddLessonModal} onClose={() => setShowAddLessonModal(false)} title="Add Lesson" size="md">
        <div className="space-y-4">
          <Input
            label="Lesson Title"
            placeholder="Enter lesson title"
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${
                newLessonType === 'video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  checked={newLessonType === 'video'}
                  onChange={() => setNewLessonType('video')}
                  className="hidden"
                />
                <Play className="w-4 h-4" />
                <span>Video</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${
                newLessonType === 'text' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  checked={newLessonType === 'text'}
                  onChange={() => setNewLessonType('text')}
                  className="hidden"
                />
                <FileText className="w-4 h-4" />
                <span>Text</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleAddLesson}>Add Lesson</Button>
            <Button variant="secondary" onClick={() => setShowAddLessonModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Lesson Confirm */}
      <ConfirmDialog
        isOpen={!!deleteLesson}
        onClose={() => setDeleteLesson(null)}
        onConfirm={handleDeleteLesson}
        title="Delete Lesson?"
        message="This will permanently delete the lesson. This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default CourseDetail;