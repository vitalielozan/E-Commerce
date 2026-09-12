import { Link } from 'react-router-dom';

/**
 * Ecran gol.
 *
 * Un ecran gol e o invitație la acțiune, nu un mesaj de eroare — de aceea
 * fiecare stare goală poartă și butonul care o rezolvă.
 */
function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }) {
  return (
    <div className="surface-panel mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-14 text-center">
      {Icon && (
        <div
          className="grid h-14 w-14 place-items-center rounded-full"
          style={{ backgroundColor: 'var(--surface-sunken)' }}
        >
          <Icon className="text-muted h-6 w-6" aria-hidden="true" />
        </div>
      )}

      <h2 className="font-display text-xl font-semibold">{title}</h2>

      {description && (
        <p className="text-secondary text-sm leading-relaxed">{description}</p>
      )}

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-ember-400)',
            color: 'var(--color-ink-950)'
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
