import { useEffect, useState } from 'react';

const THEME_KEY = 'hoppr_theme';

export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return { theme, setTheme };
}
