// src/pages/teacher/CourseDetail.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Users, Star,
  Play, FileText, Edit, Trash2, Eye, Plus,
  CheckCircle, Upload, Calendar, Clock, Video,
  FileDown, XCircle, UploadCloud, BarChart, Settings
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
import { uploadVideoApi, uploadImageApi } from '../../api/uploadApi';
import { createVideoApi, updateVideoApi, deleteVideoApi } from '../../api/videoApi';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'upload' | 'students' | 'analytics'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Course edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editDuration, setEditDuration] = useState('');

  // Lesson edit state
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: any } | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonDuration, setEditLessonDuration] = useState('');
  const [editLessonContent, setEditLessonContent] = useState('');

  // Delete lesson state
  const [deleteLesson, setDeleteLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);

  // Upload states
  const [uploadType, setUploadType] = useState<'video' | 'text'>('video');
  const [uploadTitle, setUploadTitle] = useState('');
  const [notesInputType, setNotesInputType] = useState<'type' | 'pdf'>('type');
  const [uploadContentText, setUploadContentText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    loadCourse();
  }, [id]);

  // ─── REAL API ─────────────────────────────────────────────────────────────
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
    if (!editTitle.trim()) { showToast('Title cannot be empty', 'error'); return; }
    setIsSaving(true);
    try {
      await updateCourseApi(id!, {
        title: editTitle,
        description: editDesc,
        price: parseFloat(editPrice) || 0,
        level: editLevel,
        duration: editDuration,
      });
      setCourse({ ...course, title: editTitle, description: editDesc, price: parseFloat(editPrice) || 0, level: editLevel, duration: editDuration });
      setShowEditModal(false);
      showToast('Course updated successfully!', 'success');
    } catch {
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

  // ✅ FIX: Real upload API — video ya PDF file upload + video record create
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
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ✅ FIX: Real upload — video file upload karo phir video record banao
  const handleUploadContent = async () => {
    if (!uploadTitle.trim()) {
      showToast('Please enter a title', 'error');
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

    setIsUploading(true);
    setUploadProgress(10);

    try {
      let fileUrl = '';

      if (selectedFile) {
        setUploadProgress(30);
        if (uploadType === 'video') {
          const uploadRes = await uploadVideoApi(selectedFile);
          fileUrl = uploadRes.data?.url || '';
        } else {
          const uploadRes = await uploadImageApi(selectedFile);
          fileUrl = uploadRes.data?.url || '';
        }
        setUploadProgress(70);
      }

      // Create video/note record in DB
      await createVideoApi({
        title: uploadTitle,
        videoUrl: fileUrl || uploadContentText,
        courseId: id!,
        description: uploadType === 'text' ? uploadContentText : '',
        order: videos.length + 1,
      });

      setUploadProgress(100);
      showToast(
        isScheduled
          ? `Scheduled for ${new Date(scheduleDate).toLocaleString()}`
          : 'Content published successfully!',
        'success'
      );

      // Reset form
      setUploadTitle('');
      setUploadContentText('');
      setSelectedFile(null);
      setUploadProgress(0);
      setIsScheduled(false);
      setScheduleDate('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActiveTab('content');

      // Reload course to show new video
      await loadCourse();
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to upload content', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ FIX: Real delete video API
  const handleDeleteLesson = async () => {
    if (!deleteLesson) return;
    try {
      await deleteVideoApi(deleteLesson.lessonId);
      showToast('Lesson deleted', 'info');
      setDeleteLesson(null);
      await loadCourse();
    } catch {
      showToast('Failed to delete lesson', 'error');
    }
  };

  const openEditLessonModal = (moduleId: string, lesson: any) => {
    setEditingLesson({ moduleId, lesson });
    setEditLessonTitle(lesson.title);
    setEditLessonDuration(lesson.duration || '');
    setEditLessonContent(lesson.content || '');
  };

  // ✅ FIX: Real update video API
  const handleSaveLessonEdit = async () => {
    if (!editLessonTitle.trim() || !editingLesson) return;
    try {
      await updateVideoApi(editingLesson.lesson.id, {
        title: editLessonTitle,
        duration: editLessonDuration,
        description: editLessonContent,
      });
      showToast('Lesson updated successfully!', 'success');
      setEditingLesson(null);
      await loadCourse();
    } catch {
      showToast('Failed to update lesson', 'error');
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

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

  const allVideos = videos.map((v: any) => ({
    moduleName: v.module || '',
    lesson: { id: v._id || v.id, title: v.title, type: 'video', duration: v.duration, content: v.description },
    moduleId: v.moduleId || '',
  }));

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
              <span className={`text-xs font-medium px-2 py-1 rounded ${course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {course.isPublished ? 'published' : 'draft'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => navigate(`/student/course/${course._id || course.id}`)}>
            <Eye className="w-4 h-4" /> View as Student
          </Button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Students', value: course.enrolledStudents?.length || students.length || 0, icon: <Users className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Videos', value: videos.length, icon: <BookOpen className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
          { label: 'Rating', value: avgRating, icon: <Star className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Quizzes', value: course.totalQuizzes || 0, icon: <Play className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
        ].map((s, i) => (
          <Card key={i} className="p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {(['overview', 'content', 'upload', 'students', 'analytics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'upload' ? '⬆ Upload Content' : tab}
          </button>
        ))}
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
                {[
                  { label: 'Category', value: course.category },
                  { label: 'Level', value: course.level },
                  { label: 'Price', value: course.price ? `$${course.price}` : 'Free' },
                  { label: 'Total Videos', value: videos.length },
                ].map((d, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{d.label}</p>
                    <p className="font-medium text-gray-900 capitalize">{d.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div>
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" fullWidth className="justify-start" onClick={() => setActiveTab('upload')}>
                  <Upload className="w-4 h-4" /> Upload New Content
                </Button>
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

      {/* CONTENT LIST TAB */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-lg">Video Lectures</h3>
              </div>
              <div className="space-y-3">
                {allVideos.length > 0 ? allVideos.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between group">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{item.lesson.title}</p>
                      <p className="text-xs text-gray-500">{item.lesson.duration || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditLessonModal(item.moduleId, item.lesson)} className="p-1.5 text-gray-400 hover:text-blue-600 bg-white rounded shadow-sm border">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteLesson({ moduleId: item.moduleId, lessonId: item.lesson.id })} className="p-1.5 text-gray-400 hover:text-red-600 bg-white rounded shadow-sm border">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-3">No videos uploaded yet.</p>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4" /> Upload Video
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-t-4 border-t-green-500">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-green-500" />
                <h3 className="font-bold text-lg">Class Notes & PDFs</h3>
              </div>
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-3">No notes uploaded yet.</p>
                <Button size="sm" variant="outline" onClick={() => { setUploadType('text'); setActiveTab('upload'); }}>
                  <FileText className="w-4 h-4" /> Upload Notes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* UPLOAD CONTENT TAB */}
      {activeTab === 'upload' && (
        <Card className="max-w-3xl mx-auto shadow-lg border border-gray-200">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-blue-600" /> Upload New Content
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${uploadType === 'video' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>
                  <input type="radio" checked={uploadType === 'video'} onChange={() => { setUploadType('video'); setSelectedFile(null); }} className="hidden" />
                  <Video className="w-5 h-5" /> Video Lecture
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${uploadType === 'text' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>
                  <input type="radio" checked={uploadType === 'text'} onChange={() => { setUploadType('text'); setSelectedFile(null); }} className="hidden" />
                  <FileText className="w-5 h-5" /> Class Notes
                </label>
              </div>
            </div>

            <Input label="Content Title *" placeholder="e.g. React Hooks Explained" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />

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
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={removeFile} className="text-gray-400 hover:text-red-500">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Ready to upload
                    </p>
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
                      <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-red-600" />
                            </div>
                            <p className="font-semibold text-sm truncate max-w-[200px]">{selectedFile.name}</p>
                          </div>
                          <button onClick={removeFile} className="text-gray-400 hover:text-red-500">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Schedule Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input type="checkbox" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm font-bold text-blue-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Schedule Content Publish
                </span>
              </label>
              {isScheduled && (
                <div className="pl-6 mt-2">
                  <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-auto" />
                  <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Content hidden until this time.
                  </p>
                </div>
              )}
            </div>

            <Button fullWidth onClick={handleUploadContent} isLoading={isUploading} disabled={isUploading} className="bg-gray-900 hover:bg-black text-lg py-3">
              {isScheduled ? 'Schedule Content' : 'Publish Content Now'}
            </Button>
          </div>
        </Card>
      )}

      {/* STUDENTS TAB */}
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

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <Card className="text-center py-12">
          <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Analytics coming soon</p>
        </Card>
      )}

      {/* Edit Course Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Course" size="lg">
        <div className="space-y-4">
          <Input label="Course Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea className="input-field min-h-[120px]" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          </div>
          <Input label="Price ($)" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          <Input label="Duration" placeholder="e.g., 24 hours" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Level</label>
            <select className="input-field" value={editLevel} onChange={(e) => setEditLevel(e.target.value)}>
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

      {/* Edit Lesson Modal */}
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

      {/* Delete Confirm */}
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