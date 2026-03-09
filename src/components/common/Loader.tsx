import React from 'react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Loader: React.FC<LoaderProps> = ({ 
  text = 'Loading...', 
  fullScreen = true,
  size = 'md' 
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-14 h-14 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-gray-200 border-t-black rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
};

export default Loader;