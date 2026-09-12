import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Încarcă date dintr-o funcție asincronă, cu anulare la demontare.
 *
 * Hook-ul anterior aplica o întârziere fixă de 500 ms înainte de a stinge
 * starea de încărcare, ceea ce făcea fiecare pagină să pară mai lentă decât
 * era. Aici starea urmează cererea reală.
 */
export function useAsyncData(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    loaderRef
      .current()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  return { data, loading, error, reload };
}
