import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Eroare de încărcare. Spune ce a eșuat și oferă reîncercarea — erorile nu
 * își cer scuze și nu sunt vagi în privința a ce s-a întâmplat.
 */
function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div
      className="surface-panel flex flex-col items-center gap-3 px-6 py-12 text-center"
      role="alert"
    >
      <AlertCircle
        className="h-8 w-8"
        style={{ color: 'var(--color-signal-alert)' }}
        aria-hidden="true"
      />
      <p className="font-display text-lg font-semibold">
        {message || t('common.loadError')}
      </p>
      <p className="text-secondary text-sm">{t('common.loadErrorHint')}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-ember-400)',
            color: 'var(--color-ink-950)'
          }}
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

export default ErrorState;
