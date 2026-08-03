import { useEffect, useMemo, useState } from 'react';

/** Controlled search input + debounced value for server-side list queries. */
export function useDebouncedSearch(delayMs = 300) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), delayMs);
    return () => window.clearTimeout(handle);
  }, [searchInput, delayMs]);

  const searchParam = useMemo(
    () => (search ? { search } : ({} as { search?: string })),
    [search],
  );

  function clearSearch() {
    setSearchInput('');
    setSearch('');
  }

  return {
    searchInput,
    setSearchInput,
    search,
    clearSearch,
    searchParam,
  };
}
