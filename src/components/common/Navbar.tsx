import React, { useEffect, useState, useRef } from 'react';
import { Menu, Bell, Search, LogOut, Sun, Moon, Loader2, X, BookOpen, FileText, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { globalSearchApi } from '../../api/dashboardApi';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    courses: any[];
    assignments: any[];
    users: any[];
  }>({ courses: [], assignments: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ courses: [], assignments: [], users: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await globalSearchApi(searchQuery.trim());
        if (res?.data) {
          setSearchResults({
            courses: res.data.courses || [],
            assignments: res.data.assignments || [],
            users: res.data.users || [],
          });
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResultsCount =
    searchResults.courses.length + searchResults.assignments.length + searchResults.users.length;

  const handleCourseClick = (courseId: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (user?.role === 'student') {
      navigate(`/student/course/${courseId}`);
    } else if (user?.role === 'teacher') {
      navigate(`/teacher/course/${courseId}`);
    } else if (user?.role === 'admin') {
      navigate('/admin/manage-courses');
    } else {
      navigate('/super-admin/dashboard');
    }
  };

  const handleAssignmentClick = (_assignmentId: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (user?.role === 'student') {
      navigate('/student/assignments');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/assignments');
    }
  };

  const handleUserClick = (u: any) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (user?.role === 'super-admin') {
      navigate('/super-admin/manage-users');
    } else if (user?.role === 'admin') {
      if (u.role === 'teacher') navigate('/admin/manage-teachers');
      else navigate('/admin/manage-students');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/my-students');
    }
  };

  const unreadCount = user && notifications
    ? notifications.filter((n) => (n.userId === user.id || n.userId === 'all') && !n.read).length
    : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    if (!user) return;
    const basePath = user.role === 'super-admin' ? '/super-admin' :
      user.role === 'admin' ? '/admin' :
        user.role === 'teacher' ? '/teacher' : '/student';
    navigate(`${basePath}/notifications`);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 h-16 flex items-center justify-between px-4 lg:px-6 ${isSidebarOpen ? 'lg:left-64' : 'lg:left-20'
        } left-0`}
    >
      {/* Left: Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div ref={searchContainerRef} className="relative hidden md:block w-full max-w-md">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full focus-within:border-black transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
              placeholder="Search courses, assignments, users..."
              className="bg-transparent text-sm text-gray-700 focus:outline-none w-full placeholder:text-gray-400"
            />
            {isSearching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />}
            {!isSearching && searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showDropdown && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
              {totalResultsCount === 0 && !isSearching ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <>
                  {/* Courses */}
                  {searchResults.courses.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> Courses
                      </div>
                      {searchResults.courses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleCourseClick(course.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm transition-colors"
                        >
                          <span className="font-medium text-gray-800 truncate">{course.title}</span>
                          <span className="text-xs text-gray-400 ml-2 shrink-0">{course.category}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Assignments */}
                  {searchResults.assignments.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-t border-gray-100 pt-2">
                        <FileText className="w-3.5 h-3.5" /> Assignments
                      </div>
                      {searchResults.assignments.map((assignment) => (
                        <button
                          key={assignment.id}
                          type="button"
                          onClick={() => handleAssignmentClick(assignment.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm transition-colors"
                        >
                          <span className="font-medium text-gray-800 truncate">{assignment.title}</span>
                          {assignment.course?.title && (
                            <span className="text-xs text-gray-400 ml-2 shrink-0">{assignment.course.title}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Users */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-t border-gray-100 pt-2">
                        <UserIcon className="w-3.5 h-3.5" /> People
                      </div>
                      {searchResults.users.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleUserClick(u)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-medium text-gray-800 truncate">{u.name}</span>
                            <span className="text-xs text-gray-400 truncate">({u.email})</span>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize ml-2 shrink-0">
                            {u.role?.replace('-', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNotificationClick}
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role?.replace('-', ' ')}</p>
          </div>

          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;