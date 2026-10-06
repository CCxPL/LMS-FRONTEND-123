// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeSettings {
  fontFamily: string;
  sidebarBg: string;
  sidebarText: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
  availableFonts: string[];
}

const defaultTheme: ThemeSettings = {
  fontFamily: 'Inter',
  sidebarBg: '#000000',
  sidebarText: '#ffffff',
};

const availableFonts = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Montserrat',
  'Lato',
  'Nunito',
  'Raleway',
  'Ubuntu',
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // localStorage hataya - seedha defaultTheme use hoga
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);

  useEffect(() => {
    // Dynamic Style Inject
    let styleTag = document.getElementById('theme-styles') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'theme-styles';
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      /* Global Font */
      * { font-family: '${theme.fontFamily}', sans-serif !important; }
      
      /* Sidebar Background */
      aside { background-color: ${theme.sidebarBg} !important; }
      
      /* Sidebar Text & Icons */
      aside * { color: ${theme.sidebarText} !important; }
      aside svg { color: ${theme.sidebarText} !important; }
      
      /* Sidebar Active Item */
      aside a.active { background-color: ${theme.sidebarText}22 !important; }
    `;

    // Google Font Load
    const fontName = theme.fontFamily.replace(/ /g, '+');
    let link = document.getElementById('dynamic-font') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = 'dynamic-font';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

    // localStorage.setItem line REMOVE kar di
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...newTheme }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, availableFonts }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};