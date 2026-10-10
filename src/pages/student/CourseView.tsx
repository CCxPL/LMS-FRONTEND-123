import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Circle, Play, FileText,
  Menu, X, ChevronRight, ChevronLeft, MessageSquare,
  Download, Maximize, Send, Trash2
} from 'lucide-react';
import VideoPlayer from '../../components/ui/VideoPlayer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import Card from '../../components/ui/Card';
import DiscussionBoard from '../../components/ui/DiscussionBoard';
import Leaderboard from '../../components/ui/Leaderboard';
import { getCourseByIdApi } from '../../api/courseApi';
import { markLectureCompleteApi, getCourseProgressApi } from '../../api/studentApi';
import axiosInstance from '../../api/axiosInstance';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text';
  duration: string;
  completed: boolean;
  src?: string;
  content?: string;
}

// ✅ Real discussion shape from backend
interface InlineComment {
  _id: string;
  user: string;
  userName: string;
  userRole: string;
  text: string;
  createdAt: string;
}

const CourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'discuss' | 'leaderboard'>('content');

  // ── UI state ──────────────────────────────────────────────────────────────
  const [contentType, setContentType] = useState<'select' | 'videos' | 'notes'>('select');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ✅ FIX: Real inline comments from backend
  const [inlineComments, setInlineComments] = useState<InlineComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadCourse();
  }, [id]);

  // ✅ Load inline comments when active lesson changes
  useEffect(() => {
    if (activeLessonId && id) {
      fetchInlineComments();
    }
  }, [activeLessonId, id]);

  // ─── API LOGIC ────────────────────────────────────────────────────────────
  const loadCourse = async () => {
    if (!id) return;
    try {
      const courseRes = await getCourseByIdApi(id);
      const { course, videos } = courseRes.data;
      setCourseTitle(course.title);

      // ✅ FIX: DB se completed videos fetch karo
      let completedVideoIds: string[] = [];
      try {
        await getCourseProgressApi(id);
        // Backend returns watched video ids or we match by count
        // progressRes.data.progress.videos.completed = count
        // We need to get which specific videos are completed
        // So fetch from VideoProgress via student route
        const vpRes = await axiosInstance.get(`/student/completed-videos/${id}`);
        completedVideoIds = vpRes.data?.data?.completedVideoIds || [];
      } catch {
        // If endpoint doesn't exist yet, fall back to empty
        completedVideoIds = [];
      }

      const allLessons: Lesson[] = (videos || []).map((v: any) => ({
        id: v._id || v.id,
        title: v.title,
        type: 'video' as const,
        duration: v.duration || '0:00',
        // ✅ FIX: DB se completed status
        completed: completedVideoIds.includes(v._id || v.id),
        src: v.videoUrl || v.src,
        content: v.description,
      }));

      setLessons(allLessons);
      if (allLessons.length > 0) {
        setActiveLessonId(allLessons[0].id);
      }
    } catch (error) {
      showToast('Failed to load course content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const markComplete = async (lessonId: string) => {
    if (!id) return;
    try {
      await markLectureCompleteApi({ videoId: lessonId, courseId: id });
      setLessons(prev =>
        prev.map(l => l.id === lessonId ? { ...l, completed: true } : l)
      );
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        showToast('Lesson completed! Moving to next...', 'success');
        setTimeout(() => setActiveLessonId(lessons[currentIndex + 1].id), 1000);
      } else {
        showToast('Course Completed! 🎉', 'success');
      }
    } catch {
      showToast('Failed to mark lesson complete', 'error');
    }
  };

  // ✅ FIX: Inline comments real API — topic = video ID
  const fetchInlineComments = async () => {
    if (!id || !activeLessonId) return;
    try {
      const res = await axiosInstance.get(`/discussions/${id}`, {
        params: { topic: activeLessonId },
      });
      setInlineComments(res.data?.data?.discussions || []);
    } catch {
      // silent fail
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeLessonId || !id) return;
    setPostingComment(true);
    try {
      await axiosInstance.post(`/discussions/${id}`, {
        text: newComment.trim(),
        topic: activeLessonId, // lesson ID as topic
      });
      setNewComment('');
      await fetchInlineComments();
    } catch {
      showToast('Failed to post comment', 'error');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (discussionId: string) => {
    if (!id) return;
    try {
      await axiosInstance.delete(`/discussions/${id}/${discussionId}`);
      await fetchInlineComments();
    } catch {
      showToast('Failed to delete comment', 'error');
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const currentLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const completedCount = lessons.filter(l => l.completed).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // ── Notes download helpers ────────────────────────────────────────────────
  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSingleNote = () => {
    if (!currentLesson) return;
    triggerDownload(
      `${currentLesson.title}\n\n${currentLesson.content || 'No notes available.'}`,
      `${currentLesson.title.replace(/\s+/g, '_')}_Notes.txt`
    );
    showToast('Notes downloaded!', 'success');
  };

  const downloadAllNotes = () => {
    let allContent = `${courseTitle} - Complete Notes\n=================================\n\n`;
    lessons.forEach(l => {
      allContent += `## LESSON: ${l.title}\n${l.content || 'No notes.'}\n\n`;
    });
    triggerDownload(allContent, `${courseTitle.replace(/\s+/g, '_')}_Complete_Notes.txt`);
    showToast('All course notes downloaded!', 'success');
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) return <Loader text="Loading course content..." fullScreen />;

  if (lessons.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">No content available for this course yet.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/student/my-courses')}>
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Button>
      </div>
    );
  }

  // ── Reusable inline discussion UI ─────────────────────────────────────────
  const InlineDiscussion = () => (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-700" />
        <h3 className="font-bold text-gray-900">Discussion ({inlineComments.length})</h3>
      </div>
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
        {inlineComments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            No comments yet. Start the discussion!
          </p>
        ) : (
          inlineComments.map(c => (
            <div key={c._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{c.userName}</span>
                  {c.userRole === 'Teacher' && (
                    <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded-full">Instructor</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">{formatTime(c.createdAt)}</span>
                  {c.user === user?.id && (
                    <button onClick={() => handleDeleteComment(c._id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700">{c.text}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Ask a question or share a thought..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          onKeyPress={e => e.key === 'Enter' && handleAddComment()}
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim() || postingComment}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}>

        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 truncate">{courseTitle}</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
            <span>{progress}% Completed</span>
            <span>{completedCount}/{lessons.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => { setActiveLessonId(l.id); setActiveTab('content'); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${activeLessonId === l.id ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'
                }`}
            >
              <div className="shrink-0">
                {l.completed ? (
                  <CheckCircle className={`w-5 h-5 ${activeLessonId === l.id ? 'text-white' : 'text-gray-700'}`} />
                ) : (
                  <Circle className={`w-5 h-5 ${activeLessonId === l.id ? 'text-gray-400' : 'text-gray-300'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${activeLessonId === l.id ? 'text-white' : 'text-gray-900'}`}>
                  {i + 1}. {l.title}
                </p>
                <span className={`text-xs flex items-center gap-1 mt-1 ${activeLessonId === l.id ? 'text-gray-400' : 'text-gray-500'}`}>
                  {l.type === 'video' ? <Play className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  {l.duration}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" fullWidth onClick={() => navigate('/student/my-courses')}>
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Button>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between lg:justify-end">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'content', label: 'Content' },
                { id: 'discuss', label: 'Discuss' },
                { id: 'leaderboard', label: 'Rank' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentLesson?.completed
                ? 'bg-gray-100 text-gray-700 cursor-default'
                : 'bg-black text-white hover:bg-gray-800'
                }`}
              onClick={() => currentLesson && !currentLesson.completed && markComplete(currentLesson.id)}
              disabled={currentLesson?.completed}
            >
              <CheckCircle className="w-4 h-4" />
              {currentLesson?.completed ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        </header>

        {/* Content Type Selection Modal */}
        {activeTab === 'content' && contentType === 'select' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Choose Content Type</h2>
                <p className="text-sm text-gray-500">What would you like to view?</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setContentType('videos')}
                    className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Play className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Class Videos</p>
                        <p className="text-sm text-gray-500 mt-1">Watch video lectures and lessons</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setContentType('notes')}
                    className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Class Notes</p>
                        <p className="text-sm text-gray-500 mt-1">Read detailed course notes and materials</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Videos Tab ── */}
            {activeTab === 'content' && currentLesson && contentType === 'videos' && (
              <>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setContentType('select')}>
                    Change Content Type
                  </Button>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentLesson.title}</h1>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="aspect-video bg-black">
                    <VideoPlayer src={currentLesson.src} title={currentLesson.title} />
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{currentLesson.duration} duration</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        disabled={!prevLesson}
                        onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                        icon={<ChevronLeft className="w-4 h-4" />}
                      >
                        Previous
                      </Button>
                      <Button
                        disabled={!nextLesson}
                        onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                        icon={<ChevronRight className="w-4 h-4" />}
                        iconPosition="right"
                      >
                        Next Lesson
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ✅ FIX: Real inline discussion */}
                <InlineDiscussion />
              </>
            )}

            {/* ── Notes Tab ── */}
            {activeTab === 'content' && currentLesson && contentType === 'notes' && (
              <>
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" onClick={() => setContentType('select')}>
                    Change Content Type
                  </Button>
                  <Button onClick={downloadAllNotes}>
                    <Download className="w-4 h-4 mr-2" /> Download All Course Notes
                  </Button>
                </div>

                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-bold text-gray-900">{currentLesson.title}</h2>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
                        <Maximize className="w-4 h-4 mr-2" /> Preview
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadSingleNote}>
                        <Download className="w-4 h-4 mr-2" /> Download File
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg min-h-48">
                    {currentLesson.content ? (
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{currentLesson.content}</p>
                    ) : (
                      <p className="text-gray-500 text-center py-10">No notes available.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      disabled={!prevLesson}
                      onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                      icon={<ChevronLeft className="w-4 h-4" />}
                    >
                      Previous Note
                    </Button>
                    <Button
                      disabled={!nextLesson}
                      onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                      icon={<ChevronRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      Next Note
                    </Button>
                  </div>
                </Card>

                {/* ✅ FIX: Real inline discussion */}
                <InlineDiscussion />
              </>
            )}

            {/* ── Discuss Tab ── */}
            {activeTab === 'discuss' && (
              <div className="max-w-3xl mx-auto">
                <DiscussionBoard courseId={id || ''} />
              </div>
            )}

            {/* ── Leaderboard Tab ── */}
            {activeTab === 'leaderboard' && (
              <div className="max-w-2xl mx-auto">
                <Leaderboard courseId={id || ''} />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Fullscreen Notes Preview Modal */}
      {isPreviewOpen && currentLesson && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{currentLesson.title} - Preview</h2>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-gray-100">
              <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-md min-h-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b">{currentLesson.title}</h1>
                <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
                  {currentLesson.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;