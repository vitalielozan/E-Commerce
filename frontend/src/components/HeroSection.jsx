import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ProductImage from './ProductImage.jsx';
import Price from './Price.jsx';
import { SIZES } from '../services/images.js';

/**
 * Deschiderea magazinului arată un televizor anume, nu o fotografie de stock
 * cu un strat întunecat peste ea: într-un showroom, primul lucru care îți
 * atrage atenția e un ecran aprins, cu eticheta lui de specificații alături.
 *
 * Produsul vine din catalog, deci pagina de start nu poate ajunge niciodată
 * să promoveze ceva ce nu mai există în stoc.
 */
function HeroSection({ product }) {
  const { t } = useTranslation();

  if (!product) return null;

  const highlights = Object.entries(product.specs ?? {}).slice(0, 3);

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundColor: 'var(--color-ink-900)' }}
    >
      <div className="grid items-center gap-8 p-6 md:p-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="order-2 space-y-5 lg:order-1">
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-ember-400)' }}
          >
            {product.brand}
          </p>

          <h1
            className="font-display text-3xl leading-[1.1] font-bold md:text-5xl"
            style={{ color: 'var(--color-ink-50)' }}
          >
            {product.title}
          </h1>

          <p
            className="max-w-prose text-base leading-relaxed"
            style={{ color: 'var(--color-ink-300)' }}
          >
            {product.shortDesc}
          </p>

          {highlights.length > 0 && (
            <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-1">
              {highlights.map(([label, value]) => (
                <div key={label}>
                  <dt
                    className="text-xs"
                    style={{ color: 'var(--color-ink-400)' }}
                  >
                    {label}
                  </dt>
                  <dd
                    className="tabular font-display text-sm font-semibold"
                    style={{ color: 'var(--color-ink-100)' }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="flex flex-wrap items-center gap-5 pt-2">
            <div style={{ color: 'var(--color-ink-50)' }}>
              <Price
                value={product.price}
                compareAt={product.compareAtPrice}
                size="lg"
              />
            </div>

            <Link
              to={`/products/${product.slug || product._id}`}
              className="rounded-lg px-6 py-3 text-sm font-semibold"
              style={{
                backgroundColor: 'var(--color-ember-400)',
                color: 'var(--color-ink-950)',
              }}
            >
              {t('home.viewProduct')}
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <ProductImage
            src={product.image}
            alt={product.title}
            sizes={SIZES.hero}
            eager
            className="rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
