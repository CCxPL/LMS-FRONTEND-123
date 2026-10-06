// src/config/festivals.config.ts

export interface Festival {
  id: string;
  name: string;
  nameHindi?: string;
  type: 'hindu' | 'national' | 'international';
  month: number;       // Current year ka month (dynamic)
  day: number;         // Current year ka day (dynamic)
  endMonth?: number;
  endDay?: number;
  duration: number;
  colors: {
    gradient: string;
    shadow: string;
  };
  svgIcon: string;
  message: string;
  particles?: string;
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
  book: `<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zm20 0h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" stroke="currentColor" stroke-width="2" fill="none"/>`,
  trident: `<path d="M12 2v20M8 2v6l4 2 4-2V2M6 22h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  flute: `<path d="M4 12h16M4 12c0-2 3-4 8-4s8 2 8 4M8 12v2M11 12v2M14 12v2M17 12v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  lamp: `<path d="M12 2c-2 4-6 6-6 11a6 6 0 0012 0c0-5-4-7-6-11z" fill="currentColor"/><rect x="9" y="18" width="6" height="4" rx="1" fill="#FFF" opacity="0.8"/>`,
  star: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>`,
  sun: `<circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  om: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/><path d="M12 6c-2 0-3.5 1.5-3.5 3.5S10 13 12 13c1.5 0 2.5 1 2.5 2.5S13.5 18 12 18" stroke="currentColor" stroke-width="2" fill="none"/>`,
  durga: `<path d="M12 2l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4l2-4z" fill="currentColor"/><path d="M4 18h16M6 22h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  firework: `<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  lotus: `<path d="M12 22c-4 0-8-3-8-8 0-3 2-6 4-7 0 3 2 5 4 5s4-2 4-5c2 1 4 4 4 7 0 5-4 8-8 8z" fill="currentColor"/><path d="M12 14c-2-3-1-6 0-8 1 2 2 5 0 8z" fill="#FFF" opacity="0.6"/>`,
};

// ======================================================
// 🗓️ HINDU FESTIVAL DATES DATABASE (2024-2030)
// Lunar calendar based - dates change every year
// ======================================================

interface FestivalDateEntry {
  month: number;
  day: number;
  endMonth?: number;
  endDay?: number;
}

interface FestivalDatesMap {
  [year: number]: FestivalDateEntry;
}

interface HinduFestivalDates {
  [festivalId: string]: FestivalDatesMap;
}

const HINDU_FESTIVAL_DATES: HinduFestivalDates = {
  // 🪁 Makar Sankranti - Fixed date (Solar calendar based)
  'makar-sankranti': {
    2024: { month: 1, day: 15 },
    2025: { month: 1, day: 14 },
    2026: { month: 1, day: 14 },
    2027: { month: 1, day: 14 },
    2028: { month: 1, day: 15 },
    2029: { month: 1, day: 14 },
    2030: { month: 1, day: 14 },
  },

  // 🔱 Basant Panchami / Saraswati Puja
  'basant-panchami': {
    2024: { month: 2, day: 14 },
    2025: { month: 2, day: 2 },
    2026: { month: 1, day: 23 },
    2027: { month: 2, day: 11 },
    2028: { month: 1, day: 31 },
    2029: { month: 2, day: 18 },
    2030: { month: 2, day: 8 },
  },

  // 🌙 Maha Shivratri
  'maha-shivratri': {
    2024: { month: 3, day: 8 },
    2025: { month: 2, day: 26 },
    2026: { month: 2, day: 15 },
    2027: { month: 3, day: 6 },
    2028: { month: 2, day: 23 },
    2029: { month: 2, day: 12 },
    2030: { month: 3, day: 3 },
  },

  // 🎨 Holi (2 days - Holika Dahan + Holi)
  'holi': {
    2024: { month: 3, day: 25, endMonth: 3, endDay: 26 },
    2025: { month: 3, day: 13, endMonth: 3, endDay: 14 },
    2026: { month: 3, day: 3, endMonth: 3, endDay: 4 },
    2027: { month: 3, day: 22, endMonth: 3, endDay: 23 },
    2028: { month: 3, day: 11, endMonth: 3, endDay: 12 },
    2029: { month: 2, day: 28, endMonth: 3, endDay: 1 },
    2030: { month: 3, day: 18, endMonth: 3, endDay: 19 },
  },

  // 🏹 Ram Navami
  'ram-navami': {
    2024: { month: 4, day: 17 },
    2025: { month: 4, day: 6 },
    2026: { month: 3, day: 26 },
    2027: { month: 4, day: 15 },
    2028: { month: 4, day: 3 },
    2029: { month: 3, day: 23 },
    2030: { month: 4, day: 11 },
  },

  // 🙏 Hanuman Jayanti
  'hanuman-jayanti': {
    2024: { month: 4, day: 23 },
    2025: { month: 4, day: 12 },
    2026: { month: 4, day: 1 },
    2027: { month: 4, day: 21 },
    2028: { month: 4, day: 9 },
    2029: { month: 3, day: 30 },
    2030: { month: 4, day: 18 },
  },

  // 🙏 Guru Purnima
  'guru-purnima': {
    2024: { month: 7, day: 21 },
    2025: { month: 7, day: 10 },
    2026: { month: 7, day: 29 },
    2027: { month: 7, day: 19 },
    2028: { month: 7, day: 7 },
    2029: { month: 7, day: 26 },
    2030: { month: 7, day: 16 },
  },

  // 🧵 Raksha Bandhan
  'raksha-bandhan': {
    2024: { month: 8, day: 19 },
    2025: { month: 8, day: 9 },
    2026: { month: 8, day: 28 },
    2027: { month: 8, day: 17 },
    2028: { month: 8, day: 6 },
    2029: { month: 8, day: 25 },
    2030: { month: 8, day: 14 },
  },

  // 🦚 Janmashtami
  'janmashtami': {
    2024: { month: 8, day: 26 },
    2025: { month: 8, day: 16 },
    2026: { month: 9, day: 4 },
    2027: { month: 8, day: 25 },
    2028: { month: 8, day: 13 },
    2029: { month: 9, day: 1 },
    2030: { month: 8, day: 22 },
  },

  // 🐘 Ganesh Chaturthi (10 days festival)
  'ganesh-chaturthi': {
    2024: { month: 9, day: 7, endMonth: 9, endDay: 17 },
    2025: { month: 8, day: 27, endMonth: 9, endDay: 6 },
    2026: { month: 9, day: 15, endMonth: 9, endDay: 25 },
    2027: { month: 9, day: 5, endMonth: 9, endDay: 15 },
    2028: { month: 8, day: 24, endMonth: 9, endDay: 3 },
    2029: { month: 9, day: 12, endMonth: 9, endDay: 22 },
    2030: { month: 9, day: 2, endMonth: 9, endDay: 12 },
  },

  // 🔥 Navratri (9 days) - Sharad Navratri
  'navratri': {
    2024: { month: 10, day: 3, endMonth: 10, endDay: 12 },
    2025: { month: 9, day: 22, endMonth: 9, endDay: 30 },
    2026: { month: 10, day: 11, endMonth: 10, endDay: 19 },
    2027: { month: 10, day: 1, endMonth: 10, endDay: 9 },
    2028: { month: 9, day: 19, endMonth: 9, endDay: 27 },
    2029: { month: 10, day: 9, endMonth: 10, endDay: 17 },
    2030: { month: 9, day: 28, endMonth: 10, endDay: 6 },
  },

  // 🏹 Dussehra / Vijayadashami
  'dussehra': {
    2024: { month: 10, day: 12 },
    2025: { month: 10, day: 2 },
    2026: { month: 10, day: 20 },
    2027: { month: 10, day: 10 },
    2028: { month: 9, day: 28 },
    2029: { month: 10, day: 18 },
    2030: { month: 10, day: 7 },
  },

  // 🪔 Karwa Chauth
  'karwa-chauth': {
    2024: { month: 10, day: 20 },
    2025: { month: 10, day: 10 },
    2026: { month: 10, day: 29 },
    2027: { month: 10, day: 19 },
    2028: { month: 10, day: 7 },
    2029: { month: 10, day: 26 },
    2030: { month: 10, day: 15 },
  },

  // 🪔 Dhanteras
  'dhanteras': {
    2024: { month: 10, day: 29 },
    2025: { month: 10, day: 18 },
    2026: { month: 11, day: 6 },
    2027: { month: 10, day: 27 },
    2028: { month: 10, day: 15 },
    2029: { month: 11, day: 3 },
    2030: { month: 10, day: 24 },
  },

  // 🪔 Diwali (3 days - Narak Chaturdashi + Diwali + Govardhan)
  'diwali': {
    2024: { month: 11, day: 1, endMonth: 11, endDay: 3 },
    2025: { month: 10, day: 20, endMonth: 10, endDay: 22 },
    2026: { month: 11, day: 8, endMonth: 11, endDay: 10 },
    2027: { month: 10, day: 29, endMonth: 10, endDay: 31 },
    2028: { month: 10, day: 17, endMonth: 10, endDay: 19 },
    2029: { month: 11, day: 5, endMonth: 11, endDay: 7 },
    2030: { month: 10, day: 26, endMonth: 10, endDay: 28 },
  },

  // 🪔 Bhai Dooj
  'bhai-dooj': {
    2024: { month: 11, day: 3 },
    2025: { month: 10, day: 23 },
    2026: { month: 11, day: 11 },
    2027: { month: 11, day: 1 },
    2028: { month: 10, day: 20 },
    2029: { month: 11, day: 8 },
    2030: { month: 10, day: 29 },
  },

  // 🛒 Chhath Puja (2 days)
  'chhath-puja': {
    2024: { month: 11, day: 7, endMonth: 11, endDay: 8 },
    2025: { month: 10, day: 27, endMonth: 10, endDay: 28 },
    2026: { month: 11, day: 15, endMonth: 11, endDay: 16 },
    2027: { month: 11, day: 5, endMonth: 11, endDay: 6 },
    2028: { month: 10, day: 24, endMonth: 10, endDay: 25 },
    2029: { month: 11, day: 12, endMonth: 11, endDay: 13 },
    2030: { month: 11, day: 2, endMonth: 11, endDay: 3 },
  },

  // 🌾 Pongal (4 days)
  'pongal': {
    2024: { month: 1, day: 15, endMonth: 1, endDay: 18 },
    2025: { month: 1, day: 14, endMonth: 1, endDay: 17 },
    2026: { month: 1, day: 14, endMonth: 1, endDay: 17 },
    2027: { month: 1, day: 14, endMonth: 1, endDay: 17 },
    2028: { month: 1, day: 15, endMonth: 1, endDay: 18 },
    2029: { month: 1, day: 14, endMonth: 1, endDay: 17 },
    2030: { month: 1, day: 14, endMonth: 1, endDay: 17 },
  },

  // 🌙 Chaitra Navratri (9 days) - Spring Navratri
  'chaitra-navratri': {
    2024: { month: 4, day: 9, endMonth: 4, endDay: 17 },
    2025: { month: 3, day: 30, endMonth: 4, endDay: 6 },
    2026: { month: 3, day: 19, endMonth: 3, endDay: 27 },
    2027: { month: 4, day: 7, endMonth: 4, endDay: 15 },
    2028: { month: 3, day: 27, endMonth: 4, endDay: 4 },
    2029: { month: 3, day: 16, endMonth: 3, endDay: 24 },
    2030: { month: 4, day: 4, endMonth: 4, endDay: 12 },
  },

  

  // 🐍 Nag Panchami
  'nag-panchami': {
    2024: { month: 8, day: 9 },
    2025: { month: 8, day: 29 },
    2026: { month: 7, day: 19 },
    2027: { month: 8, day: 8 },
    2028: { month: 7, day: 27 },
    2029: { month: 8, day: 15 },
    2030: { month: 8, day: 5 },
  },

  // 🕉️ Onam (10 days)
  'onam': {
    2024: { month: 9, day: 6, endMonth: 9, endDay: 15 },
    2025: { month: 9, day: 5, endMonth: 9, endDay: 14 },
    2026: { month: 9, day: 4, endMonth: 9, endDay: 13 },
    2027: { month: 9, day: 3, endMonth: 9, endDay: 12 },
    2028: { month: 9, day: 1, endMonth: 9, endDay: 10 },
    2029: { month: 9, day: 7, endMonth: 9, endDay: 16 },
    2030: { month: 9, day: 6, endMonth: 9, endDay: 15 },
  },
};

// ======================================================
// 🛠️ HELPER: Get festival date for current year
// ======================================================

function getFestivalDate(festivalId: string, year: number): FestivalDateEntry | null {
  const festivalDates = HINDU_FESTIVAL_DATES[festivalId];
  if (!festivalDates) return null;

  // Direct year match
  if (festivalDates[year]) return festivalDates[year];

  // Fallback: Find nearest known year
  const knownYears = Object.keys(festivalDates).map(Number).sort();
  const lastKnown = knownYears[knownYears.length - 1];
  const firstKnown = knownYears[0];

  if (year > lastKnown) {
    // Use last known year's date as approximate
    return festivalDates[lastKnown];
  }
  if (year < firstKnown) {
    return festivalDates[firstKnown];
  }

  // Find closest year
  let closest = knownYears[0];
  for (const ky of knownYears) {
    if (Math.abs(ky - year) < Math.abs(closest - year)) {
      closest = ky;
    }
  }
  return festivalDates[closest];
}

// ======================================================
// 🎨 NAVRATRI 9 DAYS - Colors & Forms
// ======================================================

export interface NavratriDay {
  day: number;
  color: string;
  colorName: string;
  colorHindi: string;
  goddess: string;
  goddessHindi: string;
  gradient: string;
  shadow: string;
}

export const NAVRATRI_FORMS: NavratriDay[] = [
  {
    day: 1,
    color: '#FF6B00',
    colorName: 'Orange',
    colorHindi: 'नारंगी',
    goddess: 'Shailputri',
    goddessHindi: 'शैलपुत्री',
    gradient: 'linear-gradient(135deg, #FF6B00 0%, #FF8C42 100%)',
    shadow: 'rgba(255, 107, 0, 0.4)',
  },
  {
    day: 2,
    color: '#FFFFFF',
    colorName: 'White',
    colorHindi: 'सफेद',
    goddess: 'Brahmacharini',
    goddessHindi: 'ब्रह्मचारिणी',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #FFFFFF 100%)',
    shadow: 'rgba(200, 200, 200, 0.4)',
  },
  {
    day: 3,
    color: '#FF0000',
    colorName: 'Red',
    colorHindi: 'लाल',
    goddess: 'Chandraghanta',
    goddessHindi: 'चंद्रघंटा',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #FF4444 100%)',
    shadow: 'rgba(255, 0, 0, 0.4)',
  },
  {
    day: 4,
    color: '#1565C0',
    colorName: 'Royal Blue',
    colorHindi: 'शाही नीला',
    goddess: 'Kushmanda',
    goddessHindi: 'कूष्माण्डा',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
    shadow: 'rgba(21, 101, 192, 0.4)',
  },
  {
    day: 5,
    color: '#FFD700',
    colorName: 'Yellow',
    colorHindi: 'पीला',
    goddess: 'Skandamata',
    goddessHindi: 'स्कंदमाता',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFEA00 100%)',
    shadow: 'rgba(255, 215, 0, 0.4)',
  },
  {
    day: 6,
    color: '#2E7D32',
    colorName: 'Green',
    colorHindi: 'हरा',
    goddess: 'Katyayani',
    goddessHindi: 'कात्यायनी',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)',
    shadow: 'rgba(46, 125, 50, 0.4)',
  },
  {
    day: 7,
    color: '#757575',
    colorName: 'Grey',
    colorHindi: 'स्लेटी',
    goddess: 'Kaalratri',
    goddessHindi: 'कालरात्रि',
    gradient: 'linear-gradient(135deg, #424242 0%, #757575 100%)',
    shadow: 'rgba(117, 117, 117, 0.4)',
  },
  {
    day: 8,
    color: '#7B1FA2',
    colorName: 'Purple',
    colorHindi: 'बैंगनी',
    goddess: 'Mahagauri',
    goddessHindi: 'महागौरी',
    gradient: 'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
    shadow: 'rgba(123, 31, 162, 0.4)',
  },
  {
    day: 9,
    color: '#E91E63',
    colorName: 'Peacock Green',
    colorHindi: 'मोरपंखी',
    goddess: 'Siddhidatri',
    goddessHindi: 'सिद्धिदात्री',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)',
    shadow: 'rgba(233, 30, 99, 0.4)',
  },
];

// ======================================================
// 🎯 Build FESTIVALS Array Dynamically
// ======================================================

function buildFestivals(): Festival[] {
  const currentYear = new Date().getFullYear();

  // Hindu festivals with dynamic dates
  const hinduFestivals: Omit<Festival, 'month' | 'day' | 'endMonth' | 'endDay'>[] = [
    {
      id: 'makar-sankranti',
      name: 'Makar Sankranti',
      nameHindi: 'मकर संक्रांति',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)',
        shadow: 'rgba(237, 143, 3, 0.4)',
      },
      svgIcon: ICONS.kites,
      message: 'Happy Makar Sankranti! 🪁',
      particles: 'kites',
    },
    {
      id: 'pongal',
      name: 'Pongal',
      nameHindi: 'पोंगल',
      type: 'hindu',
      duration: 4,
      colors: {
        gradient: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
        shadow: 'rgba(242, 153, 74, 0.4)',
      },
      svgIcon: ICONS.sun,
      message: 'Happy Pongal! 🌾',
    },
    {
      id: 'basant-panchami',
      name: 'Basant Panchami',
      nameHindi: 'बसंत पंचमी',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        shadow: 'rgba(255, 215, 0, 0.4)',
      },
      svgIcon: ICONS.lotus,
      message: 'Happy Basant Panchami! 🌸 Jai Maa Saraswati!',
    },
    {
      id: 'maha-shivratri',
      name: 'Maha Shivratri',
      nameHindi: 'महा शिवरात्रि',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)',
        shadow: 'rgba(36, 59, 85, 0.4)',
      },
      svgIcon: ICONS.trident,
      message: 'Har Har Mahadev! 🔱',
    },
    {
      id: 'holi',
      name: 'Holi',
      nameHindi: 'होली',
      type: 'hindu',
      duration: 2,
      colors: {
        gradient: 'linear-gradient(135deg, #C33764 0%, #1D2671 100%)',
        shadow: 'rgba(195, 55, 100, 0.4)',
      },
      svgIcon: ICONS.holi_color,
      message: 'Happy Holi! 🎨',
      particles: 'colors',
    },
    {
      id: 'chaitra-navratri',
      name: 'Chaitra Navratri',
      nameHindi: 'चैत्र नवरात्रि',
      type: 'hindu',
      duration: 9,
      colors: {
        gradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
        shadow: 'rgba(238, 9, 121, 0.4)',
      },
      svgIcon: ICONS.durga,
      message: 'Jai Mata Di! 🙏',
    },
    {
      id: 'ram-navami',
      name: 'Ram Navami',
      nameHindi: 'राम नवमी',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FF8008 0%, #FFA089 100%)',
        shadow: 'rgba(255, 128, 8, 0.4)',
      },
      svgIcon: ICONS.bow_arrow,
      message: 'Jai Shri Ram! 🏹',
    },
    {
      id: 'hanuman-jayanti',
      name: 'Hanuman Jayanti',
      nameHindi: 'हनुमान जयंती',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FF512F 0%, #F09819 100%)',
        shadow: 'rgba(255, 81, 47, 0.4)',
      },
      svgIcon: ICONS.om,
      message: 'Jai Bajrangbali! 🙏',
    },
    {
      id: 'guru-purnima',
      name: 'Guru Purnima',
      nameHindi: 'गुरु पूर्णिमा',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
        shadow: 'rgba(245, 175, 25, 0.4)',
      },
      svgIcon: ICONS.book,
      message: 'Happy Guru Purnima! 🙏',
    },
    {
      id: 'nag-panchami',
      name: 'Nag Panchami',
      nameHindi: 'नाग पंचमी',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        shadow: 'rgba(44, 83, 100, 0.4)',
      },
      svgIcon: ICONS.om,
      message: 'Happy Nag Panchami! 🐍',
    },
    {
      id: 'raksha-bandhan',
      name: 'Raksha Bandhan',
      nameHindi: 'रक्षा बंधन',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        shadow: 'rgba(255, 154, 158, 0.4)',
      },
      svgIcon: ICONS.rakhi,
      message: 'Happy Raksha Bandhan! 🧵',
    },
    {
      id: 'janmashtami',
      name: 'Janmashtami',
      nameHindi: 'जन्माष्टमी',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
        shadow: 'rgba(0, 131, 176, 0.4)',
      },
      svgIcon: ICONS.flute,
      message: 'Jai Shri Krishna! 🦚',
      particles: 'peacock',
    },
    {
      id: 'ganesh-chaturthi',
      name: 'Ganesh Chaturthi',
      nameHindi: 'गणेश चतुर्थी',
      type: 'hindu',
      duration: 10,
      colors: {
        gradient: 'linear-gradient(135deg, #F37335 0%, #FDC830 100%)',
        shadow: 'rgba(243, 115, 53, 0.4)',
      },
      svgIcon: ICONS.ganpati,
      message: 'Ganpati Bappa Morya! 🐘',
    },
    {
      id: 'onam',
      name: 'Onam',
      nameHindi: 'ओणम',
      type: 'hindu',
      duration: 10,
      colors: {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FF6B00 100%)',
        shadow: 'rgba(255, 215, 0, 0.4)',
      },
      svgIcon: ICONS.lotus,
      message: 'Happy Onam! 🌺',
    },
    {
      id: 'navratri',
      name: 'Navratri',
      nameHindi: 'नवरात्रि',
      type: 'hindu',
      duration: 9,
      colors: {
        gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)',
        shadow: 'rgba(239, 71, 58, 0.4)',
      },
      svgIcon: ICONS.durga,
      message: 'Jai Mata Di! 🙏',
    },
    {
      id: 'dussehra',
      name: 'Dussehra',
      nameHindi: 'दशहरा',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
        shadow: 'rgba(255, 65, 108, 0.4)',
      },
      svgIcon: ICONS.bow_arrow,
      message: 'Happy Dussehra! 🏹 बुराई पर अच्छाई की जीत!',
      particles: 'fire',
    },
    {
      id: 'karwa-chauth',
      name: 'Karwa Chauth',
      nameHindi: 'करवा चौथ',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #C33764 0%, #1D2671 100%)',
        shadow: 'rgba(195, 55, 100, 0.4)',
      },
      svgIcon: ICONS.moon_star,
      message: 'Happy Karwa Chauth! 🌙',
    },
    {
      id: 'dhanteras',
      name: 'Dhanteras',
      nameHindi: 'धनतेरस',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
        shadow: 'rgba(255, 215, 0, 0.4)',
      },
      svgIcon: ICONS.lamp,
      message: 'Happy Dhanteras! 🪔 Shubh Labh!',
    },
    {
      id: 'diwali',
      name: 'Diwali',
      nameHindi: 'दीपावली',
      type: 'hindu',
      duration: 3,
      colors: {
        gradient: 'linear-gradient(135deg, #FF512F 0%, #F09819 100%)',
        shadow: 'rgba(240, 152, 25, 0.4)',
      },
      svgIcon: ICONS.diya,
      message: 'Happy Diwali! 🪔✨',
      particles: 'fireworks',
    },
    {
      id: 'bhai-dooj',
      name: 'Bhai Dooj',
      nameHindi: 'भाई दूज',
      type: 'hindu',
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        shadow: 'rgba(255, 154, 158, 0.4)',
      },
      svgIcon: ICONS.star,
      message: 'Happy Bhai Dooj! 👫',
    },
    {
      id: 'chhath-puja',
      name: 'Chhath Puja',
      nameHindi: 'छठ पूजा',
      type: 'hindu',
      duration: 2,
      colors: {
        gradient: 'linear-gradient(135deg, #FF8008 0%, #FFC837 100%)',
        shadow: 'rgba(255, 128, 8, 0.4)',
      },
      svgIcon: ICONS.sun,
      message: 'Happy Chhath Puja! 🌅 Jai Chhathi Maiya!',
    },
  ];

  // Fixed-date festivals (National + International)
  const fixedFestivals: Festival[] = [
    // 🇮🇳 NATIONAL DAYS
    {
      id: 'republic-day',
      name: 'Republic Day',
      nameHindi: 'गणतंत्र दिवस',
      type: 'national',
      month: 1,
      day: 26,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
        shadow: 'rgba(19, 136, 8, 0.4)',
      },
      svgIcon: ICONS.flag,
      message: 'Happy Republic Day! 🇮🇳',
    },
    {
      id: 'independence-day',
      name: 'Independence Day',
      nameHindi: 'स्वतंत्रता दिवस',
      type: 'national',
      month: 8,
      day: 15,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
        shadow: 'rgba(19, 136, 8, 0.4)',
      },
      svgIcon: ICONS.flag,
      message: 'Happy Independence Day! 🇮🇳 Jai Hind!',
    },
    {
      id: 'gandhi-jayanti',
      name: 'Gandhi Jayanti',
      nameHindi: 'गांधी जयंती',
      type: 'national',
      month: 10,
      day: 2,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        shadow: 'rgba(118, 75, 162, 0.4)',
      },
      svgIcon: ICONS.lotus,
      message: 'Gandhi Jayanti! 🕊️ Be the change!',
    },

    // 🌍 INTERNATIONAL DAYS
    {
      id: 'new-year',
      name: 'New Year',
      type: 'international',
      month: 1,
      day: 1,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #FDC830 0%, #F37335 100%)',
        shadow: 'rgba(253, 200, 48, 0.4)',
      },
      svgIcon: ICONS.firework,
      message: `Happy New Year ${currentYear}! 🎉`,
      particles: 'fireworks',
    },
    {
      id: 'valentines-day',
      name: "Valentine's Day",
      type: 'international',
      month: 2,
      day: 14,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
        shadow: 'rgba(255, 8, 68, 0.4)',
      },
      svgIcon: ICONS.heart,
      message: "Happy Valentine's Day! 💕",
      particles: 'hearts',
    },
    {
      id: 'mothers-day',
      name: "Mother's Day",
      nameHindi: 'मातृ दिवस',
      type: 'international',
      month: 5,
      day: 11, // 2nd Sunday of May (approximate)
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        shadow: 'rgba(255, 154, 158, 0.4)',
      },
      svgIcon: ICONS.heart,
      message: "Happy Mother's Day! 👩‍👧‍👦💐",
    },
    {
      id: 'fathers-day',
      name: "Father's Day",
      nameHindi: 'पितृ दिवस',
      type: 'international',
      month: 6,
      day: 15, // 3rd Sunday of June (approximate)
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
        shadow: 'rgba(75, 108, 183, 0.4)',
      },
      svgIcon: ICONS.star,
      message: "Happy Father's Day! 👨‍👧‍👦",
    },
    {
      id: 'teachers-day',
      name: "Teachers' Day",
      nameHindi: 'शिक्षक दिवस',
      type: 'international',
      month: 9,
      day: 5,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
        shadow: 'rgba(75, 108, 183, 0.4)',
      },
      svgIcon: ICONS.book,
      message: "Happy Teachers' Day! 📚🙏",
    },
    {
      id: 'childrens-day',
      name: "Children's Day",
      nameHindi: 'बाल दिवस',
      type: 'international',
      month: 11,
      day: 14,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        shadow: 'rgba(67, 233, 123, 0.4)',
      },
      svgIcon: ICONS.party,
      message: "Happy Children's Day! 🧒🎈",
    },
    {
      id: 'christmas',
      name: 'Christmas',
      type: 'international',
      month: 12,
      day: 25,
      duration: 1,
      colors: {
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        shadow: 'rgba(17, 153, 142, 0.4)',
      },
      svgIcon: ICONS.tree,
      message: 'Merry Christmas! 🎄🎅',
      particles: 'snow',
    },
  ];

  // Build Hindu festivals with dynamic dates
  const dynamicHinduFestivals: Festival[] = hinduFestivals.map((festival) => {
    const dateEntry = getFestivalDate(festival.id, currentYear);

    if (dateEntry) {
      return {
        ...festival,
        month: dateEntry.month,
        day: dateEntry.day,
        endMonth: dateEntry.endMonth,
        endDay: dateEntry.endDay,
      } as Festival;
    }

    // Fallback - shouldn't happen but just in case
    return {
      ...festival,
      month: 1,
      day: 1,
    } as Festival;
  });

  // Combine and sort by month/day
  const allFestivals = [...dynamicHinduFestivals, ...fixedFestivals];
  allFestivals.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  return allFestivals;
}

// ======================================================
// 📦 EXPORTS
// ======================================================

export const FESTIVALS: Festival[] = buildFestivals();

/**
 * 🎯 Get Currently Active Festival
 * Checks if today falls within any festival's date range
 */
export const getCurrentFestival = (): Festival | null => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  // Create today's date without time
  const todayDate = new Date(currentYear, todayMonth - 1, todayDay);

  for (const festival of FESTIVALS) {
    // For Hindu festivals, get fresh dates for current year
    const dateEntry = getFestivalDate(festival.id, currentYear);

    const fMonth = dateEntry?.month ?? festival.month;
    const fDay = dateEntry?.day ?? festival.day;
    const fEndMonth = dateEntry?.endMonth ?? festival.endMonth;
    const fEndDay = dateEntry?.endDay ?? festival.endDay;

    if (fEndMonth && fEndDay) {
      // Multi-day festival
      const startDate = new Date(currentYear, fMonth - 1, fDay);
      const endDate = new Date(currentYear, fEndMonth - 1, fEndDay);

      if (todayDate >= startDate && todayDate <= endDate) {
        // Return festival with correct dates
        return {
          ...festival,
          month: fMonth,
          day: fDay,
          endMonth: fEndMonth,
          endDay: fEndDay,
        };
      }
    } else {
      // Single day or duration-based festival
      const startDate = new Date(currentYear, fMonth - 1, fDay);
      const endDate = new Date(currentYear, fMonth - 1, fDay + (festival.duration - 1));

      if (todayDate >= startDate && todayDate <= endDate) {
        return {
          ...festival,
          month: fMonth,
          day: fDay,
        };
      }
    }
  }

  return null;
};

/**
 * 🔥 Get Navratri Day Info
 * Returns which day of Navratri it is with color/goddess info
 */
export const getNavratriDayInfo = (): NavratriDay | null => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayDate = new Date(currentYear, today.getMonth(), today.getDate());

  // Check Sharad Navratri
  const sharadNavratri = getFestivalDate('navratri', currentYear);
  if (sharadNavratri) {
    const startDate = new Date(currentYear, sharadNavratri.month - 1, sharadNavratri.day);
    const diffTime = todayDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < 9) {
      return NAVRATRI_FORMS[diffDays];
    }
  }

  // Check Chaitra Navratri
  const chaitraNavratri = getFestivalDate('chaitra-navratri', currentYear);
  if (chaitraNavratri) {
    const startDate = new Date(currentYear, chaitraNavratri.month - 1, chaitraNavratri.day);
    const diffTime = todayDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays < 9) {
      return NAVRATRI_FORMS[diffDays];
    }
  }

  return null;
};

/**
 * 📅 Get Upcoming Festivals (next N festivals from today)
 */
export const getUpcomingFestivals = (count: number = 5): Festival[] => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const upcoming: { festival: Festival; daysUntil: number }[] = [];

  for (const festival of FESTIVALS) {
    const dateEntry = getFestivalDate(festival.id, currentYear);
    const fMonth = dateEntry?.month ?? festival.month;
    const fDay = dateEntry?.day ?? festival.day;

    const festivalDate = new Date(currentYear, fMonth - 1, fDay);
    const todayDate = new Date(currentYear, todayMonth - 1, todayDay);

    let diffDays = Math.ceil(
      (festivalDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If festival has passed this year, calculate for next year
    if (diffDays < 0) {
      const nextYearEntry = getFestivalDate(festival.id, currentYear + 1);
      const nextMonth = nextYearEntry?.month ?? fMonth;
      const nextDay = nextYearEntry?.day ?? fDay;
      const nextYearDate = new Date(currentYear + 1, nextMonth - 1, nextDay);
      diffDays = Math.ceil(
        (nextYearDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    if (diffDays > 0) {
      upcoming.push({
        festival: {
          ...festival,
          month: fMonth,
          day: fDay,
        },
        daysUntil: diffDays,
      });
    }
  }

  // Sort by days until and return top N
  upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

  return upcoming.slice(0, count).map((u) => u.festival);
};

/**
 * 🔍 Get Festival by ID
 */
export const getFestivalById = (id: string): Festival | null => {
  const currentYear = new Date().getFullYear();
  const festival = FESTIVALS.find((f) => f.id === id);

  if (!festival) return null;

  const dateEntry = getFestivalDate(id, currentYear);
  if (dateEntry) {
    return {
      ...festival,
      month: dateEntry.month,
      day: dateEntry.day,
      endMonth: dateEntry.endMonth,
      endDay: dateEntry.endDay,
    };
  }

  return festival;
};

/**
 * 📆 Get All Festivals for a Specific Year
 */
export const getFestivalsForYear = (year: number): Festival[] => {
  const allFestivals: Festival[] = [];

  for (const festival of FESTIVALS) {
    const dateEntry = getFestivalDate(festival.id, year);
    if (dateEntry) {
      allFestivals.push({
        ...festival,
        month: dateEntry.month,
        day: dateEntry.day,
        endMonth: dateEntry.endMonth,
        endDay: dateEntry.endDay,
      });
    } else {
      allFestivals.push({ ...festival });
    }
  }

  allFestivals.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  return allFestivals;
};

/**
 * 🎯 Check if today is a festival day
 */
export const isFestivalToday = (): boolean => {
  return getCurrentFestival() !== null;
};

/**
 * 📊 Get days until next festival
 */
export const getDaysUntilNextFestival = (): { festival: Festival; days: number } | null => {
  const upcoming = getUpcomingFestivals(1);
  if (upcoming.length === 0) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const festival = upcoming[0];
  const festivalDate = new Date(currentYear, festival.month - 1, festival.day);
  const todayDate = new Date(currentYear, today.getMonth(), today.getDate());

  let days = Math.ceil(
    (festivalDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    const nextYearEntry = getFestivalDate(festival.id, currentYear + 1);
    const nextMonth = nextYearEntry?.month ?? festival.month;
    const nextDay = nextYearEntry?.day ?? festival.day;
    const nextYearDate = new Date(currentYear + 1, nextMonth - 1, nextDay);
    days = Math.ceil(
      (nextYearDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return { festival, days };
};

export default FESTIVALS;