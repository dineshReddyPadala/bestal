import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { usePublicSkillCommunitiesList } from '../../hooks/api/useSkillCommunities';
import { cn } from '@bestal/shared-utils';
import { Button, EmptyState, useDashboardHeaderLeading } from '@bestal/ui';
import { ArrowLeft, Home, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClientCandidateSearchCard } from '../../components/client/ClientCandidateSearchCard';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { ClientCandidateSearchTable } from '../../components/client/ClientCandidateSearchTable';
import { ClientSkillCommunityGrid } from '../../components/client/ClientSkillCommunityGrid';
import {
  ClientSearchToolbar,
  type ClientSearchViewMode,
} from '../../components/client/ClientSearchToolbar';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import {
  hasBlockingTrialForCandidate,
} from '../../lib/client-engagement-gates';
import {
  DEFAULT_CLIENT_SEARCH_FILTERS,
  DEFAULT_CLIENT_SEARCH_SORT,
  filterClientSearchRecords,
  sortClientSearchRecords,
  uniqueSorted,
  type ClientSearchFilters,
  type ClientSearchSort,
} from '../../lib/client-search';
import type { TrialRequestFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../../components/ui/ToastHost';

const VIEW_MODE_STORAGE_KEY = 'client-search-view-mode';

function readStoredViewMode(): ClientSearchViewMode {
  if (typeof window === 'undefined') return 'list';
  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  return stored === 'cards' ? 'cards' : 'list';
}

function parseCommunityId(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function CandidateSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { addRequest: addTrialRequest, trials } = useClientTrialRequests();
  const canRequestTrialBase = user?.clientId != null;

  const selectedCommunityId = parseCommunityId(searchParams.get('communityId'));
  const { data: communities = [], isLoading: communitiesLoading } = usePublicSkillCommunitiesList();
  const selectedCommunity = useMemo(
    () => communities.find((community) => community.id === selectedCommunityId) ?? null,
    [communities, selectedCommunityId],
  );

  const [filters, setFilters] = useState<ClientSearchFilters>(() => ({
    ...DEFAULT_CLIENT_SEARCH_FILTERS,
    query: searchParams.get('q') ?? '',
  }));
  const [sort, setSort] = useState<Exclude<ClientSearchSort, 'best-match'>>(
    DEFAULT_CLIENT_SEARCH_SORT,
  );
  const [viewMode, setViewMode] = useState<ClientSearchViewMode>(() => readStoredViewMode());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [trialDialog, setTrialDialog] = useState<{
    ids: number[];
    label: string;
  } | null>(null);

  const searchParam = filters.query.trim() || undefined;
  const { data: apiCandidates, isLoading } = useCandidatesList(
    {
      limit: 100,
      sort: '-publishedAt',
      search: searchParam,
      primarySkillCommunityId: selectedCommunityId ?? undefined,
    },
    { enabled: selectedCommunityId != null },
  );

  const allRecords = useMemo(() => {
    return (apiCandidates?.data ?? []).map(mapApiCandidateToClientSearchRecord);
  }, [apiCandidates]);

  const timezoneOptions = useMemo(
    () => uniqueSorted(allRecords.map((r) => r.timezone).filter((tz) => tz !== 'Flexible')),
    [allRecords],
  );

  const filtered = useMemo(() => {
    const rows = filterClientSearchRecords(allRecords, filters);
    return sortClientSearchRecords(rows, sort);
  }, [allRecords, filters, sort]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const visible = new Set(filtered.map((record) => record.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  useEffect(() => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useDashboardHeaderLeading(
    useMemo(
      () => (
        <nav className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <Home className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-muted-foreground/60">/</span>
          {selectedCommunity ? (
            <>
              <button
                type="button"
                className="truncate hover:text-foreground"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('communityId');
                  setSearchParams(next);
                }}
              >
                Candidate Search
              </button>
              <span className="text-muted-foreground/60">/</span>
              <span className="truncate font-semibold text-foreground">{selectedCommunity.name}</span>
            </>
          ) : (
            <span className="truncate font-semibold text-foreground">Candidate Search</span>
          )}
        </nav>
      ),
      [searchParams, selectedCommunity, setSearchParams],
    ),
  );

  const selectedRecords = useMemo(
    () => filtered.filter((r) => selectedIds.has(r.id)),
    [filtered, selectedIds],
  );

  const eligibleSelectedRecords = useMemo(
    () =>
      selectedRecords.filter(
        (record) =>
          record.trialEligible &&
          !hasBlockingTrialForCandidate(record.id, trials),
      ),
    [selectedRecords, trials],
  );

  function selectCommunity(communityId: number) {
    const next = new URLSearchParams(searchParams);
    next.set('communityId', String(communityId));
    setSearchParams(next);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: number, next: boolean) {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  }

  function openTrialDialog(records: typeof filtered) {
    if (records.length === 0) return;
    setTrialDialog({
      ids: records.map((r) => r.id),
      label:
        records.length === 1
          ? records[0]!.fullName
          : `${records.length} candidates`,
    });
  }

  async function submitTrialRequest(values: TrialRequestFormValues) {
    if (!trialDialog) return;
    const records = filtered.filter((r) => trialDialog.ids.includes(r.id));
    try {
      await Promise.all(
        records.map((record) => addTrialRequest(record.id, record.fullName, values)),
      );
      show(
        `Free trial requested for ${records.length} candidate${
          records.length === 1 ? '' : 's'
        }`,
      );
      setSelectedIds(new Set());
      setTrialDialog(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Free trial request failed');
      throw err;
    }
  }

  const hasSelection = selectedIds.size > 0;
  const isListView = viewMode === 'list';

  if (!selectedCommunityId) {
    return (
      <div className="flex min-h-full flex-col p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Skill Communities</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Browse pre-vetted engineers by discipline. Select a community to view matching
            candidates.
          </p>
        </div>
        <ClientSkillCommunityGrid
          communities={communities}
          isLoading={communitiesLoading}
          onSelect={(community) => selectCommunity(community.id)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col',
        isListView
          ? 'h-[calc(100svh-var(--shell-header-h))] min-h-0 overflow-hidden'
          : 'min-h-full',
        hasSelection && !isListView && 'pb-2',
      )}
    >
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />

      <div
        className={cn(
          isListView
            ? 'flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6'
            : 'flex-1 space-y-4 p-4 sm:p-6',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 -ml-2 gap-1.5"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('communityId');
                setSearchParams(next);
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              All communities
            </Button>
            <h1 className="font-display text-xl font-semibold text-foreground">
              {selectedCommunity?.name ?? 'Candidates'}
            </h1>
            {selectedCommunity?.description ? (
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {selectedCommunity.description}
              </p>
            ) : null}
          </div>
        </div>

        <ClientSearchToolbar
          filters={filters}
          onChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filtered.length}
          timezoneOptions={timezoneOptions}
          className={isListView ? 'shrink-0' : undefined}
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading talent pool…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No candidates match your filters"
          />
        ) : isListView ? (
          <ClientCandidateSearchTable
            records={filtered}
            selectedIds={selectedIds}
            onSelectedChange={toggleSelected}
            onView={(id) => navigate(`/client/candidates/${id}`)}
            fillHeight
            className="min-h-0 flex-1"
          />
        ) : (
          <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((record) => {
              const trialRequested =
                canRequestTrialBase &&
                hasBlockingTrialForCandidate(record.id, trials);

              return (
              <ClientCandidateSearchCard
                key={record.id}
                record={record}
                canRequestTrial={canRequestTrialBase && !trialRequested}
                trialRequested={trialRequested}
                selected={selectedIds.has(record.id)}
                onSelectedChange={(next) => toggleSelected(record.id, next)}
                onView={() => navigate(`/client/candidates/${record.id}`)}
                onRequestTrial={() => openTrialDialog([record])}
              />
              );
            })}
          </div>
        )}
      </div>

      {hasSelection ? (
        <div className="sticky bottom-0 z-20 shrink-0 border-t border-border bg-background/95 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{selectedIds.size}</span> selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={!canRequestTrialBase || eligibleSelectedRecords.length === 0}
                onClick={() => openTrialDialog(eligibleSelectedRecords)}
              >
                Request Trial free ({eligibleSelectedRecords.length})
              </Button>
              {selectedIds.size === 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    const id = selectedRecords[0]?.id;
                    if (id) navigate(`/client/candidates/${id}`);
                  }}
                >
                  Profile
                  <ForwardArrow />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {trialDialog ? (
        <RequestTrialDialog
          open
          onClose={() => setTrialDialog(null)}
          candidateName={trialDialog.label}
          onSubmit={submitTrialRequest}
        />
      ) : null}
    </div>
  );
}
