

// ✅ PURA COMPONENT replace karo:
import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';

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
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let url = '/courses';
        if (user?.role === 'teacher') {
          url = '/courses?teacher=' + user.id;
        } else if (user?.role === 'student') {
          url = '/courses?student=' + user.id;
        }
        const res = await axiosInstance.get(url);
        const data = res.data?.data?.courses || [];
        setCourses(
          data.map((c: any) => ({
            id: c._id || c.id,
            name: c.title || c.name,
          }))
        );
      } catch {
        setCourses([]);
      }
    };
    if (user) fetchCourses();
  }, [user]);

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
        {showAllOption && <option value="">All Courses</option>}
        {courses.map(course => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseFilter;