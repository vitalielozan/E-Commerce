import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ErrorState from '../components/ErrorState.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { productsApi } from '../services/api.js';
import { formatPrice } from '../services/format.js';
import { SIZES } from '../services/images.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

/**
 * Prezentarea mărcilor.
 *
 * Fiecare marcă apare cu numărul de modele și prețul de pornire — datele pe
 * care cineva le compară când alege de unde să înceapă — în locul unei simple
 * liste de nume.
 */
function BrandPage() {
  const { t, i18n } = useTranslation();

  const [brands, setBrands] = useState([]);
  const [covers, setCovers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  usePageMeta({ title: t('nav.brands') });

  useEffect(() => {
    let active = true;

    productsApi
      .facets()
      .then(async (facets) => {
        if (!active) return;
        setBrands(facets.brands);

        // Câte un produs reprezentativ per marcă, pentru imagine și preț.
        const entries = await Promise.all(
          facets.brands.map(async ({ brand }) => {
            const result = await productsApi.list({
              brand,
              sort: 'priceAsc',
              limit: 1,
            });
            return [brand, result.items[0]];
          })
        );

        if (active) setCovers(Object.fromEntries(entries));
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          {t('brands.title')}
        </h1>
        <p className="text-secondary mt-1 text-sm">{t('brands.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="surface-panel overflow-hidden">
                <div className="skeleton aspect-[16/9] w-full" />
                <div className="space-y-2 p-4">
                  <div className="skeleton h-5 w-24 rounded" />
                  <div className="skeleton h-3 w-32 rounded" />
                </div>
              </div>
            ))
          : brands.map(({ brand, count }) => {
              const cover = covers[brand];

              return (
                <Link
                  key={brand}
                  to={`/shop?brand=${encodeURIComponent(brand)}`}
                  className="surface-panel group overflow-hidden transition-shadow hover:shadow-lg"
                >
                  {cover && (
                    <ProductImage
                      src={cover.image}
                      alt={brand}
                      sizes={SIZES.card}
                    />
                  )}

                  <div className="p-4">
                    <h2 className="font-display text-lg font-semibold">{brand}</h2>
                    <p className="text-secondary mt-1 text-sm">
                      {t('brands.modelCount', { count })}
                      {cover && (
                        <>
                          {' · '}
                          <span className="tabular">
                            {t('brands.from', {
                              price: formatPrice(cover.price, i18n.language),
                            })}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
}

export default BrandPage;
