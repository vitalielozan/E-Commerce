import axiosInstance from './axiosInstance.js';
import { API_PATHS } from './apiPaths.js';

export const productsApi = {
  /** Listare filtrată; `params` se mapează direct pe query string-ul API-ului */
  list: (params = {}) =>
    axiosInstance
      .get(API_PATHS.PRODUCTS.LIST, { params })
      .then((r) => r.data),

  facets: () => axiosInstance.get(API_PATHS.PRODUCTS.FACETS).then((r) => r.data),

  byBrand: (brand) =>
    axiosInstance.get(API_PATHS.PRODUCTS.BY_BRAND(brand)).then((r) => r.data),

  detail: (id) =>
    axiosInstance.get(API_PATHS.PRODUCTS.DETAIL(id)).then((r) => r.data),

  related: (id) =>
    axiosInstance.get(API_PATHS.PRODUCTS.RELATED(id)).then((r) => r.data)
};

export const cartApi = {
  get: () => axiosInstance.get(API_PATHS.CART.ROOT).then((r) => r.data),

  add: (productId, quantity = 1) =>
    axiosInstance
      .post(API_PATHS.CART.ROOT, { productId, quantity })
      .then((r) => r.data),

  setQuantity: (itemId, quantity) =>
    axiosInstance
      .patch(API_PATHS.CART.ITEM(itemId), { quantity })
      .then((r) => r.data),

  remove: (itemId) =>
    axiosInstance.delete(API_PATHS.CART.ITEM(itemId)).then((r) => r.data),

  clear: () => axiosInstance.delete(API_PATHS.CART.ROOT).then((r) => r.data)
};

export const favoritesApi = {
  get: () => axiosInstance.get(API_PATHS.FAVORITES.ROOT).then((r) => r.data),

  add: (productId) =>
    axiosInstance
      .post(API_PATHS.FAVORITES.ROOT, { productId })
      .then((r) => r.data),

  toCart: (productId) =>
    axiosInstance
      .post(API_PATHS.FAVORITES.TO_CART, { productId })
      .then((r) => r.data),

  remove: (favoriteId) =>
    axiosInstance
      .delete(API_PATHS.FAVORITES.ITEM(favoriteId))
      .then((r) => r.data)
};

export const reviewsApi = {
  forProduct: (productId) =>
    axiosInstance
      .get(API_PATHS.REVIEWS.FOR_PRODUCT(productId))
      .then((r) => r.data),

  add: (payload) =>
    axiosInstance.post(API_PATHS.REVIEWS.ROOT, payload).then((r) => r.data),

  remove: (reviewId) =>
    axiosInstance.delete(API_PATHS.REVIEWS.ITEM(reviewId)).then((r) => r.data)
};

export const ordersApi = {
  create: (payload) =>
    axiosInstance.post(API_PATHS.ORDERS.ROOT, payload).then((r) => r.data),

  list: () => axiosInstance.get(API_PATHS.ORDERS.ROOT).then((r) => r.data),

  detail: (id) =>
    axiosInstance.get(API_PATHS.ORDERS.DETAIL(id)).then((r) => r.data)
};

export const authApi = {
  register: (payload) =>
    axiosInstance.post(API_PATHS.AUTH.REGISTER, payload).then((r) => r.data),

  login: (payload) =>
    axiosInstance.post(API_PATHS.AUTH.LOGIN, payload).then((r) => r.data),

  me: () => axiosInstance.get(API_PATHS.AUTH.ME).then((r) => r.data),

  saveCheckoutPrefs: (payload) =>
    axiosInstance
      .patch(API_PATHS.AUTH.CHECKOUT_PREFS, payload)
      .then((r) => r.data)
};
