'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'cyber-grid' | 'blueprint' | 'graph-paper';

export interface ThemeOption {
  id: ThemeMode;
  label: string;
  icon: string;
  desc: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'cyber-grid', label: 'Cyber Grid', icon: '⚡', desc: 'ดำสนิทตัดตารางฟ้า-ส้ม ไซไฟ' },
  { id: 'blueprint', label: 'Blueprint', icon: '📐', desc: 'พิมพ์เขียวกรมท่าเข้ม พิมพ์สเก็ตช์' },
  { id: 'graph-paper', label: 'Graph Paper', icon: '📝', desc: 'กระดาษกราฟขาว สมุดบันทึก' },
];

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const LOCAL_STORAGE_THEME_KEY = 'cs67_theme';

const ThemeContext = createContext<ThemeContextType>({
  theme: 'cyber-grid',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('cyber-grid');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemeMode | null;
      if (saved && ['cyber-grid', 'blueprint', 'graph-paper'].includes(saved)) {
        setThemeState(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'cyber-grid');
      }
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'cyber-grid');
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (e) {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
