import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const sections = [
    {
      heading: t('footer.shop'),
      links: [
        { to: '/shop', label: t('nav.shop') },
        { to: '/brands', label: t('nav.brands') },
        { to: '/shop?sort=rating', label: t('footer.topRated') }
      ]
    },
    {
      heading: t('footer.account'),
      links: [
        { to: '/orders', label: t('nav.orders') },
        { to: '/favorites', label: t('nav.favorites') },
        { to: '/cart', label: t('nav.cart') }
      ]
    }
  ];

  return (
    <footer
      className="mt-16 border-t"
      style={{ borderColor: 'var(--border-hairline)' }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4 md:px-6">
        <div className="sm:col-span-2 md:col-span-2">
          <p className="font-display text-lg font-bold">
            TV<span style={{ color: 'var(--color-ember-400)' }}>-</span>Maxx
          </p>
          <p className="text-secondary mt-2 max-w-sm text-sm leading-relaxed">
            {t('footer.description')}
          </p>
        </div>

        {sections.map((section) => (
          <nav key={section.heading} aria-label={section.heading}>
            <h2 className="font-display mb-3 text-sm font-semibold">
              {section.heading}
            </h2>
            <ul className="space-y-2" role="list">
              {section.links.map((link) => (
                <li key={link.to + link.label}>
                  <Link
                    to={link.to}
                    className="text-secondary text-sm hover:text-[var(--text-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        className="border-t px-4 py-5 md:px-6"
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        <div className="text-muted mx-auto flex max-w-7xl flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} TV-Maxx. {t('footer.demoNotice')}</p>
          <p>{t('footer.photoCredit')}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
