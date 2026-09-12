/**
 * Formatare de numere legată de limba activă.
 *
 * Catalogul afișa prețurile în două feluri („$499.99" și „499.99 $.") și
 * păstra simbolul dolarului inclusiv în română și germană. Intl rezolvă și
 * simbolul, și separatorul zecimal, și poziția lui față de cifre.
 */

// Aplicația vinde în euro; harta leagă limba de convențiile ei locale.
const LOCALES = {
  en: 'en-IE',
  ro: 'ro-RO',
  de: 'de-DE',
};

const CURRENCY = 'EUR';

const localeFor = (lang) => LOCALES[lang?.split('-')[0]] ?? LOCALES.en;

export function formatPrice(value, lang = 'en') {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';

  return new Intl.NumberFormat(localeFor(lang), {
    style: 'currency',
    currency: CURRENCY,
    // Prețurile catalogului sunt toate cu zecimale; le păstrăm consecvente.
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value, lang = 'en') {
  if (!value) return '';

  return new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatNumber(value, lang = 'en') {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return new Intl.NumberFormat(localeFor(lang)).format(value);
}

/** Procentul de reducere, pentru eticheta de pe card. */
export function discountPercent(price, compareAtPrice) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round((1 - price / compareAtPrice) * 100);
}
