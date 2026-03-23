import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, MessageSquare, Maximize, X, Send, Download, ChevronRight, ChevronLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import VideoPlayer from '../../components/ui/VideoPlayer';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import type { Course, Lesson } from '../../types/course.types';

// Comment Interface
interface Comment {
  id: string;
  lessonId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

const CourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentType, setContentType] = useState<'select' | 'videos' | 'notes'>('select');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  
  // Modal & Discussion States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    { id: 'c1', lessonId: 'les-1', userName: 'Aakash', text: 'This introduction was really helpful!', createdAt: new Date() }
  ]);

  // Mock progress
  const progressData: Record<string, number> = { '1': 25 };

  // MOCK COURSES DATA
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'React.js Complete Course',
      description: 'Learn React from basics to advanced',
      instructor: 'Sarah Teacher',
      instructorId: 'teacher-1',
      category: 'Web Development',
      level: 'beginner',
      status: 'published',
      price: 49.99,
      duration: '20 hours',
      enrolledStudents: 245,
      rating: 4.8,
      modules: [
        {
          id: 'mod-1',
          title: 'Getting Started',
          order: 1,
          lessons: [
            {
              id: 'les-1',
              title: 'Introduction to React',
              type: 'video',
              duration: '15:00',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
              content: 'React Introduction Notes:\n\n1. What is a component?\n2. Virtual DOM basics\n3. JSX Syntax\n\nReact is a JavaScript library for building user interfaces with reusable components.',
              order: 1,
              isCompleted: false,
            },
            {
              id: 'les-2',
              title: 'Setting up Environment',
              type: 'video',
              duration: '10:00',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
              content: 'Environment Setup:\n\n1. Install Node.js\n2. Run npx create-react-app my-app\n3. Start the server using npm start.',
              order: 2,
              isCompleted: false,
            },
          ],
        },
        {
          id: 'mod-2',
          title: 'Core Concepts',
          order: 2,
          lessons: [
            {
              id: 'les-3',
              title: 'JSX Deep Dive',
              type: 'video',
              duration: '20:00',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
              content: 'JSX Rules:\n\n1. Must return a single parent element.\n2. camelCase property naming.\n3. Close all tags.',
              order: 1,
              isCompleted: false,
            }
          ],
        },
      ],
    }
  ];

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = () => {
    setIsLoading(true);
    setTimeout(() => {
      const foundCourse = mockCourses.find(c => c.id === id) || mockCourses[0]; 
      
      if (foundCourse) {
        setCourse(foundCourse);
        if (foundCourse.modules && foundCourse.modules.length > 0) {
          const firstModule = foundCourse.modules[0];
          setSelectedModuleId(firstModule.id);
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            setSelectedLesson(firstModule.lessons[0]);
          }
        }
      } else {
        showToast('Course not found', 'error');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleSelectContent = (type: 'videos' | 'notes') => {
    setContentType(type);
  };

  const handleSelectLesson = (lesson: Lesson, moduleId: string) => {
    setSelectedLesson(lesson);
    setSelectedModuleId(moduleId);
  };

  // ✅ DISCUSSION LOGIC
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedLesson) return;
    const comment: Comment = {
      id: Date.now().toString(),
      lessonId: selectedLesson.id,
      userName: user?.name || 'Student',
      text: newComment,
      createdAt: new Date()
    };
    setComments([...comments, comment]);
    setNewComment('');
    showToast('Comment posted successfully!', 'success');
  };

  // ✅ GET COMMENTS FOR CURRENT LESSON
  const lessonComments = comments.filter(c => c.lessonId === selectedLesson?.id);

  // ✅ DOWNLOAD INDIVIDUAL NOTE
  const downloadSingleNote = () => {
    if (!selectedLesson) return;
    const content = `${selectedLesson.title}\n\n${selectedLesson.content || 'No notes available.'}`;
    triggerDownload(content, `${selectedLesson.title.replace(/\s+/g, '_')}_Notes.txt`);
    showToast('Notes downloaded!', 'success');
  };

  // ✅ DOWNLOAD ALL COURSE NOTES
  const downloadAllNotes = () => {
    if (!course) return;
    let allContent = `${course.title} - Complete Notes\n=================================\n\n`;
    
    course.modules?.forEach(mod => {
      allContent += `--- MODULE: ${mod.title} ---\n\n`;
      mod.lessons.forEach(les => {
        allContent += `## LESSON: ${les.title}\n${les.content || 'No notes.'}\n\n`;
      });
    });

    triggerDownload(allContent, `${course.title.replace(/\s+/g, '_')}_Complete_Notes.txt`);
    showToast('All course notes downloaded!', 'success');
  };

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✅ NEXT / PREVIOUS LESSON LOGIC
  const allLessonsFlat = course?.modules?.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id }))) || [];
  const currentLessonIndex = allLessonsFlat.findIndex(l => l.id === selectedLesson?.id);
  const prevLesson = currentLessonIndex > 0 ? allLessonsFlat[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessonsFlat.length - 1 ? allLessonsFlat[currentLessonIndex + 1] : null;

  const navigateToLesson = (lessonObj: Lesson & { moduleId: string }) => {
    setSelectedLesson(lessonObj);
    setSelectedModuleId(lessonObj.moduleId);
  };

  if (isLoading) return <Loader text="Loading course..." />;
  if (!course) return null;

  const progress = progressData[course.id] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/student/my-courses')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-500">by {course.instructor}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="h-3 rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      {/* Content Type Selection Modal */}
      {contentType === 'select' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Choose Content Type</h2>
              <p className="text-sm text-gray-500">What would you like to view?</p>

              <div className="space-y-3">
                <button onClick={() => handleSelectContent('videos')} className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all text-left group">
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

                <button onClick={() => handleSelectContent('notes')} className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all text-left group">
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

      {/* ✅ Videos View */}
      {contentType === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {selectedLesson ? (
              <>
                <Card className="overflow-hidden">
                  <VideoPlayer
                    src={selectedLesson.videoUrl}
                    title={selectedLesson.title}
                    poster="https://via.placeholder.com/1200x600?text=Video+Lesson"
                    onProgress={(prog: number) => console.log('Progress:', prog)}
                    onComplete={() => showToast('✓ Lesson completed!', 'success')}
                  />
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h2>
                    <p className="text-gray-600 mb-4">{selectedLesson.duration} duration</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Button variant="outline" size="sm" disabled={!prevLesson} onClick={() => prevLesson && navigateToLesson(prevLesson)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                      </Button>
                      <Button size="sm" disabled={!nextLesson} onClick={() => nextLesson && navigateToLesson(nextLesson)}>
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* ✅ FIXED DISCUSSION BOARD (Now working perfectly) */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-gray-700" />
                    <h3 className="font-bold text-gray-900">Discussion ({lessonComments.length})</h3>
                  </div>
                  
                  <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                    {lessonComments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No comments yet. Start the discussion!</p>
                    ) : (
                      lessonComments.map(c => (
                        <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-gray-900">{c.userName}</span>
                            <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
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
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or share a thought..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center"><p className="text-gray-500">Select a lesson</p></Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Button fullWidth variant="outline" onClick={() => setContentType('select')}>Change Content Type</Button>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {course.modules?.map((module) => (
                <Card key={module.id} className="overflow-hidden border border-gray-200">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-bold text-gray-900 text-sm">{module.title}</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson, module.id)}
                        className={`w-full p-3 text-left hover:bg-blue-50 transition-colors ${selectedLesson?.id === lesson.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                      >
                        <p className={`text-xs font-medium ${selectedLesson?.id === lesson.id ? 'text-blue-600' : 'text-gray-700'}`}>{lesson.title}</p>
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Notes View */}
      {contentType === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Download ALL Notes Button */}
            <div className="flex justify-end">
              <Button onClick={downloadAllNotes} className="bg-gray-900">
                <Download className="w-4 h-4 mr-2" /> Download All Course Notes
              </Button>
            </div>

            {selectedLesson ? (
              <>
                <Card className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-green-600" />
                      <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
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

                  <div className="bg-gray-50 p-6 rounded-lg min-h-[300px]">
                    {selectedLesson.content ? (
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedLesson.content}</p>
                    ) : (
                      <p className="text-gray-500 text-center py-10">No notes available.</p>
                    )}
                  </div>

                  {/* Next / Prev Navigation */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
                    <Button variant="outline" size="sm" disabled={!prevLesson} onClick={() => prevLesson && navigateToLesson(prevLesson)}>
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous Note
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={!nextLesson} onClick={() => nextLesson && navigateToLesson(nextLesson)}>
                      Next Note <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>

                {/* ✅ FIXED DISCUSSION BOARD IN NOTES TOO */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-gray-700" />
                    <h3 className="font-bold text-gray-900">Discussion ({lessonComments.length})</h3>
                  </div>
                  
                  <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                    {lessonComments.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No comments yet. Start the discussion!</p>
                    ) : (
                      lessonComments.map(c => (
                        <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-gray-900">{c.userName}</span>
                            <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
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
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ask a question or share a thought..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center"><p className="text-gray-500">Select a lesson</p></Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Button fullWidth variant="outline" onClick={() => setContentType('select')}>Change Content Type</Button>
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
              {course.modules?.map((module) => (
                <Card key={module.id} className="overflow-hidden border border-gray-200">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-bold text-gray-900 text-sm">{module.title}</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson, module.id)}
                        className={`w-full p-3 text-left hover:bg-green-50 transition-colors ${selectedLesson?.id === lesson.id ? 'bg-green-50 border-l-4 border-green-600' : 'border-l-4 border-transparent'}`}
                      >
                        <p className={`text-xs font-medium ${selectedLesson?.id === lesson.id ? 'text-green-600' : 'text-gray-700'}`}>{lesson.title}</p>
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Notes Preview Modal */}
      {isPreviewOpen && selectedLesson && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title} - Preview</h2>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-gray-100">
              <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-md min-h-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b">{selectedLesson.title}</h1>
                <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap font-serif leading-relaxed">
                  {selectedLesson.content}
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