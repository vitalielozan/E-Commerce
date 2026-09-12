import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { RowSkeleton } from '../components/Skeletons.jsx';
import { ordersApi } from '../services/api.js';
import { formatPrice, formatDate } from '../services/format.js';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

/** Istoricul comenzilor — înainte, o comandă plasată nu se salva nicăieri. */
function OrdersPage() {
  const { t, i18n } = useTranslation();
  const { user, isLoading: authLoading } = useAuthContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  usePageMeta({ title: t('orders.title') });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    ordersApi
      .list()
      .then((data) => active && setOrders(data))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [user]);

  if (authLoading || loading) return <RowSkeleton count={2} />;

  if (!user) {
    return (
      <EmptyState
        icon={Package}
        title={t('orders.signInTitle')}
        description={t('orders.signInHint')}
        actionLabel={t('nav.signIn')}
        actionTo="/login"
      />
    );
  }

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={t('orders.empty')}
        description={t('orders.emptyHint')}
        actionLabel={t('cart.startShopping')}
        actionTo="/shop"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold md:text-3xl">
        {t('orders.title')}
      </h1>

      <ul className="space-y-3" role="list">
        {orders.map((order) => (
          <li key={order._id}>
            <Link
              to={`/orders/${order._id}`}
              className="surface-panel flex flex-wrap items-center justify-between gap-4 p-5 transition-shadow hover:shadow-md"
            >
              <div>
                <p className="font-display tabular text-sm font-semibold">
                  {order.reference}
                </p>
                <p className="text-muted mt-0.5 text-xs">
                  {formatDate(order.createdAt, i18n.language)}
                  {' · '}
                  {t('orders.itemCount', {
                    count: order.items.reduce((n, i) => n + i.quantity, 0),
                  })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <StatusBadge status={order.status} />
                <span className="tabular font-display font-bold">
                  {formatPrice(order.total, i18n.language)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatusBadge({ status }) {
  const { t } = useTranslation();

  const palette = {
    paid: 'var(--color-signal-stock)',
    shipped: 'var(--color-ember-500)',
    delivered: 'var(--color-signal-stock)',
    pending: 'var(--text-muted)',
    cancelled: 'var(--color-signal-alert)',
  };

  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{
        color: palette[status] ?? 'var(--text-muted)',
        backgroundColor: `color-mix(in srgb, ${palette[status] ?? 'var(--text-muted)'} 14%, transparent)`,
      }}
    >
      {t(`orders.status.${status}`)}
    </span>
  );
}

export default OrdersPage;
