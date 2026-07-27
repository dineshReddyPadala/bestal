import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  useShortlist,
  useShortlistMutations,
  useShortlistsList,
} from './api/useShortlists';

const DEFAULT_TITLE = 'My Shortlist';

/**
 * Client portal shortlist helpers backed by the shortlists API.
 */
export function useClientShortlist() {
  const { user } = useAuth();
  const clientId = user?.clientId ?? undefined;
  const listQuery = useShortlistsList(
    clientId ? { clientId, limit: 50 } : undefined,
  );
  const mutations = useShortlistMutations();

  const shortlists = listQuery.data?.data ?? [];
  const primaryMeta = useMemo(() => {
    const open = shortlists.find(
      (s) => s.status === 'ACTIVE' || s.status === 'DRAFT',
    );
    return open ?? shortlists[0] ?? null;
  }, [shortlists]);

  const detailQuery = useShortlist(primaryMeta?.id ?? 0);
  const primary = detailQuery.data ?? null;

  const shortlistedIds = useMemo(
    () => primary?.candidates.map((c) => c.candidateId) ?? [],
    [primary],
  );

  const isShortlisted = useCallback(
    (id: number) => shortlistedIds.includes(id),
    [shortlistedIds],
  );

  const ensurePrimary = useCallback(async () => {
    if (!clientId) {
      throw new Error('Client account is required to manage shortlists');
    }
    if (primary) return primary;
    if (primaryMeta) {
      const { shortlistsApi } = await import('../lib/api/shortlists');
      return shortlistsApi.get(primaryMeta.id);
    }
    return mutations.create.mutateAsync({
      clientId,
      title: DEFAULT_TITLE,
      description: 'Default client shortlist',
    });
  }, [clientId, primary, primaryMeta, mutations.create]);

  const addToShortlist = useCallback(
    async (candidateId: number) => {
      const list = await ensurePrimary();
      if (list.candidates?.some((c) => c.candidateId === candidateId)) return;
      await mutations.addCandidate.mutateAsync({
        shortlistId: list.id,
        body: { candidateId },
      });
    },
    [ensurePrimary, mutations.addCandidate],
  );

  const removeFromShortlist = useCallback(
    async (candidateId: number) => {
      const list = await ensurePrimary();
      await mutations.removeCandidate.mutateAsync({
        shortlistId: list.id,
        candidateId,
      });
    },
    [ensurePrimary, mutations.removeCandidate],
  );

  const toggleShortlist = useCallback(
    async (candidateId: number) => {
      if (!clientId) return;
      const list = await ensurePrimary();
      const existing = list.candidates?.some((c) => c.candidateId === candidateId);
      if (existing) {
        await mutations.removeCandidate.mutateAsync({
          shortlistId: list.id,
          candidateId,
        });
      } else {
        await mutations.addCandidate.mutateAsync({
          shortlistId: list.id,
          body: { candidateId },
        });
      }
    },
    [clientId, ensurePrimary, mutations.addCandidate, mutations.removeCandidate],
  );

  return {
    shortlistedIds,
    isShortlisted,
    toggleShortlist,
    addToShortlist,
    removeFromShortlist,
    primaryShortlistId: primary?.id ?? primaryMeta?.id ?? null,
    isLoading: listQuery.isLoading || detailQuery.isLoading,
    shortlists,
  };
}
