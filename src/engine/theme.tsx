import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePalette = 'zinc' | 'cyber' | 'cobalt' | 'warm' | 'glacier' | 'sandstone' | 'aubergine';

export interface ThemeTemplate {
  id: ThemePalette;
  name: string;
  description: string;
  badge: string;
  accentColor: string;
}

export const THEME_TEMPLATES: ThemeTemplate[] = [
  { id: 'warm', name: 'Canvas', description: 'Warm daylight and charcoal navigation', badge: 'Light', accentColor: '#25352d' },
  { id: 'glacier', name: 'Glacier', description: 'Cool silver daylight', badge: 'Light', accentColor: '#275663' },
  { id: 'sandstone', name: 'Sandstone', description: 'Soft mineral warmth', badge: 'Light', accentColor: '#8e5931' },
  { id: 'zinc', name: 'Graphite', description: 'Soft neutral charcoal', badge: 'Dark', accentColor: '#c7d7c2' },
  { id: 'cobalt', name: 'Nocturne', description: 'Ink and brass', badge: 'Dark', accentColor: '#e0c18e' },
  { id: 'aubergine', name: 'Aubergine', description: 'Deep plum and chalk', badge: 'Dark', accentColor: '#e0bdd2' },
];

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  palette: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('holdpoint-theme-mode');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // fallback
    }
    return 'light';
  });

  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    try {
      const saved = localStorage.getItem('holdpoint-theme-palette');
      if (saved === 'zinc' || saved === 'cyber' || saved === 'cobalt' || saved === 'warm' || saved === 'glacier' || saved === 'sandstone' || saved === 'aubergine') return saved;
    } catch {
      // fallback
    }
    return 'warm';
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() => mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode);

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      let isDark = false;
      if (mode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = mode === 'dark';
      }
      setResolvedMode(isDark ? 'dark' : 'light');

      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.setAttribute('data-theme', palette);
    };

    updateResolved();

    const listener = () => {
      if (mode === 'system') updateResolved();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [mode, palette]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('holdpoint-theme-mode', newMode);
    } catch {
      // ignore
    }
  };

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette);
    try {
      localStorage.setItem('holdpoint-theme-palette', newPalette);
    } catch {
      // ignore
    }
  };

  const toggleMode = () => {
    const nextMode: ThemeMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolvedMode,
        palette,
        setMode,
        setPalette,
        toggleMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
