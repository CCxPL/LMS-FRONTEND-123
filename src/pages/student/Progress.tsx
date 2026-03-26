import React, { useEffect, useState } from 'react';
import { GraduationCap, TrendingUp, BarChart3, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import { getStudentDashboardApi } from '../../api/dashboardApi';
import { getMyEnrolledCoursesApi, getCourseProgressApi } from '../../api/studentApi';
import { getStudentAssignmentsApi } from '../../api/assignmentApi';
import { getPerformanceApi } from '../../api/performanceApi';

const Progress: React.FC = () => {
  const [overallStats, setOverallStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    averageScore: 0,
  });

  const [courseProgress, setCourseProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [dashRes, coursesRes, assignmentsRes, performanceRes] = await Promise.all([
        getStudentDashboardApi(),
        getMyEnrolledCoursesApi(),
        getStudentAssignmentsApi(),
        getPerformanceApi(),
      ]);

      const dash = dashRes.data;
      const assignments: any[] = assignmentsRes.data?.assignments ?? [];
      const completedAssignments = assignments.filter(
        (a: any) => a.status === 'graded' || a.status === 'submitted'
      ).length;

      const courses: any[] = coursesRes.data?.courses ?? [];

      setOverallStats(prev => ({
        ...prev,
        totalCourses: dash.enrolledCourses ?? 0,
        completedCourses: courses.filter((c: any) => (c.progress || 0) === 100).length,
        inProgressCourses: courses.filter((c: any) => (c.progress || 0) > 0 && (c.progress || 0) < 100).length, // ✅ ADD
        totalAssignments: assignments.length,
        completedAssignments,
        averageScore: Math.round(dash.averageScore ?? 0),
      }));

      const performanceAttempts: any[] = performanceRes.data?.attempts ?? [];

      const progressResults = await Promise.allSettled(
        courses.map((c: any) => getCourseProgressApi(c._id))
      );

      const mapped = courses.map((course: any, idx: number) => {
        const progressData =
          progressResults[idx].status === 'fulfilled'
            ? (progressResults[idx] as PromiseFulfilledResult<any>).value.data?.progress
            : null;

        // progressData array hai — pehla item lo
        const totalVideos = progressData?.videos?.total ?? course.totalVideos ?? 0;
        const completedVideos = progressData?.videos?.completed ?? 0;
        const overallPercent = progressData?.overall ?? 0;

        const courseAttempts = performanceAttempts.filter(
          (a: any) => a.quiz?.course?.toString() === course._id?.toString()
        );
        const quizAvg =
          courseAttempts.length > 0
            ? Math.round(
              courseAttempts.reduce((sum: number, a: any) => sum + (a.percentage ?? 0), 0) /
              courseAttempts.length
            )
            : 0;

        return {
          name: course.title,
          progress: overallPercent,
          lessonsCompleted: completedVideos,
          totalLessons: totalVideos,
          quizScore: quizAvg,
        };
      });

      setCourseProgress(mapped);
    } catch (err) {
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-500 text-sm mt-1">Track your learning journey</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Courses Completed', value: `${overallStats.completedCourses}/${overallStats.totalCourses}`, icon: <CheckCircle className="w-6 h-6" /> },
          { label: 'Assignments Done', value: `${overallStats.completedAssignments}/${overallStats.totalAssignments}`, icon: <BarChart3 className="w-6 h-6" /> },
          { label: 'Average Score', value: `${overallStats.averageScore}%`, icon: <TrendingUp className="w-6 h-6" /> },
        ].map((stat, idx) => (
          <Card key={idx} hover>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-100 text-gray-700">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Course-wise Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" /> Course Progress
            </h3>
            {courseProgress.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No courses enrolled yet.</p>
            ) : (
              <div className="space-y-8">
                {courseProgress.map((course, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{course.name}</h4>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{course.progress}%</span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-black transition-all duration-1000"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Lessons</p>
                        <p className="font-bold text-gray-900">{course.lessonsCompleted}/{course.totalLessons}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Quiz Avg</p>
                        <p className="font-bold text-gray-900">{course.quizScore > 0 ? `${course.quizScore}%` : 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-bold text-gray-900">{course.progress === 100 ? 'Done' : 'Active'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;