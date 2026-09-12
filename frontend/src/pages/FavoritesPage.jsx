import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ProductGridSkeleton } from '../components/Skeletons.jsx';
import { useCartFav } from '../hooks/useCartFav.js';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function FavoritesPage() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuthContext();
  const { favorites, isLoading } = useCartFav();

  usePageMeta({ title: t('favorites.title') });

  if (authLoading || isLoading) return <ProductGridSkeleton count={4} />;

  if (!user) {
    return (
      <EmptyState
        icon={Heart}
        title={t('favorites.signInTitle')}
        description={t('favorites.signInHint')}
        actionLabel={t('nav.signIn')}
        actionTo="/login"
      />
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t('favorites.empty')}
        description={t('favorites.emptyHint')}
        actionLabel={t('cart.startShopping')}
        actionTo="/shop"
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold md:text-3xl">
        {t('favorites.title')}
        <span className="text-muted ml-2 text-lg font-normal">
          ({favorites.length})
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites
          .filter((favorite) => favorite.product)
          .map((favorite) => (
            <ProductCard key={favorite._id} product={favorite.product} />
          ))}
      </div>
    </div>
  );
}

export default FavoritesPage;
