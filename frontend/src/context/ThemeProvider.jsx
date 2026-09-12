import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './context.js';

const STORAGE_KEY = 'tvmaxx.theme';

// Interogarea anterioară, „(prefers-color-scheme)", era invalidă: fără o
// valoare, `matches` e mereu false, deci preferința sistemului era ignorată.
const prefersDark = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches;

function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return prefersDark();
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    // Spune browserului ce temă folosim, ca formularele native și barele de
    // derulare să nu rămână albe pe fundal închis.
    root.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // Urmărim sistemul doar cât timp utilizatorul nu a ales explicit.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const onChange = (event) => {
      if (!localStorage.getItem(STORAGE_KEY)) setDarkMode(event.matches);
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => {
      localStorage.setItem(STORAGE_KEY, prev ? 'light' : 'dark');
      return !prev;
    });
  }, []);

  const value = useMemo(
    () => ({ darkMode, setDarkMode, toggleTheme }),
    [darkMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeProvider;
