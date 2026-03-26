import React, { useEffect, useState } from 'react';
import Leaderboard from '../../components/ui/Leaderboard';
import Card from '../../components/ui/Card';
import { getMyEnrolledCoursesApi } from '../../api/studentApi';

interface Course {
  id: string;
  name: string;
}

const LeaderboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getMyEnrolledCoursesApi();
      const raw: any[] = res.data?.courses ?? [];
      const mapped: Course[] = raw.map((c: any) => ({
        id: c._id,
        name: c.title,
      }));
      setCourses(mapped);
      if (mapped.length > 0) setSelectedCourse(mapped[0].id);
    } catch (err) {
      console.error('Courses fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Leaderboard</h1>
          <p className="page-subtitle">See where you stand among your peers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Course Selection */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Select Course</h3>
            {loading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
              </div>
            ) : courses.length === 0 ? (
              <p className="text-sm text-gray-400">No courses enrolled yet.</p>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedCourse === course.id
                        ? 'bg-black text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    {course.name}
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Leaderboard */}
        <div className="lg:col-span-2">
          {selectedCourse ? (
            <Leaderboard courseId={selectedCourse} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <p className="text-gray-400">Select a course to view leaderboard.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;