import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Clock, BookOpen, Star, CheckCircle, Video, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/common/Loader';
import EnrollForm, { type EnrollData } from '../../components/ui/EnrollForm';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services/courseService';
import type { Course } from '../../types/course.types';

const CourseEnroll: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { addNotificationItem } = useData(); // ✅ CHANGED: addNotification → addNotificationItem

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    if (!id) return;
    try {
      const data = await courseService.getCourseById(id);
      if (data) setCourse(data);
    } catch (error) {
      showToast('Failed to load course details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = (_data: EnrollData) => {
    setIsEnrolled(true);
    showToast(`✓ Successfully enrolled in ${course?.title}!`, 'success');

    if (user) {
      // ✅ CHANGED: addNotification → addNotificationItem
      addNotificationItem({
        userId: user.id,
        title: 'Enrollment Confirmed',
        message: `You are now enrolled in "${course?.title}".`,
        type: 'success',
      });
    }
  };

  const handleStartLearning = () => {
    navigate(`/student/course/${id}`);
  };

  if (isLoading) return <Loader text="Loading course details..." />;

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">Course not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Header */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {course.category}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                {course.level}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-lg text-gray-600">{course.description}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 py-4 border-y border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">
                  {course.instructor.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Instructor</p>
                  <p className="font-medium text-gray-900">{course.instructor}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-gray-700 fill-gray-700" />
                <span className="font-bold text-gray-900">{course.rating || '4.8'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="font-bold text-gray-900">{course.enrolledStudents}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="font-bold text-gray-900">{course.duration}</span>
              </div>
            </div>
          </div>

          {/* What you'll learn */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">What you'll learn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Master the core concepts',
                'Build real-world projects',
                'Understand best practices',
                'Get certified upon completion',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-gray-700 shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Course Content */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Course Content</h3>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>{course.modules?.length} sections • {totalLessons} lectures</span>
              <span>{course.duration} total</span>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
              {course.modules?.map((mod, idx) => (
                <div key={mod.id} className="bg-white">
                  <div className="px-5 py-4 bg-gray-50 flex justify-between items-center">
                    <div className="font-medium text-gray-900">
                      Section {idx + 1}: {mod.title}
                    </div>
                    <span className="text-xs text-gray-500">{mod.lessons?.length} lessons</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {mod.lessons?.map((lesson) => (
                      <div key={lesson.id} className="px-5 py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          {lesson.type === 'video' ? (
                            <Video className="w-4 h-4 text-gray-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-gray-600">{lesson.title}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Enrollment Card */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <Card className="shadow-xl overflow-hidden" padding="none">
              <div className="h-48 bg-linear-to-br from-gray-800 to-black flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white/50" />
              </div>

              <div className="p-6">
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {course.price ? `₹${course.price}` : 'Free'}
                  </span>
                  {course.price && (
                    <span className="text-lg text-gray-400 line-through mb-1">
                      ₹{(course.price * 1.5).toFixed(2)}
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg text-center font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Enrolled
                    </div>
                    <Button fullWidth onClick={handleStartLearning}>
                      Start Learning
                    </Button>
                  </div>
                ) : (
                  <EnrollForm
                    course={course}
                    onEnroll={handleEnroll}
                    isEnrolled={isEnrolled}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEnroll;