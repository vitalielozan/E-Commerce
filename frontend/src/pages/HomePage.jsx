import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import HeroSection from '../components/HeroSection.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/Skeletons.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { productsApi } from '../services/api.js';

/**
 * Pagina de start.
 *
 * Varianta anterioară amesteca lista la fiecare randare, deci produsele își
 * schimbau locul sub cursor. Aici fiecare secțiune are un criteriu stabil:
 * cel mai bine notate, respectiv reducerile curente.
 */
function HomePage() {
  const { t } = useTranslation();

  const [featured, setFeatured] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      productsApi.list({ sort: 'priceDesc', limit: 1 }),
      productsApi.list({ sort: 'rating', limit: 3 }),
      productsApi.list({ sort: 'newest', limit: 6 })
    ])
      .then(([flagship, rated, fresh]) => {
        if (!active) return;
        setFeatured(flagship.items[0] ?? null);
        setTopRated(rated.items);
        setNewest(fresh.items);
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-14">
      {loading ? (
        <div className="skeleton aspect-16/10 w-full rounded-2xl md:aspect-21/9" />
      ) : (
        <HeroSection product={featured} />
      )}

      <Section
        title={t('home.topRated')}
        description={t('home.topRatedHint')}
        to="/shop?sort=rating"
        linkLabel={t('home.viewAll')}
      >
        {loading ? (
          <ProductGridSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </Section>

      <Section
        title={t('home.newArrivals')}
        description={t('home.newArrivalsHint')}
        to="/shop"
        linkLabel={t('home.viewAll')}
      >
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {newest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, description, to, linkLabel, children }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-secondary mt-1 text-sm">{description}</p>
          )}
        </div>

        <Link
          to={to}
          className="text-sm font-semibold"
          style={{ color: 'var(--color-ember-500)' }}
        >
          {linkLabel}
        </Link>
      </div>

      {children}
    </section>
  );
}

export default HomePage;
