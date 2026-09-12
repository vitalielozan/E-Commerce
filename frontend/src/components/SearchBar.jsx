import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function SearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  // Câmpul reflectă adresa: revenirea pe o căutare nu trebuie să arate gol.
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const onSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={onSubmit} role="search" className="relative">
      <label htmlFor="site-search" className="sr-only">
        {t('nav.searchLabel')}
      </label>
      <Search
        className="text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t('nav.searchPlaceholder')}
        className="w-full rounded-lg py-2 pr-3 pl-9 text-sm outline-none"
        style={{
          backgroundColor: 'var(--surface-sunken)',
          color: 'var(--text-primary)'
        }}
      />
    </form>
  );
}

export default SearchBar;
