import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'ui.theme';

const getSystemPrefersDark = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyDocumentClass = (isDark: boolean): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) root.classList.add('dark');
  else root.classList.remove('dark');
};

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored ?? 'system';
  });

  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemPrefersDark() ? 'dark' : 'light';
    return theme;
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore storage write errors */
    }
  }, []);

  useEffect(() => {
    applyDocumentClass(resolvedTheme === 'dark');
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyDocumentClass(media.matches);
    };
    media.addEventListener?.('change', handleChange);
    return () => media.removeEventListener?.('change', handleChange);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export { type Theme };

