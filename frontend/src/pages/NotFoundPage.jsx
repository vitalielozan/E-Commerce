import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '../hooks/usePageMeta.js';

function NotFoundPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t('notFound.title') });

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <p
        className="font-display tabular text-6xl font-bold"
        style={{ color: 'var(--color-ember-400)' }}
      >
        404
      </p>
      <h1 className="font-display text-2xl font-bold">{t('notFound.title')}</h1>
      <p className="text-secondary text-sm leading-relaxed">
        {t('notFound.description')}
      </p>
      <Link
        to="/shop"
        className="mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
        style={{
          backgroundColor: 'var(--color-ember-400)',
          color: 'var(--color-ink-950)'
        }}
      >
        {t('notFound.action')}
      </Link>
    </div>
  );
}

export default NotFoundPage;
