import { useCallback, useEffect, useState } from 'react';

const SHORTLIST_KEY = 'bestal-sample-talent-shortlist';
const COMPARE_KEY = 'bestal-sample-talent-compare';
export const MAX_COMPARE = 3;

function readIds(key: string): string[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  sessionStorage.setItem(key, JSON.stringify(ids));
}

export function useSampleTalentShortlist() {
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(() => readIds(SHORTLIST_KEY));
  const [compareIds, setCompareIds] = useState<string[]>(() => readIds(COMPARE_KEY));

  useEffect(() => {
    writeIds(SHORTLIST_KEY, shortlistedIds);
  }, [shortlistedIds]);

  useEffect(() => {
    writeIds(COMPARE_KEY, compareIds);
  }, [compareIds]);

  const isShortlisted = useCallback(
    (id: string) => shortlistedIds.includes(id),
    [shortlistedIds],
  );

  const isInCompare = useCallback((id: string) => compareIds.includes(id), [compareIds]);

  const toggleShortlist = useCallback((id: string) => {
    setShortlistedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }, []);

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, id];
    });
  }, []);

  const removeFromShortlist = useCallback((id: string) => {
    setShortlistedIds((current) => current.filter((item) => item !== id));
  }, []);

  const removeFromCompare = useCallback((id: string) => {
    setCompareIds((current) => current.filter((item) => item !== id));
  }, []);

  const addManyToCompare = useCallback((ids: string[]) => {
    setCompareIds((current) => {
      const next = [...current];
      for (const id of ids) {
        if (next.length >= MAX_COMPARE) break;
        if (!next.includes(id)) next.push(id);
      }
      return next;
    });
  }, []);

  const clearShortlist = useCallback(() => setShortlistedIds([]), []);
  const clearCompare = useCallback(() => setCompareIds([]), []);

  return {
    shortlistedIds,
    compareIds,
    isShortlisted,
    isInCompare,
    toggleShortlist,
    toggleCompare,
    removeFromShortlist,
    removeFromCompare,
    addManyToCompare,
    clearShortlist,
    clearCompare,
    compareFull: compareIds.length >= MAX_COMPARE,
  };
}
