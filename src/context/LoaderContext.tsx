import React, { createContext, useContext, useState } from 'react';

interface LoaderContextType {
  showLoader: (text?: string) => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState('Loading...');

  const showLoader = (msg?: string) => {
    setText(msg || 'Loading...');
    setIsLoading(true);
  };

  const hideLoader = () => setIsLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      
      {isLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">{text}</p>
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) throw new Error('useLoader must be within LoaderProvider');
  return context;
};