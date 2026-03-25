// src/config/festivals.config.ts

export interface Festival {
  id: string;
  name: string;
  nameHindi?: string;
  type: 'hindu' | 'national' | 'international';
  month: number;
  day: number;
  endMonth?: number;
  endDay?: number;
  duration: number;
  colors: {
    gradient: string; // ✨ Gradient
    shadow: string;   // ✨ Shadow Glow (Ye missing tha)
  };
  svgIcon: string;    // ✨ SVG Path String (Ye missing tha)
  message: string;
}

// ✨ Custom SVG Icons (Path data)
const ICONS = {
  diya: `<path d="M12 2c-1.5 3-5 5-5 9a5 5 0 0010 0c0-4-3.5-6-5-9z" fill="currentColor"/><path d="M4 14c0 3.5 3 6.5 8 6.5s8-3 8-6.5h-16z" fill="#FFF" opacity="0.8"/>`,
  kites: `<path d="M12 2L2 12l10 10 10-10L12 2zm0 2.8L19.2 12 12 19.2 4.8 12 12 4.8z" fill="currentColor"/><path d="M12 12l8 8M4 12l8-8" stroke="currentColor" stroke-width="2"/>`,
  moon_star: `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/><path d="M18 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="#FFF"/>`,
  holi_color: `<path d="M12 2C8 6 4 9 4 14a8 8 0 0016 0c0-5-4-8-8-12z" fill="currentColor"/><circle cx="10" cy="15" r="2" fill="#FFF"/><circle cx="15" cy="13" r="1.5" fill="#FFF"/>`,
  bow_arrow: `<path d="M12 2L9 5M2 12l3 3M22 2L2 22M21 7a13.5 13.5 0 00-14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  rakhi: `<circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M7 12H2M22 12h-5M12 7V2M12 22v-5M8.5 8.5L5 5M19 19l-3.5-3.5M19 5l-3.5 3.5M5 19l3.5-3.5" stroke="currentColor" stroke-width="2"/>`,
  peacock: `<path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm0-18C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" fill="currentColor"/><circle cx="12" cy="12" r="3" fill="#FFF"/>`,
  ganpati: `<path d="M12 2a4 4 0 00-4 4v2c-2.2 0-4 1.8-4 4v4c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-4c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v4c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-4c0-2.2-1.8-4-4-4V6a4 4 0 00-4-4z" fill="currentColor"/>`,
  flag: `<path d="M4 2v20M4 5h16c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="9.5" r="2" fill="#FFF"/>`,
  tree: `<path d="M12 2L2 14h5v8h10v-8h5L12 2z" fill="currentColor"/>`,
  heart: `<path d="M20.8 4.6a5.5 5.5 0 00-7.7 0l-1.1 1-1.1-1a5.5 5.5 0 00-7.8 7.8l8.9 9 8.8-9a5.5 5.5 0 000-7.8z" fill="currentColor"/>`,
  party: `<path d="M14 6l6-4-4 6 5 2-6 2 2 5-5-3-4 6-1-7-6-1 7-3-2-6 5 4z" fill="currentColor"/>`,
  book: `<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zm20 0h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" stroke="currentColor" stroke-width="2" fill="none"/>`
};

export const FESTIVALS: Festival[] = [
  // 🕉️ HINDU FESTIVALS
  { id: 'makar-sankranti', name: 'Makar Sankranti', nameHindi: 'मकर संक्रांति', type: 'hindu', month: 1, day: 14, duration: 1, colors: { gradient: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)', shadow: 'rgba(237, 143, 3, 0.4)' }, svgIcon: ICONS.kites, message: 'Happy Makar Sankranti!' },
  { id: 'maha-shivratri', name: 'Maha Shivratri', nameHindi: 'महा शिवरात्रि', type: 'hindu', month: 2, day: 26, duration: 1, colors: { gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)', shadow: 'rgba(36, 59, 85, 0.4)' }, svgIcon: ICONS.moon_star, message: 'Har Har Mahadev!' },
  { id: 'holi', name: 'Holi', nameHindi: 'होली', type: 'hindu', month: 3, day: 14, duration: 2, colors: { gradient: 'linear-gradient(135deg, #C33764 0%, #1D2671 100%)', shadow: 'rgba(195, 55, 100, 0.4)' }, svgIcon: ICONS.holi_color, message: 'Happy Holi!' },
  { id: 'ram-navami', name: 'Ram Navami', nameHindi: 'राम नवमी', type: 'hindu', month: 4, day: 6, duration: 1, colors: { gradient: 'linear-gradient(135deg, #FF8008 0%, #FFA089 100%)', shadow: 'rgba(255, 128, 8, 0.4)' }, svgIcon: ICONS.bow_arrow, message: 'Jai Shri Ram!' },
  { id: 'raksha-bandhan', name: 'Raksha Bandhan', nameHindi: 'रक्षा बंधन', type: 'hindu', month: 8, day: 9, duration: 1, colors: { gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', shadow: 'rgba(255, 154, 158, 0.4)' }, svgIcon: ICONS.rakhi, message: 'Happy Raksha Bandhan!' },
  { id: 'janmashtami', name: 'Janmashtami', nameHindi: 'जन्माष्टमी', type: 'hindu', month: 8, day: 16, duration: 1, colors: { gradient: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)', shadow: 'rgba(0, 131, 176, 0.4)' }, svgIcon: ICONS.peacock, message: 'Jai Shri Krishna!' },
  { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', nameHindi: 'गणेश चतुर्थी', type: 'hindu', month: 8, day: 27, duration: 3, colors: { gradient: 'linear-gradient(135deg, #F37335 0%, #FDC830 100%)', shadow: 'rgba(243, 115, 53, 0.4)' }, svgIcon: ICONS.ganpati, message: 'Ganpati Bappa Morya!' },
  { id: 'navratri', name: 'Navratri', nameHindi: 'नवरात्रि', type: 'hindu', month: 9, day: 29, duration: 9, colors: { gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)', shadow: 'rgba(239, 71, 58, 0.4)' }, svgIcon: ICONS.diya, message: 'Jai Mata Di!' },
  { id: 'diwali', name: 'Diwali', nameHindi: 'दीपावली', type: 'hindu', month: 10, day: 20, duration: 3, colors: { gradient: 'linear-gradient(135deg, #FF512F 0%, #F09819 100%)', shadow: 'rgba(240, 152, 25, 0.4)' }, svgIcon: ICONS.diya, message: 'Happy Diwali!' },

  // 🇮🇳 NATIONAL DAYS
  { id: 'republic-day', name: 'Republic Day', type: 'national', month: 1, day: 26, duration: 1, colors: { gradient: 'linear-gradient(135deg, #F37335 0%, #FFFFFF 50%, #11998e 100%)', shadow: 'rgba(17, 153, 142, 0.4)' }, svgIcon: ICONS.flag, message: 'Happy Republic Day!' },
  { id: 'independence-day', name: 'Independence Day', type: 'national', month: 8, day: 15, duration: 1, colors: { gradient: 'linear-gradient(135deg, #F37335 0%, #FFFFFF 50%, #11998e 100%)', shadow: 'rgba(17, 153, 142, 0.4)' }, svgIcon: ICONS.flag, message: 'Happy Independence Day!' },

  // 🌍 INTERNATIONAL DAYS
  { id: 'new-year', name: 'New Year', type: 'international', month: 1, day: 1, duration: 1, colors: { gradient: 'linear-gradient(135deg, #FDC830 0%, #F37335 100%)', shadow: 'rgba(253, 200, 48, 0.4)' }, svgIcon: ICONS.party, message: `Happy New Year!` },
  { id: 'valentines-day', name: "Valentine's Day", type: 'international', month: 2, day: 14, duration: 1, colors: { gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', shadow: 'rgba(255, 8, 68, 0.4)' }, svgIcon: ICONS.heart, message: "Happy Valentine's Day!" },
  { id: 'teachers-day', name: "Teachers' Day", type: 'international', month: 9, day: 5, duration: 1, colors: { gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)', shadow: 'rgba(75, 108, 183, 0.4)' }, svgIcon: ICONS.book, message: "Happy Teachers' Day!" },
  { id: 'christmas', name: 'Christmas', type: 'international', month: 12, day: 25, duration: 1, colors: { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', shadow: 'rgba(17, 153, 142, 0.4)' }, svgIcon: ICONS.tree, message: 'Merry Christmas!' },
];

export const getCurrentFestival = (): Festival | null => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  for (const festival of FESTIVALS) {
    if (festival.endMonth && festival.endDay) {
      const startDate = new Date(today.getFullYear(), festival.month - 1, festival.day);
      const endDate = new Date(today.getFullYear(), festival.endMonth - 1, festival.endDay);
      const todayDate = new Date(today.getFullYear(), todayMonth - 1, todayDay);
      if (todayDate >= startDate && todayDate <= endDate) return festival;
    } else {
      if (todayMonth === festival.month && todayDay === festival.day) return festival;
    }
  }
  return null;
};

// Export dummy imports to prevent errors in other files
export const NAVRATRI_FORMS = [];
export const getNavratriDayInfo = () => null;
export const getUpcomingFestivals = () => [];

export default FESTIVALS;