import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle.jsx';
import LanguageSwitcher from '../components/LanguageSwitcher.jsx';

/**
 * Cadrul paginilor de autentificare.
 *
 * Panoul din dreapta e o suprafață închisă, fără fotografie de stock: pe un
 * ecran de autentificare imaginea nu aduce nimic, iar formularul rămâne
 * singurul lucru de făcut acolo.
 */
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col px-6 py-8 md:w-[55%] md:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-bold">
            TV<span style={{ color: 'var(--color-ember-400)' }}>-</span>Maxx
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-secondary mt-1.5 mb-6 text-sm">{subtitle}</p>
          )}
          {children}
        </div>
      </div>

      <div
        className="relative hidden overflow-hidden md:block md:w-[45%]"
        style={{ backgroundColor: 'var(--color-ink-900)' }}
        aria-hidden="true"
      >
        {/* Dreptunghiuri în raport 16:9, suprapuse: forma unui perete de
            ecrane dintr-un showroom, redusă la geometrie. */}
        <div
          className="absolute top-[18%] left-[12%] aspect-[16/9] w-[55%] rounded-lg"
          style={{ backgroundColor: 'var(--color-ink-800)' }}
        />
        <div
          className="absolute top-[38%] left-[28%] aspect-[16/9] w-[62%] rounded-lg"
          style={{ backgroundColor: 'var(--color-ink-700)' }}
        />
        <div
          className="absolute top-[58%] left-[16%] aspect-[16/9] w-[48%] rounded-lg"
          style={{
            backgroundColor: 'var(--color-ember-400)',
            opacity: 0.9
          }}
        />
      </div>
    </div>
  );
}

export default AuthLayout;
