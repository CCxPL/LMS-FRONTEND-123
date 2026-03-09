import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { Calendar, FileText } from 'lucide-react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  ClipboardList, 
  Bell 
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/super-admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Admins', path: '/super-admin/manage-admins', icon: <ShieldCheck className="w-5 h-5" /> },
  { label: 'Users', path: '/super-admin/manage-users', icon: <Users className="w-5 h-5" /> },
  { label: 'Schedule', path: '/super-admin/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Teachers', path: '/super-admin/all-teachers', icon: <UserCheck className="w-5 h-5" /> },
  { label: 'Attendance Report', path: `/super-admin/attendance-report`, icon: <FileText className="w-5 h-5" /> },
  { label: 'Messages', path: '/super-admin/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Tasks', path: '/super-admin/tasks', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notifications', path: '/super-admin/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'Stats', path: '/super-admin/platform-stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Settings', path: '/super-admin/settings', icon: <Settings className="w-5 h-5" /> },
  
];

const SuperAdminLayout: React.FC = () => {
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

export default SuperAdminLayout;