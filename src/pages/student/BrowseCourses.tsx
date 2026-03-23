import React, { useEffect, useState } from 'react';
import { Search, Filter, Users, Clock, Star, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Loader from '../../components/common/Loader';
import type { Course } from '../../types/course.types';
import { courseService } from '../../services/courseService';
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../utils/constants';

const BrowseCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data.filter((c) => c.status === 'published'));
    } catch (error) {
      console.error('Failed to load courses', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchSearch && matchCat && matchLevel;
  });

  if (isLoading) return <Loader text="Loading courses..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Courses</h1>
        <p className="text-gray-500 text-sm mt-1">Discover and enroll in new courses</p>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">All Categories</option>
                {COURSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Levels</option>
              {COURSE_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Card 
              key={course.id} 
              hover 
              className="flex flex-col cursor-pointer group"
              onClick={() => navigate(`/student/course-enroll/${course.id}`)}
            >
              {/* Thumbnail */}
              <div className="h-40 bg-linear-to-br from-gray-700 to-gray-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <BookOpen className="w-12 h-12 text-white/50" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm">
                    View Course
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {course.level}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {course.category}
                    </span>
                  </div>
                  {course.rating && (
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                      <Star className="w-3 h-3 fill-current" /> {course.rating}
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-700 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {course.enrolledStudents}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900">
                    {course.price ? `₹${course.price}` : 'Free'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCourses;