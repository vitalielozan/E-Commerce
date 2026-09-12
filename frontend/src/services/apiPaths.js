export const BASE_URL =
  import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api';

export const API_PATHS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    CHECKOUT_PREFS: '/auth/checkout-prefs'
  },
  PRODUCTS: {
    LIST: '/products',
    FACETS: '/products/facets',
    BY_BRAND: (brand) => `/products/brand/${encodeURIComponent(brand)}`,
    DETAIL: (id) => `/products/${id}`,
    RELATED: (id) => `/products/${id}/related`
  },
  CART: {
    ROOT: '/cart',
    ITEM: (id) => `/cart/${id}`
  },
  FAVORITES: {
    ROOT: '/favorites',
    TO_CART: '/favorites/to-cart',
    ITEM: (id) => `/favorites/${id}`
  },
  REVIEWS: {
    ROOT: '/reviews',
    FOR_PRODUCT: (productId) => `/reviews/${productId}`,
    ITEM: (reviewId) => `/reviews/${reviewId}`
  },
  ORDERS: {
    ROOT: '/orders',
    DETAIL: (id) => `/orders/${id}`
  }
};
