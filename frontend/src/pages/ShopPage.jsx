import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductCard from '../components/ProductCard.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import { ProductGridSkeleton } from '../components/Skeletons.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { productsApi } from '../services/api.js';

const SORT_OPTIONS = ['newest', 'priceAsc', 'priceDesc', 'rating'];

/**
 * Catalogul.
 *
 * Filtrarea, sortarea și paginarea se fac pe server: varianta anterioară
 * descărca toate produsele și le filtra în browser, ceea ce nu ține pe măsură
 * ce catalogul crește. Starea filtrelor stă în adresa paginii, deci o căutare
 * filtrată poate fi trimisă mai departe ca link.
 */
function ShopPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = Object.fromEntries(searchParams);
  const page = Number(params.page) || 1;
  const query = params.q;

  useEffect(() => {
    productsApi.facets().then(setFacets).catch(() => setFacets(null));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    productsApi
      .list({ ...params, limit: 12 })
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Orice schimbare de filtru readuce la pagina 1: altfel poți rămâne pe
  // pagina 4 a unui set de rezultate care acum are două pagini.
  const updateFilters = useCallback(
    (changes) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      next.delete('page');
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    setSearchParams(next);
  }, [query, setSearchParams]);

  const goToPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterPanel = (
    <ProductFilters
      facets={facets}
      value={params}
      onChange={updateFilters}
      onReset={resetFilters}
      resultCount={data?.total}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold md:text-3xl">
            {query ? t('shop.resultsFor', { query }) : t('shop.title')}
          </h1>
          <p className="text-secondary mt-1 text-sm">{t('shop.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="surface-panel flex items-center gap-2 px-3 py-2 text-sm font-medium lg:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {t('shop.filters')}
          </button>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-secondary">{t('shop.sortBy')}</span>
            <select
              value={params.sort || 'newest'}
              onChange={(event) => updateFilters({ sort: event.target.value })}
              className="surface-panel cursor-pointer px-3 py-2 text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {t(`shop.sort.${option}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        {filtersOpen && (
          <div className="surface-panel p-4 lg:hidden">{filterPanel}</div>
        )}

        <div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : error ? (
            <ErrorState onRetry={() => setSearchParams(searchParams)} />
          ) : data?.items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={t('shop.noResults')}
              description={t('shop.noResultsHint')}
              actionLabel={t('shop.clearAll')}
              actionTo="/shop"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    eager={index < 3}
                  />
                ))}
              </div>

              {data.totalPages > 1 && (
                <nav
                  className="mt-10 flex items-center justify-center gap-2"
                  aria-label={t('shop.pagination')}
                >
                  <button
                    type="button"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="surface-panel px-4 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    {t('shop.previous')}
                  </button>

                  <span className="text-secondary tabular px-3 text-sm">
                    {t('shop.pageOf', {
                      page,
                      total: data.totalPages,
                    })}
                  </span>

                  <button
                    type="button"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= data.totalPages}
                    className="surface-panel px-4 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    {t('shop.next')}
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
