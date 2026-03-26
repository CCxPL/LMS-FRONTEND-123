import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getTeacherCoursesApi } from '../../api/teacherApi';
import { getMyEnrolledCoursesApi } from '../../api/studentApi';
import { getAllCoursesApi } from '../../api/courseApi';

interface Course {
  id: string;
  name: string;
}

interface CourseFilterProps {
  selectedCourseId: string;
  onCourseChange: (courseId: string) => void;
  showAllOption?: boolean;
}

const CourseFilter: React.FC<CourseFilterProps> = ({
  selectedCourseId,
  onCourseChange,
  showAllOption = true,
}) => {
  const { user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user || !user.role) return;

      console.log('USER ROLE:', user.role); // ← YE ADD KARO
      console.log('ROLE LOWERCASE:', user.role?.toLowerCase());
      try {
        let courses: Course[] = [];

        // ✅ FIX: Case-insensitive role check
        const role = user.role?.toLowerCase();

        if (role === 'super-admin' || role === 'admin') {
          const res = await getAllCoursesApi();
          courses = res.data.courses.map((c: any) => ({
            id: c._id,
            name: c.title,
          }));
        } else if (role === 'teacher') {
          const res = await getTeacherCoursesApi();
          courses = res.data.courses.map((c: any) => ({
            id: c._id,
            name: c.title,
          }));
        } else if (role === 'student') {
          const res = await getMyEnrolledCoursesApi();
          courses = res.data.courses.map((c: any) => ({
            id: c._id,
            name: c.title,
          }));
        }

        setAvailableCourses(courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, [user?.role]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-gray-600">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filter by Course:</span>
      </div>

      <select
        value={selectedCourseId}
        onChange={(e) => onCourseChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent"
      >
        {showAllOption && (
          <option value="">All Courses</option>
        )}
        {availableCourses.map(course => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseFilter;