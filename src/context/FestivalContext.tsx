// src/context/FestivalContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import FESTIVALS, { 
  type Festival, 
  getCurrentFestival, 
  getUpcomingFestivals, 
  getNavratriDayInfo, 
  NAVRATRI_FORMS 
} from '../config/festivals.config';

interface FestivalContextType {
  currentFestival: Festival | null;
  isFestivalActive: boolean;
  navratriDay: typeof NAVRATRI_FORMS[0] | null;
  upcomingFestivals: Festival[];
  allFestivals: Festival[];
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentFestival, setCurrentFestival] = useState<Festival | null>(null);
  const [navratriDay, setNavratriDay] = useState<typeof NAVRATRI_FORMS[0] | null>(null);
  const [upcomingFestivals, setUpcomingFestivals] = useState<Festival[]>([]);

  useEffect(() => {
    const checkFestival = () => {
      const active = getCurrentFestival();
      setCurrentFestival(active);

      const navratriInfo = getNavratriDayInfo(); // ✅ No argument
    setNavratriDay(navratriInfo);

      const upcoming = getUpcomingFestivals();
      setUpcomingFestivals(upcoming);
    };

    checkFestival();
    const interval = setInterval(checkFestival, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FestivalContext.Provider
      value={{
        currentFestival,
        isFestivalActive: !!currentFestival, // 👈 Ab ye hamesha true hoga agar festival hai
        navratriDay,
        upcomingFestivals,
        allFestivals: FESTIVALS
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = (): FestivalContextType => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within FestivalProvider');
  }
  return context;
};

export default FestivalContext;