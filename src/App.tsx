import React, { useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { FestivalProvider } from './context/FestivalContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import Toast from './components/common/Toast';
import AIChatBot from './components/common/AIChatBot';
import GlobalFestivalBanner from './components/festival/GlobalFestivalBanner';
import logo from '../public/coding-freak.gif';


// Helper: Route ka naam nikalne ke liye
const getLoaderMessage = (path: string) => {
  if (path === '/login' || path === '/' || path === '/forgot-password') {
    return 'Setting up Class...';
  }

  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) return 'Please Wait...';

  return `Loading ${lastSegment.replace(/-/g, ' ').toUpperCase()}...`;
};

// ✅ LOADER COMPONENT - ALWAYS WHITE (No Theme Effect)
const StudyLoader = ({ message }: { message: string }) => {
  return (
    <div 
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#ffffff' }} // ✅ Force white background
    >
      <div className="relative flex flex-col items-center">
        
        {/* GIF Animation - ✅ Always normal colors */}
        <img 
          src={logo}
          alt="Student Coding"
          className="w-80 h-64 object-cover mix-blend-multiply"
        />

        {/* Dynamic Text & Bar - ✅ Always dark text */}
        <div className="-mt-5 w-56 text-center">
          <p 
            className="text-xs font-bold tracking-[0.2em] uppercase mb-3 animate-pulse"
            style={{ color: '#6b7280' }} // ✅ Force gray text
          >
            {message}
          </p>
          
          <div 
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: '#f3f4f6' }} // ✅ Force light gray bg
          >
            <div 
              className="h-full rounded-full animate-progress"
              style={{ backgroundColor: '#4f46e5' }} // ✅ Force indigo bar
            ></div>
          </div>
        </div>

      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const AutoLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(getLoaderMessage(location.pathname));
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {isLoading && <StudyLoader message={message} />}
      {children}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FestivalProvider>
        <BrowserRouter>
          <ToastProvider>
            <Toast/>
            <AuthProvider>
              <DataProvider>
                <GlobalFestivalBanner /> 
                <AutoLoader>
                  <AppRoutes />
                  <AIChatBot />
                </AutoLoader>
              </DataProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </FestivalProvider>
    </ThemeProvider>
  );
};

export default App;