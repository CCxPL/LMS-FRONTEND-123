import React from 'react';
import { Filter } from 'lucide-react';
import { mockCourses } from '../../mockData/courses';
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

  const getAvailableCourses = () => {
    if (!user) return [];

    switch (user.role) {
      case 'super-admin':
      case 'admin':
        return mockCourses;
      
      case 'teacher':
        return mockCourses.filter(c => 
          user.teachingCourseIds?.includes(c.id)
        );
      
      case 'student':
        return mockCourses.filter(c => 
          user.courseIds?.includes(c.id)
        );
      
      default:
        return [];
    }
  };

  const availableCourses = getAvailableCourses();

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