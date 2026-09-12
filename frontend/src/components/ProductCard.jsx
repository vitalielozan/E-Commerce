import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductImage from './ProductImage.jsx';
import Price from './Price.jsx';
import Rating from './Rating.jsx';
import { SIZES } from '../services/images.js';
import { useCartFav } from '../hooks/useCartFav.js';

/**
 * Cardul urmează ordinea în care se cumpără efectiv un televizor: mai întâi
 * diagonala, apoi marca și modelul, apoi nota, apoi prețul. Diagonala e
 * suprapusă peste imagine pentru că e criteriul pe care ochiul îl caută
 * primul când parcurge o grilă.
 */
function ProductCard({ product, eager = false }) {
  const { t } = useTranslation();
  const { addToCart, toggleFavorite, cartProductIds, favoriteProductIds, isPending } =
    useCartFav();

  const inCart = cartProductIds.has(product._id);
  const isFavorite = favoriteProductIds.has(product._id);
  const busy = isPending(product._id);
  const outOfStock = product.stock === 0;

  return (
    <article className="surface-panel group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <Link
          to={`/products/${product.slug || product._id}`}
          className="block"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ProductImage
            src={product.image}
            alt={product.title}
            sizes={SIZES.card}
            eager={eager}
          />
        </Link>

        {product.screenSize && (
          <span
            className="tabular font-display absolute top-3 left-3 rounded-md px-2 py-1 text-sm font-semibold backdrop-blur-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-ink-950) 72%, transparent)',
              color: 'var(--color-ink-50)',
            }}
          >
            {product.screenSize}&Prime;
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product)}
          disabled={busy}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? t('product.removeFromFavorites', { title: product.title })
              : t('product.addToFavorites', { title: product.title })
          }
          className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur-sm transition-colors disabled:opacity-60"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--surface-panel) 85%, transparent)',
            color: isFavorite ? 'var(--color-signal-alert)' : 'var(--text-secondary)',
          }}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-muted text-xs font-medium tracking-wide">
          {product.brand}
        </p>

        <h3 className="font-display text-base leading-snug font-semibold">
          {/* Link-ul acoperă tot cardul, ca zona de clic să fie previzibilă. */}
          <Link
            to={`/products/${product.slug || product._id}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>

        <Rating value={product.ratingAverage} count={product.ratingCount} />

        <p className="text-secondary line-clamp-2 text-sm">{product.shortDesc}</p>

        <div className="mt-auto pt-3">
          <Price value={product.price} compareAt={product.compareAtPrice} />

          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={busy || inCart || outOfStock}
            className="relative z-10 mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed"
            style={{
              backgroundColor: inCart
                ? 'var(--surface-sunken)'
                : 'var(--color-ember-400)',
              color: inCart ? 'var(--text-secondary)' : 'var(--color-ink-950)',
              opacity: outOfStock ? 0.5 : 1,
            }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {!busy && inCart && <Check className="h-4 w-4" />}
            {outOfStock
              ? t('product.outOfStock')
              : inCart
                ? t('product.inCart')
                : t('product.addToCart')}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
