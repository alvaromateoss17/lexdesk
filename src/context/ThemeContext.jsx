import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

function applyTheme(theme) {
  const r = document.documentElement;
  if (theme === 'light') {
    r.style.setProperty('--bg',        '#F5F5F0');
    r.style.setProperty('--surface',   '#FFFFFF');
    r.style.setProperty('--surface-2', '#EFEFEA');
    r.style.setProperty('--surface-3', '#E5E5E0');
    r.style.setProperty('--border',    'rgba(0,0,0,0.08)');
    r.style.setProperty('--border-2',  'rgba(0,0,0,0.14)');
    r.style.setProperty('--text',      '#1A1A1A');
    r.style.setProperty('--text-2',    '#666660');
    r.style.setProperty('--text-3',    '#999990');
    r.style.setProperty('--blue',      '#2B5FD9');
    r.style.setProperty('--violet',    '#7C5AC4');
    r.style.setProperty('--sidebar-bg','#E8E8E3');
  } else {
    r.style.setProperty('--bg',        '#0F1117');
    r.style.setProperty('--surface',   '#161820');
    r.style.setProperty('--surface-2', '#1B1E27');
    r.style.setProperty('--surface-3', '#20232D');
    r.style.setProperty('--border',    '#1E2029');
    r.style.setProperty('--border-2',  '#262934');
    r.style.setProperty('--text',      '#F1F0EC');
    r.style.setProperty('--text-2',    '#8A8A8A');
    r.style.setProperty('--text-3',    '#5C5F6A');
    r.style.setProperty('--blue',      '#4F7EFF');
    r.style.setProperty('--violet',    '#A78BFA');
    r.style.setProperty('--sidebar-bg','#0C0E14');
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vincla_theme') || 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('vincla_theme', theme);
  }, [theme]);

  // Apply on mount synchronously to avoid flash
  useEffect(() => { applyTheme(theme); }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
