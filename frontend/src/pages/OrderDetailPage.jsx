import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductImage from '../components/ProductImage.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { StatusBadge } from './OrdersPage.jsx';
import { ordersApi } from '../services/api.js';
import { formatPrice, formatDate } from '../services/format.js';
import { SIZES } from '../services/images.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function OrderDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Confirmarea apare doar când venim direct din checkout, nu de fiecare dată
  // când comanda e deschisă din istoric.
  const justPlaced = Boolean(location.state?.justPlaced);

  usePageMeta({ title: order ? order.reference : t('orders.title') });

  useEffect(() => {
    let active = true;

    ordersApi
      .detail(id)
      .then((data) => active && setOrder(data))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="skeleton h-96 w-full rounded-xl" />;
  if (error || !order) return <ErrorState message={t('orders.notFound')} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/orders"
        className="text-secondary flex w-fit items-center gap-1.5 text-sm font-medium hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t('orders.backToOrders')}
      </Link>

      {justPlaced && (
        <div
          className="surface-panel flex items-start gap-3 p-5"
          style={{
            borderColor: 'var(--color-signal-stock)',
            backgroundColor:
              'color-mix(in srgb, var(--color-signal-stock) 8%, var(--surface-panel))',
          }}
          role="status"
        >
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: 'var(--color-signal-stock)' }}
            aria-hidden="true"
          />
          <div>
            <p className="font-display font-semibold">
              {t('checkout.successTitle')}
            </p>
            <p className="text-secondary mt-1 text-sm">
              {t('checkout.successBody', { reference: order.reference })}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display tabular text-2xl font-bold">
            {order.reference}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {formatDate(order.createdAt, i18n.language)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <ul className="space-y-3" role="list">
        {order.items.map((item) => (
          <li key={item.product} className="surface-panel flex gap-4 p-4">
            <Link to={`/products/${item.product}`} className="w-24 shrink-0 sm:w-32">
              <ProductImage
                src={item.image}
                alt={item.title}
                sizes={SIZES.row}
                className="rounded-lg"
              />
            </Link>

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display truncate text-sm font-semibold">
                  {item.title}
                </h2>
                <p className="text-muted tabular mt-1 text-xs">
                  {t('orders.quantityAt', {
                    quantity: item.quantity,
                    price: formatPrice(item.unitPrice, i18n.language),
                  })}
                </p>
              </div>

              <span className="tabular shrink-0 font-semibold">
                {formatPrice(item.unitPrice * item.quantity, i18n.language)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="surface-panel space-y-3 p-5">
          <h2 className="font-display text-sm font-semibold">
            {t('orders.delivery')}
          </h2>
          <dl className="space-y-2.5 text-sm">
            <div>
              <dt className="text-muted text-xs">{t('checkout.shippingAddress')}</dt>
              <dd>{order.shippingAddress}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">{t('checkout.billingAddress')}</dt>
              <dd>{order.billingAddress}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs">{t('checkout.payment')}</dt>
              <dd className="tabular">
                {t('orders.cardEnding', { last4: order.cardLast4 })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="surface-panel space-y-3 p-5">
          <h2 className="font-display text-sm font-semibold">
            {t('checkout.orderSummary')}
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-secondary">{t('cart.subtotal')}</dt>
              <dd className="tabular">{formatPrice(order.subtotal, i18n.language)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-secondary">{t('cart.shipping')}</dt>
              <dd className="tabular">
                {order.shippingCost === 0
                  ? t('cart.freeShipping')
                  : formatPrice(order.shippingCost, i18n.language)}
              </dd>
            </div>
            <div
              className="flex justify-between border-t pt-2 text-base font-semibold"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <dt>{t('cart.total')}</dt>
              <dd className="tabular font-display">
                {formatPrice(order.total, i18n.language)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;
