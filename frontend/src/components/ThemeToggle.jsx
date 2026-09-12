import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../hooks/useDarkMode.js';

function ThemeToggle() {
  const { darkMode, toggleTheme } = useDarkMode();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="text-secondary grid h-10 w-10 place-items-center rounded-md hover:text-[var(--text-primary)]"
      aria-label={darkMode ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {darkMode ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggle;
