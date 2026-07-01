import { shortlists } from '@bestal/mock-data';
import { useCallback, useEffect, useState } from 'react';
import { DEMO_CLIENT_ID } from '../lib/demo-client';

const STORAGE_KEY = `bestal-client-shortlist-${DEMO_CLIENT_ID}`;

function getSeedIds(): number[] {
  const ids = new Set<number>();
  shortlists
    .filter((s) => s.clientId === DEMO_CLIENT_ID)
    .forEach((s) => s.entries.forEach((e) => ids.add(e.candidateId)));
  return [...ids];
}

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as number[];
    return getSeedIds();
  } catch {
    return getSeedIds();
  }
}

export function useClientShortlist() {
  const [ids, setIds] = useState<number[]>(() => readIds());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const isShortlisted = useCallback((id: number) => ids.includes(id), [ids]);

  const toggleShortlist = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const addToShortlist = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromShortlist = useCallback((id: number) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  return { shortlistedIds: ids, isShortlisted, toggleShortlist, addToShortlist, removeFromShortlist };
}
