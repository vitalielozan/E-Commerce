import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SITE_NAME = 'TV-Maxx';

const setMeta = (name, content) => {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

/**
 * Titlul paginii și descrierea, per rută.
 *
 * Aplicația avea un singur <title> static și `lang="en"` fix în HTML, deși
 * interfața e în trei limbi — atributul lang greșit schimbă pronunția la
 * cititoarele de ecran, nu doar metadatele.
 */
export function usePageMeta({ title, description } = {}) {
  const { i18n, t } = useTranslation();

  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : t('meta.defaultTitle');
    setMeta('description', description || t('meta.defaultDescription'));
  }, [title, description, t]);

  useEffect(() => {
    document.documentElement.lang = i18n.language?.split('-')[0] || 'en';
  }, [i18n.language]);
}
