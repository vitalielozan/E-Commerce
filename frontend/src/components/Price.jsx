import { useTranslation } from 'react-i18next';
import { formatPrice, discountPercent } from '../services/format.js';

/**
 * Preț localizat, cu prețul tăiat alături când produsul e la reducere.
 * Cifrele sunt tabulare ca să se alinieze pe verticală într-o listă.
 */
function Price({ value, compareAt, size = 'md', className = '' }) {
  const { i18n, t } = useTranslation();
  const percent = discountPercent(value, compareAt);

  const scale = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-3xl',
  }[size];

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className={`tabular font-display font-semibold ${scale}`}>
        {formatPrice(value, i18n.language)}
      </span>

      {percent && (
        <>
          <span className="text-muted tabular text-sm line-through">
            {formatPrice(compareAt, i18n.language)}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-ember-400)',
              color: 'var(--color-ink-950)',
            }}
          >
            {t('product.savePercent', { percent })}
          </span>
        </>
      )}
    </div>
  );
}

export default Price;
