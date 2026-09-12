import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Heart, User, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import SearchBar from './SearchBar.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { useCartFav } from '../hooks/useCartFav.js';

function Header() {
  const { t } = useTranslation();
  const { user, signOut } = useAuthContext();
  const { cart, favorites } = useCartFav();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

  // Navigarea închide meniul; altfel rămâne deschis peste pagina nouă.
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  // Escape închide meniul și readuce focusul pe butonul care l-a deschis.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
    } hover:text-[var(--text-primary)]`;

  const links = [
    { to: '/shop', label: t('nav.shop') },
    { to: '/brands', label: t('nav.brands') },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        borderColor: 'var(--border-hairline)',
        backgroundColor: 'color-mix(in srgb, var(--surface-page) 88%, transparent)',
      }}
    >
      <a
        href="#main"
        className="sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        style={{
          backgroundColor: 'var(--color-ember-400)',
          color: 'var(--color-ink-950)',
        }}
      >
        {t('nav.skipToContent')}
      </a>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">
          TV<span style={{ color: 'var(--color-ember-400)' }}>-</span>Maxx
        </Link>

        <nav
          className="hidden items-center gap-5 md:flex"
          aria-label={t('nav.primary')}
        >
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <IconLink
            to="/favorites"
            icon={Heart}
            count={favorites.length}
            label={t('nav.favorites')}
          />
          <IconLink
            to="/cart"
            icon={ShoppingCart}
            count={cart.itemCount}
            label={t('nav.cart')}
          />

          <div className="hidden md:flex md:items-center md:gap-1">
            <ThemeToggle />
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-1">
                <IconLink to="/orders" icon={Package} label={t('nav.orders')} />
                <button
                  type="button"
                  onClick={signOut}
                  className="text-secondary rounded-md px-3 py-2 text-sm font-medium hover:text-[var(--text-primary)]"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-ember-400)',
                  color: 'var(--color-ink-950)',
                }}
              >
                <User className="h-4 w-4" aria-hidden="true" />
                {t('nav.signIn')}
              </Link>
            )}
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="text-secondary grid h-10 w-10 place-items-center rounded-md md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t md:hidden"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div className="space-y-1 px-4 py-4">
            <div className="pb-3">
              <SearchBar />
            </div>

            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block rounded-md px-2 py-2.5 text-sm font-medium"
              >
                {link.label}
              </NavLink>
            ))}

            {user && (
              <NavLink
                to="/orders"
                className="block rounded-md px-2 py-2.5 text-sm font-medium"
              >
                {t('nav.orders')}
              </NavLink>
            )}

            <div
              className="mt-3 flex items-center gap-2 border-t pt-3"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <ThemeToggle />
              <LanguageSwitcher />

              {user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="text-secondary ml-auto px-3 py-2 text-sm font-medium"
                >
                  {t('nav.signOut')}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: 'var(--color-ember-400)',
                    color: 'var(--color-ink-950)',
                  }}
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/** Pictogramă cu contor; contorul e citit prin eticheta accesibilă. */
function IconLink({ to, icon: Icon, count = 0, label }) {
  const showCount = count > 0;

  return (
    <NavLink
      to={to}
      className="text-secondary relative grid h-10 w-10 place-items-center rounded-md hover:text-[var(--text-primary)]"
      aria-label={showCount ? `${label} (${count})` : label}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {showCount && (
        <span
          className="tabular absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold"
          style={{
            backgroundColor: 'var(--color-ember-400)',
            color: 'var(--color-ink-950)',
          }}
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  );
}

export default Header;
