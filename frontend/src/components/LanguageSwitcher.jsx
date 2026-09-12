import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ro', label: 'Română', short: 'RO' },
  { code: 'de', label: 'Deutsch', short: 'DE' }
];

/**
 * Un <select> nativ: pe mobil deschide selectorul sistemului, e navigabil de
 * la tastatură fără cod suplimentar și nu are nevoie de gestionare de focus.
 */
function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.split('-')[0] ?? 'en';

  return (
    <label className="relative">
      <span className="sr-only">{t('nav.language')}</span>
      <select
        value={current}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
        className="text-secondary cursor-pointer appearance-none rounded-md bg-transparent px-3 py-2 text-sm font-medium hover:text-[var(--text-primary)]"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.short}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;
