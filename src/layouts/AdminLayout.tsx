import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  MessageSquare,
  ClipboardList,
  Bell,
  Calendar,
  FileText,
  Award, // ✅ Certificate icon
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Teachers', path: '/admin/manage-teachers', icon: <Users className="w-5 h-5" /> },
  { label: 'Courses', path: '/admin/manage-courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Schedule', path: '/admin/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Students', path: '/admin/manage-students', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Attendance Report', path: '/admin/attendance-report', icon: <FileText className="w-5 h-5" /> },
  { label: 'Certificate Management', path: '/admin/certificate-management', icon: <Award className="w-5 h-5" /> }, // ✅ NEW
  { label: 'Messages', path: '/admin/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Tasks', path: '/admin/tasks', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'Activity', path: '/admin/activity', icon: <Activity className="w-5 h-5" /> },
];

const AdminLayout: React.FC = () => {
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

export default AdminLayout;