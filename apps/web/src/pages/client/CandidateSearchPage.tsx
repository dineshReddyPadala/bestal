import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { cn } from '@bestal/shared-utils';
import { Button, EmptyState, useDashboardHeaderLeading } from '@bestal/ui';
import { Home, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClientCandidateSearchCard } from '../../components/client/ClientCandidateSearchCard';
import { ClientCandidateSearchTable } from '../../components/client/ClientCandidateSearchTable';
import {
  ClientSearchToolbar,
  type ClientSearchViewMode,
} from '../../components/client/ClientSearchToolbar';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
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

export function CandidateSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { addRequest: addTrialRequest } = useClientTrialRequests();
  const canRequestTrial = user?.clientId != null;

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
  const { data: apiCandidates, isLoading } = useCandidatesList({
    limit: 100,
    search: searchParam,
  });

  const allRecords = useMemo(() => {
    return (apiCandidates?.data ?? []).map(mapApiCandidateToClientSearchRecord);
  }, [apiCandidates]);

  const communityOptions = useMemo(
    () => uniqueSorted(allRecords.map((r) => r.community)),
    [allRecords],
  );
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
          <span className="truncate font-semibold text-foreground">Candidate Search</span>
        </nav>
      ),
      [],
    ),
  );

  const selectedRecords = useMemo(
    () => filtered.filter((r) => selectedIds.has(r.id)),
    [filtered, selectedIds],
  );

  const eligibleSelectedRecords = useMemo(
    () => selectedRecords.filter((record) => record.trialEligible),
    [selectedRecords],
  );

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
        <ClientSearchToolbar
          filters={filters}
          onChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filtered.length}
          communityOptions={communityOptions}
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
          <div className="grid auto-rows-[252px] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((record) => (
              <ClientCandidateSearchCard
                key={record.id}
                record={record}
                canRequestTrial={canRequestTrial}
                selected={selectedIds.has(record.id)}
                onSelectedChange={(next) => toggleSelected(record.id, next)}
                onView={() => navigate(`/client/candidates/${record.id}`)}
                onRequestTrial={() => openTrialDialog([record])}
              />
            ))}
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
                disabled={!canRequestTrial || eligibleSelectedRecords.length === 0}
                onClick={() => openTrialDialog(eligibleSelectedRecords)}
              >
                Request Trial free ({eligibleSelectedRecords.length})
              </Button>
              {selectedIds.size === 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const id = selectedRecords[0]?.id;
                    if (id) navigate(`/client/candidates/${id}`);
                  }}
                >
                  Profile →
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
