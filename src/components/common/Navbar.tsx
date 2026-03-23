import React, { useEffect, useState } from 'react';
import { Menu, Bell, Search, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const navigate = useNavigate();

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
      className={`fixed top-0 right-0 z-30 bg-white border-b border-gray-200 transition-all duration-300 h-16 flex items-center justify-between px-4 lg:px-6 ${
        isSidebarOpen ? 'lg:left-64' : 'lg:left-20'
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
        
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full max-w-md focus-within:border-black transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-gray-700 focus:outline-none w-full placeholder:text-gray-400"
          />
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