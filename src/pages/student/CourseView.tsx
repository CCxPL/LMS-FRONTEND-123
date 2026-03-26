import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Play, FileText, Menu, X, ChevronRight } from 'lucide-react';
import VideoPlayer from '../../components/ui/VideoPlayer';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import DiscussionBoard from '../../components/ui/DiscussionBoard';
import Leaderboard from '../../components/ui/Leaderboard';
import { getCourseByIdApi } from '../../api/courseApi';
import { markLectureCompleteApi } from '../../api/studentApi';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text';
  duration: string;
  completed: boolean;
  src?: string;
  content?: string;
}

const CourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'discuss' | 'leaderboard'>('content');
  const [courseTitle, setCourseTitle] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      const courseRes = await getCourseByIdApi(id);
      const { course, videos } = courseRes.data;

      setCourseTitle(course.title);

      // ✅ Fix: Backend videos flat array return karta hai — modules nahi
      const allLessons: Lesson[] = (videos || []).map((v: any) => ({
        id: v._id || v.id,
        title: v.title,
        type: 'video' as const,
        duration: v.duration || '0:00',
        completed: false,
        src: v.videoUrl || v.src,
        content: v.description,
      }));

      setLessons(allLessons);
      if (allLessons.length > 0) {
        setActiveLessonId(allLessons[0].id);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
      showToast('Failed to load course content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const currentLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const completedCount = lessons.filter(l => l.completed).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  const markComplete = async (lessonId: string) => {
    if (!id) return;
    try {
      await markLectureCompleteApi({ videoId: lessonId, courseId: id });
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, completed: true } : l));
      const currentIndex = lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < lessons.length - 1) {
        showToast('Lesson completed! Moving to next...', 'success');
        setTimeout(() => setActiveLessonId(lessons[currentIndex + 1].id), 1000);
      } else {
        showToast('Course Completed! 🎉', 'success');
      }
    } catch (error) {
      showToast('Failed to mark lesson complete', 'error');
    }
  };

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 truncate">{courseTitle}</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
            <span>{progress}% Completed</span>
            <span>{completedCount}/{lessons.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => { setActiveLessonId(l.id); setActiveTab('content'); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${activeLessonId === l.id
                ? 'bg-black text-white'
                : 'hover:bg-gray-100 text-gray-700'
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === tab.id
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
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

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {activeTab === 'content' && currentLesson && (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentLesson.title}</h1>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {currentLesson.type === 'video' ? (
                    <div className="aspect-video bg-black">
                      <VideoPlayer src={currentLesson.src} title={currentLesson.title} />
                    </div>
                  ) : (
                    <div className="p-8 md:p-12 min-h-[400px]">
                      <div className="flex items-center gap-3 text-gray-500 mb-6 pb-6 border-b border-gray-100">
                        <FileText className="w-6 h-6" />
                        <span>Reading Material • {currentLesson.duration} read</span>
                      </div>
                      <h3 className="text-xl font-bold mb-4">Lesson Content</h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {currentLesson.content || 'Content not available.'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-6">
                  <Button
                    variant="outline"
                    disabled={activeLessonId === lessons[0]?.id}
                    onClick={() => {
                      const idx = lessons.findIndex(l => l.id === activeLessonId);
                      if (idx > 0) setActiveLessonId(lessons[idx - 1].id);
                    }}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>

                  <Button
                    disabled={activeLessonId === lessons[lessons.length - 1]?.id}
                    onClick={() => {
                      const idx = lessons.findIndex(l => l.id === activeLessonId);
                      if (idx < lessons.length - 1) setActiveLessonId(lessons[idx + 1].id);
                    }}
                    icon={<ChevronRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Next Lesson
                  </Button>
                </div>
              </>
            )}

            {activeTab === 'discuss' && (
              <div className="max-w-3xl mx-auto">
                <DiscussionBoard courseId={id || ''} />
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="max-w-2xl mx-auto">
                <Leaderboard courseId={id || ''} />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseView;