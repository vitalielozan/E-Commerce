import axios from 'axios';
import { BASE_URL } from './apiPaths.js';

export const TOKEN_KEY = 'tvmaxx.token';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sesiunea expirată e semnalată prin eveniment, nu printr-un
// `window.location.href`: o redirectare brutală arunca utilizatorul din
// aplicație fără explicații și pierdea ruta pe care se afla.
export const SESSION_EXPIRED_EVENT = 'tvmaxx:session-expired';

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.startsWith('/auth/');

    if (status === 401 && !isAuthCall && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  }
);

/** Mesajul de eroare al serverului, cu revenire la unul generic. */
export function apiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (data?.details?.length) return data.details[0].message;
  return data?.message || fallback;
}

export default axiosInstance;
