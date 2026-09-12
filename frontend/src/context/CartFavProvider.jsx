import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { CartFavContext } from './context.js';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { cartApi, favoritesApi } from '../services/api.js';
import { apiErrorMessage } from '../services/axiosInstance.js';

const EMPTY_CART = { items: [], itemCount: 0, subtotal: 0 };

function CartFavProvider({ children }) {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const [cart, setCart] = useState(EMPTY_CART);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Ținem evidența produselor cu o operație în curs, ca butonul apăsat să
  // poată arăta că lucrează fără să blocheze restul paginii.
  const [pendingIds, setPendingIds] = useState(() => new Set());

  const withPending = useCallback(async (productId, action) => {
    setPendingIds((prev) => new Set(prev).add(productId));
    try {
      return await action();
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }, []);

  // Coșul și favoritele trăiesc pe server, deci se încarcă la autentificare și
  // se golesc la deconectare.
  useEffect(() => {
    if (!user) {
      setCart(EMPTY_CART);
      setFavorites([]);
      return;
    }

    let active = true;
    setIsLoading(true);

    Promise.all([cartApi.get(), favoritesApi.get()])
      .then(([cartData, favData]) => {
        if (!active) return;
        setCart(cartData);
        setFavorites(favData);
      })
      .catch(() => active && toast.error(t('notifications.loadFailed')))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [user, t]);

  const requireAuth = useCallback(() => {
    if (user) return true;
    toast.warning(t('notifications.loginRequired'));
    return false;
  }, [user, t]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!requireAuth()) return;

      await withPending(product._id, async () => {
        try {
          setCart(await cartApi.add(product._id, quantity));
          toast.success(t('notifications.addedToCart', { title: product.title }));
        } catch (error) {
          toast.error(apiErrorMessage(error, t('notifications.failedAddToCart')));
        }
      });
    },
    [requireAuth, withPending, t]
  );

  const setQuantity = useCallback(
    async (itemId, quantity) => {
      try {
        setCart(await cartApi.setQuantity(itemId, quantity));
      } catch (error) {
        toast.error(apiErrorMessage(error, t('notifications.failedUpdateCart')));
      }
    },
    [t]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      try {
        setCart(await cartApi.remove(itemId));
        toast.success(t('notifications.removedFromCart'));
      } catch (error) {
        toast.error(apiErrorMessage(error, t('notifications.failedRemoveFromCart')));
      }
    },
    [t]
  );

  /** Din pagina produsului cunoaștem produsul, nu linia din coș. */
  const removeProductFromCart = useCallback(
    async (productId) => {
      const line = cart.items.find((item) => item.product._id === productId);
      if (!line) return;
      await removeFromCart(line._id);
    },
    [cart.items, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    try {
      setCart(await cartApi.clear());
    } catch (error) {
      toast.error(apiErrorMessage(error, t('notifications.failedClearCart')));
    }
  }, [t]);

  const toggleFavorite = useCallback(
    async (product) => {
      if (!requireAuth()) return;

      await withPending(product._id, async () => {
        const existing = favorites.find((f) => f.product?._id === product._id);

        try {
          if (existing) {
            await favoritesApi.remove(existing._id);
            setFavorites((prev) => prev.filter((f) => f._id !== existing._id));
            toast.success(t('notifications.removedFromFavorites'));
          } else {
            const saved = await favoritesApi.add(product._id);
            setFavorites((prev) => [saved, ...prev]);
            toast.success(t('notifications.addedToFavorites'));
          }
        } catch (error) {
          toast.error(apiErrorMessage(error, t('notifications.favoriteFailed')));
        }
      });
    },
    [favorites, requireAuth, withPending, t]
  );

  const moveFavoriteToCart = useCallback(
    async (product) => {
      if (!requireAuth()) return;

      await withPending(product._id, async () => {
        try {
          setCart(await favoritesApi.toCart(product._id));
          toast.success(t('notifications.addedToCart', { title: product.title }));
        } catch (error) {
          toast.error(apiErrorMessage(error, t('notifications.failedAddToCart')));
        }
      });
    },
    [requireAuth, withPending, t]
  );

  // Seturi de id-uri: căutarea în listă la fiecare card devine costisitoare
  // pe o grilă de 44 de produse.
  const cartProductIds = useMemo(
    () => new Set(cart.items.map((item) => item.product?._id)),
    [cart.items]
  );

  const favoriteProductIds = useMemo(
    () => new Set(favorites.map((f) => f.product?._id)),
    [favorites]
  );

  const value = useMemo(
    () => ({
      cart,
      favorites,
      isLoading,
      cartProductIds,
      favoriteProductIds,
      isPending: (productId) => pendingIds.has(productId),
      addToCart,
      setQuantity,
      removeFromCart,
      removeProductFromCart,
      clearCart,
      toggleFavorite,
      moveFavoriteToCart,
    }),
    [
      cart,
      favorites,
      isLoading,
      cartProductIds,
      favoriteProductIds,
      pendingIds,
      addToCart,
      setQuantity,
      removeFromCart,
      removeProductFromCart,
      clearCart,
      toggleFavorite,
      moveFavoriteToCart,
    ]
  );

  return (
    <CartFavContext.Provider value={value}>{children}</CartFavContext.Provider>
  );
}

export default CartFavProvider;
