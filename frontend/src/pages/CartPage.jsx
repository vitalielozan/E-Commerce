import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductImage from '../components/ProductImage.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { RowSkeleton } from '../components/Skeletons.jsx';
import { SIZES } from '../services/images.js';
import { formatPrice } from '../services/format.js';
import { useCartFav } from '../hooks/useCartFav.js';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 19.99;

function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuthContext();
  const { cart, isLoading, setQuantity, removeFromCart, clearCart } = useCartFav();

  usePageMeta({ title: t('cart.title') });

  if (authLoading || isLoading) return <RowSkeleton count={3} />;

  if (!user) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={t('cart.signInTitle')}
        description={t('cart.signInHint')}
        actionLabel={t('nav.signIn')}
        actionTo="/login"
      />
    );
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={t('cart.empty')}
        description={t('cart.emptyHint')}
        actionLabel={t('cart.startShopping')}
        actionTo="/shop"
      />
    );
  }

  const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = cart.subtotal + shipping;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - cart.subtotal;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          {t('cart.title')}
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-muted text-sm font-medium hover:text-[var(--color-signal-alert)]"
        >
          {t('cart.clear')}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3" role="list">
          {cart.items.map((item) => (
            <li key={item._id} className="surface-panel flex gap-4 p-4">
              <Link
                to={`/products/${item.product.slug || item.product._id}`}
                className="w-28 shrink-0 sm:w-36"
              >
                <ProductImage
                  src={item.product.image}
                  alt={item.product.title}
                  sizes={SIZES.row}
                  className="rounded-lg"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-muted text-xs">{item.product.brand}</p>
                    <h2 className="font-display truncate text-sm font-semibold sm:text-base">
                      <Link to={`/products/${item.product.slug || item.product._id}`}>
                        {item.product.title}
                      </Link>
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item._id)}
                    className="text-muted shrink-0 rounded-md p-1.5 hover:text-[var(--color-signal-alert)]"
                    aria-label={t('cart.removeItem', { title: item.product.title })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(quantity) => setQuantity(item._id, quantity)}
                    max={Math.min(99, item.product.stock || 99)}
                    label={t('cart.quantityFor', { title: item.product.title })}
                  />

                  <div className="text-right">
                    <p className="tabular font-display font-semibold">
                      {formatPrice(item.lineTotal, i18n.language)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-muted tabular text-xs">
                        {t('cart.eachPrice', {
                          price: formatPrice(item.product.price, i18n.language),
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface-panel space-y-4 p-5">
            <h2 className="font-display text-base font-semibold">
              {t('cart.summary')}
            </h2>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-secondary">
                  {t('cart.subtotalFor', { count: cart.itemCount })}
                </dt>
                <dd className="tabular font-medium">
                  {formatPrice(cart.subtotal, i18n.language)}
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-secondary">{t('cart.shipping')}</dt>
                <dd className="tabular font-medium">
                  {shipping === 0
                    ? t('cart.freeShipping')
                    : formatPrice(shipping, i18n.language)}
                </dd>
              </div>

              <div
                className="flex justify-between border-t pt-3 text-base"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <dt className="font-semibold">{t('cart.total')}</dt>
                <dd className="tabular font-display font-bold">
                  {formatPrice(total, i18n.language)}
                </dd>
              </div>
            </dl>

            {shipping > 0 && (
              <p className="text-secondary text-xs leading-relaxed">
                {t('cart.freeShippingHint', {
                  amount: formatPrice(remainingForFreeShipping, i18n.language),
                })}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full rounded-lg px-5 py-3 text-sm font-semibold"
              style={{
                backgroundColor: 'var(--color-ember-400)',
                color: 'var(--color-ink-950)',
              }}
            >
              {t('cart.checkout')}
            </button>

            <Link
              to="/shop"
              className="text-secondary block text-center text-sm hover:text-[var(--text-primary)]"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
