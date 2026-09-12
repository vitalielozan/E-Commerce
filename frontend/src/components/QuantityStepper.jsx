import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Selector de cantitate.
 *
 * Cifra e într-un <output> cu aria-live, ca utilizatorii de cititor de ecran
 * să audă noua valoare fără să reparcurgă rândul. Sub 1 butonul de scădere se
 * dezactivează: ștergerea liniei e o acțiune separată, cu alt nume.
 */
function QuantityStepper({ value, onChange, max = 99, disabled = false, label }) {
  const { t } = useTranslation();

  const step = (delta) => {
    const next = Math.min(max, Math.max(1, value + delta));
    if (next !== value) onChange(next);
  };

  const buttonStyle =
    'grid h-9 w-9 place-items-center rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg p-1"
      style={{ backgroundColor: 'var(--surface-sunken)' }}
      role="group"
      aria-label={label || t('cart.quantity')}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={disabled || value <= 1}
        className={buttonStyle}
        aria-label={t('cart.decreaseQuantity')}
      >
        <Minus className="h-4 w-4" />
      </button>

      <output
        className="tabular w-9 text-center text-sm font-semibold"
        aria-live="polite"
      >
        {value}
      </output>

      <button
        type="button"
        onClick={() => step(1)}
        disabled={disabled || value >= max}
        className={buttonStyle}
        aria-label={t('cart.increaseQuantity')}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default QuantityStepper;
