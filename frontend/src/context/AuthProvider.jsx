import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './context.js';
import { authApi } from '../services/api.js';
import {
  TOKEN_KEY,
  SESSION_EXPIRED_EVENT,
} from '../services/axiosInstance.js';

function AuthProvider({ children }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurarea sesiunii la încărcare: dacă tokenul e expirat, `me` întoarce
  // 401 și îl scoatem, ca utilizatorul să pornească într-o stare coerentă.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setIsLoading(false);
      return;
    }

    let active = true;

    authApi
      .me()
      .then((data) => active && setUser(data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (active) setUser(null);
      })
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, []);

  // Expirarea din timpul sesiunii vine ca eveniment din interceptorul axios.
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      toast.info(t('auth.sessionExpired'));
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [t]);

  const signIn = useCallback(async (credentials) => {
    const { user: nextUser, token } = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signUp = useCallback(async (payload) => {
    const { user: nextUser, token } = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const saveCheckoutPrefs = useCallback(async (prefs) => {
    const updated = await authApi.saveCheckoutPrefs(prefs);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut,
      saveCheckoutPrefs,
    }),
    [user, isLoading, signIn, signUp, signOut, saveCheckoutPrefs]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
