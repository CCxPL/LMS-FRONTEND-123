import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, GraduationCap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { SidebarItem } from '../../types/common.types';

interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, isOpen, onToggle }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onToggle} 
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-black text-white transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-800">
          <div className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'lg:justify-center lg:w-full'}`}>
            <div className="w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className={`font-bold text-lg whitespace-nowrap transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
            }`}>
              LMS Portal
            </span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                } ${!isOpen ? 'lg:justify-center' : ''}`
              }
              title={!isOpen ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`transition-opacity duration-200 ${
                isOpen ? 'opacity-100' : 'opacity-0 lg:hidden w-0'
              }`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className={`text-xs text-gray-500 uppercase tracking-wider ${!isOpen && 'hidden'}`}>
              {user.role?.replace('-', ' ')}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;