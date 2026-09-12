import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Media notelor unui produs.
 *
 * Stelele sunt decorative — nota citită de un cititor de ecran vine din
 * eticheta textuală, nu din numărarea a cinci pictograme.
 */
function Rating({ value = 0, count = 0, size = 'sm', showCount = true }) {
  const { t } = useTranslation();
  const rounded = Math.round(value * 2) / 2;

  const px = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  if (!count) {
    return (
      <span className="text-muted text-xs">{t('reviews.noRatingYet')}</span>
    );
  }

  return (
    <span
      className="flex items-center gap-1.5"
      aria-label={t('reviews.ratingLabel', {
        value: value.toFixed(1),
        count,
      })}
    >
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={px}
            style={{
              color:
                star <= rounded
                  ? 'var(--color-ember-400)'
                  : 'var(--border-hairline)',
            }}
            fill={star <= rounded ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        ))}
      </span>

      <span className="tabular text-secondary text-xs" aria-hidden="true">
        {value.toFixed(1)}
        {showCount && ` (${count})`}
      </span>
    </span>
  );
}

export default Rating;
