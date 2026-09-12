import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ImageCarousel from '../components/ImageCarousel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ReviewProduct from '../components/ReviewProduct.jsx';
import Price from '../components/Price.jsx';
import Rating from '../components/Rating.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import { ProductDetailSkeleton } from '../components/Skeletons.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { productsApi } from '../services/api.js';
import { useCartFav } from '../hooks/useCartFav.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function ProductPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const {
    addToCart,
    toggleFavorite,
    removeProductFromCart,
    cartProductIds,
    favoriteProductIds,
    isPending,
  } = useCartFav();

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setQuantity(1);

    productsApi
      .detail(id)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        return productsApi.related(data._id);
      })
      .then((rel) => active && rel && setRelated(rel))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(load, [load]);

  usePageMeta({
    title: product?.title,
    description: product?.shortDesc,
  });

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product) return <ErrorState onRetry={load} />;

  const inCart = cartProductIds.has(product._id);
  const isFavorite = favoriteProductIds.has(product._id);
  const busy = isPending(product._id);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const images = [product.image, ...(product.images ?? [])].filter(
    (src, index, arr) => src && arr.indexOf(src) === index
  );

  return (
    <div className="space-y-14">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-secondary flex items-center gap-1.5 text-sm font-medium hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('common.goBack')}
      </button>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ImageCarousel images={images} alt={product.title} />

        <div className="space-y-5">
          <div>
            <Link
              to={`/shop?brand=${encodeURIComponent(product.brand)}`}
              className="text-sm font-medium"
              style={{ color: 'var(--color-ember-500)' }}
            >
              {product.brand}
            </Link>
            <h1 className="font-display mt-1.5 text-3xl leading-tight font-bold md:text-4xl">
              {product.title}
            </h1>
          </div>

          <Rating value={product.ratingAverage} count={product.ratingCount} size="md" />

          <Price
            value={product.price}
            compareAt={product.compareAtPrice}
            size="lg"
          />

          <p className="text-secondary max-w-prose leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: outOfStock
                  ? 'var(--color-signal-alert)'
                  : 'var(--color-signal-stock)',
              }}
              aria-hidden="true"
            />
            <span className={outOfStock ? '' : 'text-secondary'}>
              {outOfStock
                ? t('product.outOfStock')
                : lowStock
                  ? t('product.lowStock', { count: product.stock })
                  : t('product.inStock')}
            </span>
          </div>

          {!outOfStock && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={Math.min(99, product.stock || 99)}
                disabled={inCart}
              />

              {inCart ? (
                <button
                  type="button"
                  onClick={() => removeProductFromCart(product._id)}
                  className="surface-panel flex flex-1 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {t('product.inCartRemove')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(product, quantity)}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-60"
                  style={{
                    backgroundColor: 'var(--color-ember-400)',
                    color: 'var(--color-ink-950)',
                  }}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  )}
                  {t('product.addToCartAction')}
                </button>
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
                className="surface-panel grid h-12 w-12 place-items-center"
                style={{
                  color: isFavorite
                    ? 'var(--color-signal-alert)'
                    : 'var(--text-secondary)',
                }}
              >
                <Heart
                  className="h-5 w-5"
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </div>
          )}

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="pt-3">
              <h2 className="font-display mb-3 text-sm font-semibold">
                {t('product.specifications')}
              </h2>
              <dl className="surface-panel divide-y overflow-hidden text-sm"
                  style={{ borderColor: 'var(--border-hairline)' }}>
                {Object.entries(product.specs).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 px-4 py-2.5"
                    style={{ borderColor: 'var(--border-hairline)' }}
                  >
                    <dt className="text-secondary">{label}</dt>
                    <dd className="tabular text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <ReviewProduct productId={product._id} onRatingChange={load} />

      {related.length > 0 && (
        <section className="space-y-5">
          <h2 className="font-display text-xl font-bold">
            {t('product.related')}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
