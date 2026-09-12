import { useId, useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { passwordChecks } from '../services/helper.js';

/**
 * Câmp de parolă cu comutare a vizibilității.
 *
 * Când `showRequirements` e activ, cerințele sunt afișate din start și bifate
 * pe măsură ce sunt îndeplinite — mai util decât un mesaj de eroare care apare
 * abia după ce formularul a fost respins.
 */
function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  showRequirements = false,
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const requirementsId = useId();

  const checks = passwordChecks(value);
  const rules = [
    { key: 'length', label: t('auth.rules.length') },
    { key: 'uppercase', label: t('auth.rules.uppercase') },
    { key: 'lowercase', label: t('auth.rules.lowercase') },
    { key: 'digit', label: t('auth.rules.digit') },
    { key: 'special', label: t('auth.rules.special') },
  ];

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-describedby={showRequirements ? requirementsId : undefined}
          className="w-full rounded-lg px-3 py-2.5 pr-11 text-sm outline-none"
          style={{
            backgroundColor: 'var(--surface-sunken)',
            color: 'var(--text-primary)',
          }}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-muted absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md"
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {showRequirements && (
        <ul id={requirementsId} className="mt-2 space-y-1" role="list">
          {rules.map((rule) => {
            const met = checks[rule.key];
            return (
              <li
                key={rule.key}
                className="flex items-center gap-1.5 text-xs"
                style={{
                  color: met ? 'var(--color-signal-stock)' : 'var(--text-muted)',
                }}
              >
                <Check
                  className="h-3 w-3 shrink-0"
                  style={{ opacity: met ? 1 : 0.3 }}
                  aria-hidden="true"
                />
                {rule.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default PasswordInput;
