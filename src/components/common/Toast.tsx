import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();
  
  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  const styles = {
    success: 'bg-white border-emerald-200 text-gray-900',
    error: 'bg-white border-red-200 text-gray-900',
    info: 'bg-white border-blue-200 text-gray-900',
    warning: 'bg-white border-amber-200 text-gray-900',
  };

  return (
    <div className="fixed top-4 right-4 z-9999 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium w-80 animate-slide-in ${styles[t.type]}`}
        >
          <span className="shrink-0">{icons[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button 
            onClick={() => removeToast(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;