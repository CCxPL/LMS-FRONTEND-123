// src/components/festival/GlobalFestivalBanner.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFestival } from '../../hooks/useFestival';

const GlobalFestivalBanner: React.FC = () => {
  const { currentFestival, isFestivalActive } = useFestival();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Agar festival hai, toh thodi der baad popup dikhao (smooth lagta hai)
    if (isFestivalActive && currentFestival) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isFestivalActive, currentFestival]);

  if (!isFestivalActive || !currentFestival || !isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          0% { transform: translateY(50px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Floating Banner at Bottom Right */}
      <div className="fixed top-6 left-165 z-9999 animate-slide-up">
        <div 
          className="relative flex items-center gap-4 p-3 pr-4 rounded-2xl overflow-hidden text-white"
          style={{ 
            background: currentFestival.colors.gradient,
            boxShadow: `0 10px 30px -5px ${currentFestival.colors.shadow}`
          }}
        >
          {/* Subtle Background Shine */}
          <div className="absolute inset-0 bg-white/10 opacity-50 mix-blend-overlay"></div>

          {/* Festival SVG Icon */}
          <div className="relative z-10 shrink-0 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 text-white" 
              dangerouslySetInnerHTML={{ __html: currentFestival.svgIcon }}
            />
          </div>
          
          {/* Text Message */}
          <div className="relative z-10 pr-2">
            <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
              CodeSikha Wishes You
            </p>
            <p className="text-white text-base font-extrabold leading-none">
              Happy {currentFestival.name}!
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="relative z-10 ml-auto p-1.5 bg-white/10 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default GlobalFestivalBanner;