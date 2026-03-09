import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  ClipboardList, 
  HelpCircle, 
  BarChart3, 
  MessageSquare, 
  Star, 
  Award, 
  Bell,
  Trophy,       // Leaderboard Icon
  Users,         // Discussion Icon
  Calendar
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Courses', path: '/student/my-courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Browse', path: '/student/browse-courses', icon: <Library className="w-5 h-5" /> },
  { label: 'Schedule', path: '/student/schedule', icon: <Calendar className="w-5 h-5" /> }, 
  
  // ✅ New Items Added
  { label: 'Leaderboard', path: '/student/leaderboard', icon: <Trophy className="w-5 h-5" /> },
  { label: 'Discussion', path: '/student/discussion', icon: <Users className="w-5 h-5" /> },

  { label: 'Assignments', path: '/student/assignments', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Quizzes', path: '/student/quizzes', icon: <HelpCircle className="w-5 h-5" /> },
  { label: 'Messages', path: '/student/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Feedback', path: '/student/feedback', icon: <Star className="w-5 h-5" /> },
  { label: 'Certificates', path: '/student/certificates', icon: <Award className="w-5 h-5" /> },
  { label: 'Notifications', path: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'Progress', path: '/student/progress', icon: <BarChart3 className="w-5 h-5" /> },
];

const StudentLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        items={sidebarItems} 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <Navbar 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen} 
      />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;