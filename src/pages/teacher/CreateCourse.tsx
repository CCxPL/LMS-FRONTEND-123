import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft, Video, FileText, Upload, GripVertical, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../utils/constants';

interface ModuleData {
  id: string;
  title: string;
  lessons: LessonData[];
}

interface LessonData {
  id: string;
  title: string;
  type: 'video' | 'text';
  duration: string;
  content?: string;
}

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [modules, setModules] = useState<ModuleData[]>([]);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'text'>('video');
  const [lessonDuration, setLessonDuration] = useState('10:00');
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: LessonData } | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: '', lessons: [] }]);
  };

  const updateModule = (id: string, value: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, title: value } : m));
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    showToast('Module removed', 'info');
  };

  const duplicateModule = (id: string) => {
    const module = modules.find(m => m.id === id);
    if (module) {
      const duplicated = {
        ...module,
        id: Date.now().toString(),
        title: `${module.title} (Copy)`,
        lessons: module.lessons.map(l => ({ ...l, id: `${l.id}-copy` }))
      };
      const index = modules.findIndex(m => m.id === id);
      const newModules = [...modules];
      newModules.splice(index + 1, 0, duplicated);
      setModules(newModules);
      showToast('Module duplicated', 'success');
    }
  };

  const openLessonModal = (moduleId: string, lesson?: LessonData) => {
    setCurrentModuleId(moduleId);
    if (lesson) {
      setEditingLesson({ moduleId, lesson });
      setLessonTitle(lesson.title);
      setLessonType(lesson.type);
      setLessonDuration(lesson.duration);
    } else {
      setEditingLesson(null);
      setLessonTitle('');
      setLessonType('video');
      setLessonDuration('10:00');
    }
    setShowLessonModal(true);
  };

  const saveLesson = () => {
    if (!lessonTitle.trim()) {
      showToast('Please enter lesson title', 'error');
      return;
    }

    if (editingLesson) {
      setModules(modules.map(m => 
        m.id === editingLesson.moduleId 
          ? {
              ...m,
              lessons: m.lessons.map(l => 
                l.id === editingLesson.lesson.id 
                  ? { ...l, title: lessonTitle, type: lessonType, duration: lessonDuration }
                  : l
              )
            }
          : m
      ));
      showToast('Lesson updated', 'success');
    } else {
      const newLesson: LessonData = {
        id: Date.now().toString(),
        title: lessonTitle,
        type: lessonType,
        duration: lessonDuration
      };
      setModules(modules.map(m => 
        m.id === currentModuleId 
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      ));
      showToast('Lesson added', 'success');
    }

    setShowLessonModal(false);
    setLessonTitle('');
    setEditingLesson(null);
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
        : m
    ));
    showToast('Lesson removed', 'info');
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnail(reader.result as string);
        showToast('Thumbnail uploaded', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!title.trim() || !description.trim() || !category) {
      showToast('Please fill all basic fields', 'error');
      return;
    }
    if (modules.length === 0) {
      showToast('Please add at least one module', 'error');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Course published successfully!', 'success');
      navigate('/teacher/my-courses');
    }, 1500);
  };

  const handleSaveDraft = () => {
    if (!title.trim()) {
      showToast('Please enter course title', 'error');
      return;
    }
    showToast('Course saved as draft', 'success');
    navigate('/teacher/my-courses');
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalVideos = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.type === 'video').length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Course</h1>
            <p className="text-sm text-gray-500">Build your curriculum</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={isSaving}>
            {isSaving ? 'Publishing...' : <><Save className="w-4 h-4" /> Publish</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input label="Course Title *" placeholder="e.g., Complete React.js Course" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea className="input-field min-h-[120px]" placeholder="Describe what students will learn..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {COURSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
                  <select className="input-field" value={level} onChange={(e) => setLevel(e.target.value)}>
                    {COURSE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price ($)" type="number" placeholder="49.99" value={price} onChange={(e) => setPrice(e.target.value)} />
                <Input label="Duration" placeholder="e.g., 24 hours" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* Curriculum */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Curriculum</h3>
              <Button variant="secondary" size="sm" onClick={addModule}>
                <Plus className="w-4 h-4" /> Add Module
              </Button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No modules yet</p>
                <Button variant="outline" onClick={addModule} className="mt-4">
                  <Plus className="w-4 h-4" /> Add First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, idx) => (
                  <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                      <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">{idx + 1}</span>
                      <input className="input-field flex-1 bg-white" placeholder="Module Title" value={module.title} onChange={(e) => updateModule(module.id, e.target.value)} />
                      <Button variant="ghost" size="sm" onClick={() => duplicateModule(module.id)}><Plus className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeModule(module.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="p-4 space-y-2">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${lesson.type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {lesson.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                            <p className="text-xs text-gray-500 capitalize">{lesson.type} • {lesson.duration}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openLessonModal(module.id, lesson)} className="p-1.5 hover:bg-gray-200 rounded-lg"><FileText className="w-4 h-4 text-gray-500" /></button>
                            <button onClick={() => removeLesson(module.id, lesson.id)} className="p-1.5 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => openLessonModal(module.id)} className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Course Thumbnail</h3>
            {thumbnail ? (
              <div className="relative">
                <img src={thumbnail} alt="Thumbnail" className="w-full h-40 object-cover rounded-lg" />
                <button onClick={() => setThumbnail(null)} className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Thumbnail</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
              </label>
            )}
          </Card>

          <Card className="sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Course Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Modules</span><span className="font-bold">{modules.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Lessons</span><span className="font-bold">{totalLessons}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Video Lessons</span><span className="font-bold">{totalVideos}</span></div>
              {price && <div className="flex justify-between text-sm pt-2 border-t"><span className="text-gray-500">Price</span><span className="font-bold text-emerald-600">${price}</span></div>}
            </div>
            <div className="mt-6 space-y-2">
              <Button fullWidth onClick={handlePublish} disabled={isSaving}><Save className="w-4 h-4" /> Publish Course</Button>
              <Button variant="outline" fullWidth onClick={handleSaveDraft}>Save as Draft</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Lesson Modal */}
      <Modal isOpen={showLessonModal} onClose={() => { setShowLessonModal(false); setEditingLesson(null); }} title={editingLesson ? 'Edit Lesson' : 'Add Lesson'} size="md">
        <div className="space-y-4">
          <Input label="Lesson Title *" placeholder="e.g., Intro to React" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${lessonType === 'video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <input type="radio" checked={lessonType === 'video'} onChange={() => setLessonType('video')} className="hidden" />
                <Video className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-600">Video</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${lessonType === 'text' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                <input type="radio" checked={lessonType === 'text'} onChange={() => setLessonType('text')} className="hidden" />
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-600">Text</span>
              </label>
            </div>
          </div>
          <Input label="Duration" placeholder="e.g., 10:00" value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} />
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={saveLesson}>{editingLesson ? 'Save Changes' : 'Add Lesson'}</Button>
            <Button variant="secondary" onClick={() => { setShowLessonModal(false); setEditingLesson(null); }}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Course Preview" size="lg">
        <div className="space-y-6">
          {thumbnail && <img src={thumbnail} alt="Course" className="w-full h-48 object-cover rounded-xl" />}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title || 'Untitled Course'}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-gray">{category || 'No Category'}</span>
              <span className="badge badge-gray capitalize">{level}</span>
              {price && <span className="badge badge-success">${price}</span>}
            </div>
          </div>
          <div><h3 className="font-bold text-gray-900 mb-2">Description</h3><p className="text-gray-600">{description || 'No description provided'}</p></div>
          <Button variant="secondary" fullWidth onClick={() => setShowPreview(false)}>Close Preview</Button>
        </div>
      </Modal>
    </div>
  );
};

export default CreateCourse;