import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'contrast';

export function useContrast() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nyayaflow_theme');
      if (stored === 'contrast') {
        return 'contrast';
      }
    }
    return 'light';
  });

  const toggleContrast = () => {
    const nextTheme: ThemeMode = theme === 'contrast' ? 'light' : 'contrast';
    setThemeState(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nyayaflow_theme', nextTheme);
      if (nextTheme === 'contrast') {
        document.documentElement.setAttribute('data-theme', 'contrast');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  };

  useEffect(() => {
    if (theme === 'contrast') {
      document.documentElement.setAttribute('data-theme', 'contrast');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  return { theme, isContrast: theme === 'contrast', toggleContrast };
}
