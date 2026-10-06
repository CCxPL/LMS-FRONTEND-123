import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import type { SidebarItem } from '../../types/common.types';

interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, isOpen, onToggle }) => {
  const { user } = useAuth();
  const { theme } = useTheme();

  if (!user) return null;

  const sidebarStyle: React.CSSProperties = {
    backgroundColor: theme.sidebarBg,
    color: theme.sidebarText,
    fontFamily: `'${theme.fontFamily}', sans-serif`,
  };

  const navItemClass = (isActive: boolean) => {
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
      !isOpen ? 'lg:justify-center' : ''
    } ${
      isActive 
        ? 'sidebar-item-active' 
        : 'sidebar-item-inactive'
    }`;
  };

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    backgroundColor: isActive ? `${theme.sidebarText}22` : 'transparent',
    color: theme.sidebarText,
    opacity: isActive ? 1 : 0.75,
  });

  const hoverStyle = `
    .sidebar-item-inactive:hover {
      background-color: ${theme.sidebarText}15 !important;
      opacity: 0.9 !important;
    }
    .sidebar-item-active:hover {
      opacity: 1 !important;
    }
  `;

  return (
    <>
      <style>{hoverStyle}</style>

      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onToggle} 
      />

      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } shadow-xl`}
        style={sidebarStyle}
      >
        {/* Header - ✅ Logo without box */}
        <div 
          className="flex items-center justify-between p-4 h-16" 
          style={{ borderBottom: `1px solid ${theme.sidebarText}33` }}
        >
          <div className={`flex items-center gap-2 overflow-hidden ${!isOpen && 'lg:justify-center lg:w-full'}`}>
            {/* ✅ Direct Logo - No background box */}
            <img 
              src="/csi.png" 
              alt="CSI Logo"
              className="w-9 h-9 object-contain shrink-0"
            />
            
            {/* Text */}
            <span 
              className={`font-bold text-sm whitespace-nowrap transition-opacity duration-200 mt-3 ${
                isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
              }`} 
              style={{ color: theme.sidebarText }}
            >
              STUDENT PORTAL
            </span>
          </div>
          
          <button 
            onClick={onToggle} 
            className="lg:hidden p-1 hover:opacity-70 transition" 
            style={{ color: theme.sidebarText }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => navItemClass(isActive)}
              style={({ isActive }) => navItemStyle(isActive)}
              title={!isOpen ? item.label : undefined}
            >
              <span className="shrink-0" style={{ color: theme.sidebarText }}>
                {item.icon}
              </span>
              <span 
                className={`transition-opacity duration-200 ${
                  isOpen ? 'opacity-100' : 'opacity-0 lg:hidden w-0'
                }`} 
                style={{ color: theme.sidebarText }}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div 
          className="p-4" 
          style={{ borderTop: `1px solid ${theme.sidebarText}33` }}
        >
          <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span 
              className={`text-xs uppercase tracking-wider ${!isOpen && 'hidden'}`} 
              style={{ color: theme.sidebarText, opacity: 0.6 }}
            >
              {user.role?.replace('-', ' ')}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 