import React from 'react';
import { GraduationCap, TrendingUp, BarChart3, Clock, CheckCircle, Target, Award, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';

const Progress: React.FC = () => {
  const overallStats = {
    totalCourses: 4,
    completedCourses: 1,
    inProgressCourses: 3,
    totalAssignments: 12,
    completedAssignments: 9,
    averageScore: 82,
    totalHoursLearned: 48,
  };

  const courseProgress = [
    { name: 'React.js Complete Course', progress: 68, lessonsCompleted: 8, totalLessons: 12, quizScore: 85 },
    { name: 'Python for Data Science', progress: 45, lessonsCompleted: 6, totalLessons: 15, quizScore: 78 },
    { name: 'AWS Cloud Practitioner', progress: 23, lessonsCompleted: 3, totalLessons: 14, quizScore: 90 },
  ];

  const recentAchievements = [
    { title: 'First Quiz Completed', icon: '🏆', date: '2024-03-20' },
    { title: 'Assignment Graded', icon: '⭐', date: '2024-03-18' },
    { title: 'Course Enrolled', icon: '🎯', date: '2024-02-15' },
    { title: 'Fast Learner', icon: '🚀', date: '2024-01-10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p className="text-gray-500 text-sm mt-1">Track your learning journey</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Courses Completed', value: `${overallStats.completedCourses}/${overallStats.totalCourses}`, icon: <CheckCircle className="w-6 h-6" /> },
          { label: 'Assignments Done', value: `${overallStats.completedAssignments}/${overallStats.totalAssignments}`, icon: <BarChart3 className="w-6 h-6" /> },
          { label: 'Average Score', value: `${overallStats.averageScore}%`, icon: <TrendingUp className="w-6 h-6" /> },
          { label: 'Learning Hours', value: `${overallStats.totalHoursLearned}h`, icon: <Clock className="w-6 h-6" /> },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course-wise Progress */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" /> Course Progress
            </h3>
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
                      <p className="font-bold text-gray-900">{course.quizScore}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-bold text-gray-900">{course.progress === 100 ? 'Done' : 'Active'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-gray-500" /> Achievements
            </h3>
            <div className="space-y-4">
              {recentAchievements.map((achievement, idx) => (
                <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0">
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 text-sm">{achievement.title}</h5>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" /> {achievement.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-gray-500" /> Monthly Goals
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Complete React Course', progress: 80 },
                { label: 'Submit 5 Assignments', progress: 60 },
                { label: 'Score 90% in Quizzes', progress: 40 },
              ].map((goal, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{goal.label}</span>
                    <span className="text-gray-500">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-full bg-black rounded-full" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;