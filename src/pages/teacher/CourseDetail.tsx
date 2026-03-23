import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users, Star,
  Play, FileText, Edit, Trash2, Eye, Plus,
  CheckCircle, Upload, Calendar, Clock, Video, FileDown, XCircle, UploadCloud
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { courseService } from '../../services/courseService';
import { useToast } from '../../context/ToastContext';
import type { Course, CourseModule, Lesson } from '../../types/course.types';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'upload' | 'students' | 'analytics'>('overview');
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLesson, setDeleteLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);

  // Add Module State
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // ✅ EDIT LESSON STATE (Added correctly)
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson } | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDuration, setEditLessonDuration] = useState('');
  const [editLessonContent, setEditLessonContent] = useState('');

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // UPLOAD & SCHEDULE STATE
  const [uploadModuleId, setUploadModuleId] = useState('');
  const [uploadType, setUploadType] = useState<'video' | 'text'>('video');
  const [uploadTitle, setUploadTitle] = useState('');
  
  // Advanced Upload States
  const [notesInputType, setNotesInputType] = useState<'type' | 'pdf'>('type');
  const [uploadContentText, setUploadContentText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  // MOCK ENROLLED STUDENTS
  const mockStudents = [
    { id: 's1', name: 'Aakash Verma', email: 'aakash@example.com', progress: 75, date: '12 Nov 2024' },
    { id: 's2', name: 'Rahul Singh', email: 'rahul@example.com', progress: 100, date: '15 Nov 2024' },
    { id: 's3', name: 'Neha Sharma', email: 'neha@example.com', progress: 30, date: '01 Dec 2024' },
  ];

  useEffect(() => {
    loadCourse();
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
        if (data.modules && data.modules.length > 0) {
          setUploadModuleId(data.modules[0].id);
        }
      }
    } catch (error) {
      showToast('Failed to load course', 'error');
    }
    setIsLoading(false);
  };

  const avgRating = course?.rating?.toString() || '0.0';

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      showToast('Title cannot be empty', 'error');
      return;
    }
    if (course) {
      const updated = { ...course, title: editTitle, description: editDesc, price: parseFloat(editPrice) || 0 };
      await courseService.updateCourse(course.id, updated);
      setCourse(updated);
    }
    setShowEditModal(false);
    showToast('Course updated successfully!', 'success');
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !course) {
      showToast('Module title cannot be empty', 'error');
      return;
    }

    const newModule: CourseModule = {
      id: `mod-${Date.now()}`,
      title: newModuleTitle,
      lessons: [],
      order: (course.modules?.length || 0) + 1
    };

    const updatedModules = [...(course.modules || []), newModule];
    const updatedCourse = { ...course, modules: updatedModules };

    await courseService.updateCourse(course.id, updatedCourse);
    setCourse(updatedCourse);
    
    setUploadModuleId(newModule.id); 
    setShowAddModuleModal(false);
    setNewModuleTitle('');
    showToast('New module created successfully!', 'success');
  };

  const handleDeleteLesson = async () => {
    if (!deleteLesson || !course) return;
    const updatedModules = course.modules?.map((m: CourseModule) =>
      m.id === deleteLesson.moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== deleteLesson.lessonId) } : m
    );
    const updatedCourse = { ...course, modules: updatedModules };
    
    await courseService.updateCourse(course.id, updatedCourse);
    setCourse(updatedCourse);
    showToast('Lesson deleted', 'info');
    setDeleteLesson(null);
  };

  // ✅ EDIT LESSON LOGIC
  const openEditLessonModal = (moduleId: string, lesson: Lesson) => {
    setEditingLesson({ moduleId, lesson });
    setEditLessonTitle(lesson.title);
    setEditLessonDuration(lesson.duration || '');
    setEditLessonContent(lesson.content || '');
  };

  const handleSaveLessonEdit = async () => {
    if (!editLessonTitle.trim() || !course || !editingLesson) return;
    
    const updatedModules = course.modules?.map((m: CourseModule) => {
      if (m.id === editingLesson.moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l => 
            l.id === editingLesson.lesson.id 
              ? { ...l, title: editLessonTitle, duration: editLessonDuration, content: editLessonContent } 
              : l
          )
        };
      }
      return m;
    });

    const updatedCourse = { ...course, modules: updatedModules };
    await courseService.updateCourse(course.id, updatedCourse);
    setCourse(updatedCourse);
    showToast('Lesson updated successfully!', 'success');
    setEditingLesson(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadType === 'video' && !file.type.startsWith('video/')) {
      showToast('Please select a valid video file (MP4/WebM)', 'error');
      return;
    }
    if (uploadType === 'text' && notesInputType === 'pdf' && file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file', 'error');
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        showToast('File uploaded successfully!', 'success');
      }
    }, 200);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadContent = async () => {
    if (!uploadTitle.trim() || !course || !uploadModuleId) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (isUploading) {
      showToast('Please wait for the file to finish uploading', 'warning');
      return;
    }
    if (uploadType === 'video' && !selectedFile) {
      showToast('Please select a video file', 'error');
      return;
    }
    if (uploadType === 'text' && notesInputType === 'pdf' && !selectedFile) {
      showToast('Please upload a PDF file', 'error');
      return;
    }
    if (uploadType === 'text' && notesInputType === 'type' && !uploadContentText.trim()) {
      showToast('Please write some notes', 'error');
      return;
    }

    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: uploadTitle + (isScheduled ? ` (Scheduled: ${new Date(scheduleDate).toLocaleString()})` : ''),
      type: uploadType,
      duration: uploadType === 'video' ? '15:00' : '5 mins read',
      content: uploadType === 'text' && notesInputType === 'type' ? uploadContentText : (uploadType === 'text' && notesInputType === 'pdf' ? `[PDF Attached: ${selectedFile?.name}]` : undefined),
      videoUrl: uploadType === 'video' && selectedFile ? URL.createObjectURL(selectedFile) : undefined,
    };

    const updatedModules = course.modules?.map((m: CourseModule) =>
      m.id === uploadModuleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
    );
    
    const updatedCourse = { ...course, modules: updatedModules };

    await courseService.updateCourse(course.id, updatedCourse);
    setCourse(updatedCourse);
    
    showToast(isScheduled ? `Scheduled for ${new Date(scheduleDate).toLocaleString()}` : 'Content Published Successfully', 'success');
    
    setUploadTitle('');
    setUploadContentText('');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsScheduled(false);
    setScheduleDate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    if (window.confirm("Content uploaded! Do you want to view the course as a student?")) {
      navigate(`/student/course/${course.id}`);
    } else {
      setActiveTab('content');
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    const newStatus = (course.status === 'published' ? 'draft' : 'published') as Course['status'];
    const updated: Course = { ...course, status: newStatus };
    await courseService.updateCourse(course.id, updated);
    setCourse(updated);
    showToast(`Course ${newStatus === 'published' ? 'published' : 'unpublished'}`, 'success');
  };

  if (isLoading) return <Loader text="Loading course..." />;
  if (!course) return <div className="text-center py-20"><p>Course not found</p></div>;

  const totalLessons = course.modules?.reduce((sum: number, m: CourseModule) => sum + (m.lessons?.length || 0), 0) || 0;

  const allVideos: { moduleName: string; lesson: Lesson; moduleId: string }[] = [];
  const allNotes: { moduleName: string; lesson: Lesson; moduleId: string }[] = [];

  course.modules?.forEach(m => {
    m.lessons.forEach(l => {
      if (l.type === 'video') allVideos.push({ moduleName: m.title, lesson: l, moduleId: m.id });
      else allNotes.push({ moduleName: m.title, lesson: l, moduleId: m.id });
    });
  });

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
              <span className={`text-xs font-medium px-2 py-1 rounded ${course.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {course.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => navigate(`/student/course/${course.id}`)}>
            <Eye className="w-4 h-4 mr-2" /> View as Student
          </Button>
          <Button variant="outline" onClick={() => setShowEditModal(true)}><Edit className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={handleTogglePublish}>{course.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
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
      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}>Overview</button>
        <button onClick={() => setActiveTab('content')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}>Content List</button>
        <button onClick={() => setActiveTab('upload')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-blue-500 hover:text-blue-700'}`}>
          <UploadCloud className="w-4 h-4"/> Upload Content
        </button>
        <button onClick={() => setActiveTab('students')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'students' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}>Enrolled Students</button>
      </div>

      {/* OVERVIEW TAB */}
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
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" fullWidth className="justify-start" onClick={() => setActiveTab('upload')}>
                  <Upload className="w-4 h-4" /> Upload New Content
                </Button>
                <Button variant="outline" fullWidth className="justify-start" onClick={() => navigate(`/student/course/${course.id}`)}>
                  <Eye className="w-4 h-4" /> View as Student
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ✅ CONTENT LIST TAB WITH EDIT BUTTON */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddModuleModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add New Module
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-blue-500">
              <div className="flex items-center gap-2 mb-4"><Video className="w-5 h-5 text-blue-500" /><h3 className="font-bold text-lg">Video Lectures</h3></div>
              <div className="space-y-3">
                {allVideos.length > 0 ? allVideos.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between group">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.lesson.title}</p>
                      <p className="text-xs text-gray-500">Module: {item.moduleName}</p>
                    </div>
                    {/* EDIT & DELETE BUTTONS */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditLessonModal(item.moduleId, item.lesson)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded shadow-sm border"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteLesson({ moduleId: item.moduleId, lessonId: item.lesson.id })} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded shadow-sm border"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-500 text-center py-4">No videos uploaded yet.</p>}
              </div>
            </Card>

            <Card className="border-t-4 border-t-green-500">
              <div className="flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-green-500" /><h3 className="font-bold text-lg">Class Notes & PDFs</h3></div>
              <div className="space-y-3">
                {allNotes.length > 0 ? allNotes.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between group">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.lesson.title}</p>
                      <p className="text-xs text-gray-500">Module: {item.moduleName}</p>
                    </div>
                    {/* EDIT & DELETE BUTTONS */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditLessonModal(item.moduleId, item.lesson)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded shadow-sm border"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteLesson({ moduleId: item.moduleId, lessonId: item.lesson.id })} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded shadow-sm border"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )) : <p className="text-sm text-gray-500 text-center py-4">No notes uploaded yet.</p>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* UPLOAD CONTENT TAB */}
      {activeTab === 'upload' && (
        <Card className="max-w-3xl mx-auto shadow-lg border border-gray-200">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><UploadCloud className="w-6 h-6 text-blue-600" /> Upload New Content</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Module</label>
              <div className="flex gap-2">
                <select 
                  value={uploadModuleId}
                  onChange={(e) => setUploadModuleId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="" disabled>Select a module</option>
                  {course.modules?.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
                <Button variant="outline" onClick={() => setShowAddModuleModal(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${uploadType === 'video' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>
                  <input type="radio" checked={uploadType === 'video'} onChange={() => {setUploadType('video'); setSelectedFile(null);}} className="hidden" />
                  <Video className="w-5 h-5" /> Video Lecture
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${uploadType === 'text' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>
                  <input type="radio" checked={uploadType === 'text'} onChange={() => {setUploadType('text'); setSelectedFile(null);}} className="hidden" />
                  <FileText className="w-5 h-5" /> Class Notes
                </label>
              </div>
            </div>

            <Input label="Content Title" placeholder="e.g. React Hooks Explained" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />

            {uploadType === 'video' ? (
              <div>
                <input type="file" accept="video/mp4,video/webm" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                {!selectedFile ? (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-10 text-center bg-gray-50 cursor-pointer transition-colors">
                    <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700">Click to browse or drag video here</p>
                    <p className="text-xs text-gray-500 mt-1">Supports MP4, WebM (Max 500MB)</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white relative">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Video className="w-5 h-5 text-blue-600"/></div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 truncate max-w-[200px] sm:max-w-sm">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      {!isUploading && <button onClick={removeFile} className="text-gray-400 hover:text-red-500"><XCircle className="w-5 h-5"/></button>}
                    </div>
                    {isUploading ? (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-green-600 flex items-center gap-1 mt-2"><CheckCircle className="w-3 h-3"/> Upload Complete</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button onClick={() => setNotesInputType('type')} className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${notesInputType === 'type' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Type Notes</button>
                  <button onClick={() => setNotesInputType('pdf')} className={`flex-1 text-sm py-2 rounded-md font-medium transition-all ${notesInputType === 'pdf' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Upload PDF</button>
                </div>

                {notesInputType === 'type' ? (
                  <textarea className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-[150px]" placeholder="Type your notes here..." value={uploadContentText} onChange={(e) => setUploadContentText(e.target.value)} />
                ) : (
                  <div>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    {!selectedFile ? (
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 hover:border-green-500 rounded-lg p-10 text-center bg-gray-50 cursor-pointer transition-colors">
                        <FileDown className="w-10 h-10 text-green-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-700">Click to upload PDF Document</p>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-4 bg-white relative">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-red-600"/></div>
                            <div><p className="font-semibold text-sm truncate max-w-sm">{selectedFile.name}</p></div>
                          </div>
                          {!isUploading && <button onClick={removeFile} className="text-gray-400 hover:text-red-500"><XCircle className="w-5 h-5"/></button>}
                        </div>
                        {isUploading && <div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div></div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SCHEDULE SECTION */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input type="checkbox" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm font-bold text-blue-900 flex items-center gap-1"><Calendar className="w-4 h-4" /> Schedule Content Publish</span>
              </label>
              {isScheduled && (
                <div className="pl-6 mt-2">
                  <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto" />
                  <p className="text-xs text-blue-700 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Content hidden until this time.</p>
                </div>
              )}
            </div>

            <Button fullWidth onClick={handleUploadContent} isLoading={isUploading} disabled={isUploading} className="bg-gray-900 hover:bg-black text-lg py-3">
              {isScheduled ? 'Schedule Content' : 'Publish Content Now'}
            </Button>
          </div>
        </Card>
      )}

      {/* ENROLLED STUDENTS TAB */}
      {activeTab === 'students' && (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 bg-white border-b"><h3 className="font-bold text-lg">Enrolled Students ({mockStudents.length})</h3></div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr><th className="px-6 py-3">Student</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Enrolled On</th><th className="px-6 py-3">Progress</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">{s.name.charAt(0)}</div>{s.name}</td>
                  <td className="px-6 py-4 text-gray-500">{s.email}</td>
                  <td className="px-6 py-4 text-gray-500">{s.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]"><div className={`h-2 rounded-full ${s.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${s.progress}%` }} /></div>
                      <span className="text-xs text-gray-600">{s.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* MODALS */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course" size="lg">
        <div className="space-y-4">
          <Input label="Course Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea className="input-field min-h-[120px]" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          </div>
          <Input label="	Price ($)" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveEdit} className="flex-1">Save Changes</Button>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ✅ EDIT LESSON MODAL */}
      <Modal isOpen={!!editingLesson} onClose={() => setEditingLesson(null)} title="Edit Content" size="md">
        <div className="space-y-4">
          <Input label="Title" value={editLessonTitle} onChange={(e) => setEditLessonTitle(e.target.value)} />
          <Input label="Duration (e.g. 15:00)" value={editLessonDuration} onChange={(e) => setEditLessonDuration(e.target.value)} />
          
          {editingLesson?.lesson.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes Content</label>
              <textarea className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-[150px]" value={editLessonContent} onChange={(e) => setEditLessonContent(e.target.value)} />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveLessonEdit} className="flex-1">Save Changes</Button>
            <Button variant="secondary" onClick={() => setEditingLesson(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ADD MODULE MODAL */}
      <Modal isOpen={showAddModuleModal} onClose={() => setShowAddModuleModal(false)} title="Add New Module" size="sm">
        <div className="space-y-4">
          <Input 
            label="Module Title" 
            placeholder="e.g., Chapter 1: Introduction" 
            value={newModuleTitle} 
            onChange={(e) => setNewModuleTitle(e.target.value)} 
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddModule} className="flex-1">Create Module</Button>
            <Button variant="secondary" onClick={() => setShowAddModuleModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ✅ PROPER DELETE CONFIRMATION DIALOG */}
            {/* ✅ PROPER CONFIRM CONFIRMATION DIALOG */}
      <ConfirmDialog 
        isOpen={!!deleteLesson} 
        onClose={() => setDeleteLesson(null)} 
        onConfirm={handleDeleteLesson} 
        title="Delete Content?" 
        message="Are you sure you want to permanently delete this content? This action cannot be undone." 
        confirmText="Yes, Delete" 
        type="danger"
      />
    </div>
  );
};

export default CourseDetail;