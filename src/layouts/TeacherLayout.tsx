import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  ClipboardList,
  CheckSquare,
  HelpCircle,
  FilePlus,
  Users,
  MessageSquare,
  Star,
  Bell,
  ListTodo,
  Calendar,
  FileText,
  Umbrella,
  Award, // ✅ Certificate icon
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Courses', path: '/teacher/my-courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Create Course', path: '/teacher/create-course', icon: <PlusCircle className="w-5 h-5" /> },
  { label: 'Assignments', path: '/teacher/assignments', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Schedule', path: '/teacher/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Grade Work', path: '/teacher/grade-assignments', icon: <CheckSquare className="w-5 h-5" /> },
  { label: 'Quizzes', path: '/teacher/quizzes', icon: <HelpCircle className="w-5 h-5" /> },
  { label: 'Tasks', path: '/teacher/tasks', icon: <ListTodo className="w-5 h-5" /> },
  { label: 'Create Quiz', path: '/teacher/create-quiz', icon: <FilePlus className="w-5 h-5" /> },
  { label: 'My Students', path: '/teacher/my-students', icon: <Users className="w-5 h-5" /> },
  { label: 'Attendance Report', path: '/teacher/attendance-report', icon: <FileText className="w-5 h-5" /> },
  { label: 'Student Leaves', path: '/teacher/leaves', icon: <Umbrella className="w-5 h-5" /> },
  { label: 'Certificate Approvals', path: '/teacher/certificate-approvals', icon: <Award className="w-5 h-5" /> }, // ✅ NEW
  { label: 'Messages', path: '/teacher/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Feedback', path: '/teacher/feedback', icon: <Star className="w-5 h-5" /> },
  { label: 'Notifications', path: '/teacher/notifications', icon: <Bell className="w-5 h-5" /> },
];

const TeacherLayout: React.FC = () => {
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

export default TeacherLayout;