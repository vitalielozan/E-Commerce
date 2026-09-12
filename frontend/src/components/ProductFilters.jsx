import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { formatPrice } from '../services/format.js';

/**
 * Filtrele catalogului.
 *
 * Valorile vin din endpointul de facets, deci lista de mărci și diagonale
 * arată exact ce există în stoc — un filtru care nu întoarce niciodată nimic
 * e mai rău decât un filtru absent.
 */
function ProductFilters({ facets, value, onChange, onReset, resultCount }) {
  const { t, i18n } = useTranslation();

  const toggleBrand = (brand) => {
    const current = value.brand ? value.brand.split(',') : [];
    const next = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];

    onChange({ brand: next.join(',') || undefined });
  };

  const selectedBrands = value.brand ? value.brand.split(',') : [];
  const hasFilters =
    selectedBrands.length > 0 ||
    value.minSize ||
    value.maxPrice ||
    value.q;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold">
          {t('shop.filters')}
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-muted flex items-center gap-1 text-xs font-medium hover:text-[var(--text-primary)]"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            {t('shop.clearAll')}
          </button>
        )}
      </div>

      <p className="text-secondary tabular text-xs" aria-live="polite">
        {t('shop.resultCount', { count: resultCount ?? 0 })}
      </p>

      <fieldset>
        <legend className="mb-2.5 text-xs font-semibold">
          {t('shop.brand')}
        </legend>
        <div className="space-y-2">
          {(facets?.brands ?? []).map(({ brand, count }) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center gap-2.5 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="h-4 w-4 rounded"
                style={{ accentColor: 'var(--color-ember-400)' }}
              />
              <span className="flex-1">{brand}</span>
              <span className="text-muted tabular text-xs">{count}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2.5 text-xs font-semibold">
          {t('shop.screenSize')}
        </legend>
        <div className="flex flex-wrap gap-2">
          {(facets?.sizes ?? []).map((size) => {
            const active = Number(value.minSize) === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  onChange({ minSize: active ? undefined : size, maxSize: active ? undefined : size })
                }
                aria-pressed={active}
                className="tabular rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: active
                    ? 'var(--color-ember-400)'
                    : 'var(--border-hairline)',
                  backgroundColor: active
                    ? 'var(--color-ember-400)'
                    : 'transparent',
                  color: active ? 'var(--color-ink-950)' : 'var(--text-secondary)',
                }}
              >
                {size}&Prime;
              </button>
            );
          })}
        </div>
      </fieldset>

      {facets?.priceRange && (
        <fieldset>
          <legend className="mb-2.5 text-xs font-semibold">
            {t('shop.maxPrice')}
          </legend>
          <input
            type="range"
            min={facets.priceRange.min}
            max={facets.priceRange.max}
            step={50}
            value={value.maxPrice || facets.priceRange.max}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            className="w-full"
            style={{ accentColor: 'var(--color-ember-400)' }}
            aria-label={t('shop.maxPrice')}
          />
          <div className="text-muted tabular mt-1 flex justify-between text-xs">
            <span>{formatPrice(facets.priceRange.min, i18n.language)}</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatPrice(
                Number(value.maxPrice) || facets.priceRange.max,
                i18n.language
              )}
            </span>
          </div>
        </fieldset>
      )}
    </div>
  );
}

export default ProductFilters;
