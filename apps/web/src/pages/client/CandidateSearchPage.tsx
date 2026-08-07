import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { Button, EmptyState, PageHeader, Select } from '@bestal/ui';
import { Grid3X3, List, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToptalCandidateCard } from '../../components/client/ToptalCandidateCard';
import { PremiumSearchFilters } from '../../components/client/PremiumSearchFilters';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import {
  countActiveFilters,
  DEFAULT_CLIENT_SEARCH_FILTERS,
  filterClientSearchRecords,
  sortClientSearchRecords,
  uniqueSorted,
  type ClientSearchFilters,
  type ClientSearchSort,
} from '../../lib/client-search';
import { useDemoToast } from '../../lib/use-demo-toast';
import { cn } from '@bestal/shared-utils';

export function CandidateSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { message, show, showError } = useDemoToast();
  const { addRequest: addTrialRequest } = useClientTrialRequests();
  const canRequestTrial = user?.clientId != null;

  const [filters, setFilters] = useState<ClientSearchFilters>(() => ({
    ...DEFAULT_CLIENT_SEARCH_FILTERS,
    query: searchParams.get('q') ?? '',
  }));
  const [sort, setSort] = useState<ClientSearchSort>('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

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

  const selectedRecords = useMemo(
    () => filtered.filter((r) => selectedIds.has(r.id)),
    [filtered, selectedIds],
  );

  function toggleSelected(id: number, next: boolean) {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  }

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader title="Candidate Search" />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-6 sm:p-6">
        <aside className="w-full shrink-0 md:sticky md:top-4 md:w-72 lg:w-80">
          <PremiumSearchFilters
            layout="panel"
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
            communityOptions={communityOptions}
            timezoneOptions={timezoneOptions}
          />
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Loading candidates…'
                : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
              {!isLoading && countActiveFilters(filters) > 0 && (
                <span> · {countActiveFilters(filters)} filter(s) active</span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as ClientSearchSort)}
                className="h-9 w-44 text-sm"
              >
                <option value="best-match">Best Match</option>
                <option value="highest-score">Highest Score</option>
                <option value="lowest-rate">Lowest Rate</option>
                <option value="experience">Experience</option>
                <option value="availability">Availability</option>
              </Select>
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  className={cn(
                    'rounded-md p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={cn(
                    'rounded-md p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading talent pool…</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No candidates match your filters"
            />
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((record) => (
                <ToptalCandidateCard
                  key={record.id}
                  record={record}
                  layout="grid"
                  canRequestTrial={canRequestTrial}
                  selected={selectedIds.has(record.id)}
                  onSelectedChange={(next) => toggleSelected(record.id, next)}
                  onView={() => navigate(`/client/candidates/${record.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((record) => (
                <ToptalCandidateCard
                  key={record.id}
                  record={record}
                  layout="list"
                  canRequestTrial={canRequestTrial}
                  selected={selectedIds.has(record.id)}
                  onSelectedChange={(next) => toggleSelected(record.id, next)}
                  onView={() => navigate(`/client/candidates/${record.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {selectedIds.size} candidate{selectedIds.size === 1 ? '' : 's'} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
              <Button
                size="sm"
                disabled={!canRequestTrial}
                onClick={() => setBulkDialogOpen(true)}
              >
                Request free trial ({selectedIds.size})
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {bulkDialogOpen && (
        <RequestTrialDialog
          open
          onClose={() => setBulkDialogOpen(false)}
          candidateName={
            selectedRecords.length === 1
              ? selectedRecords[0]!.fullName
              : `${selectedRecords.length} candidates`
          }
          onSubmit={async (values) => {
            try {
              await Promise.all(
                selectedRecords.map((record) =>
                  addTrialRequest(record.id, record.fullName, values),
                ),
              );
              show(
                `Free trial requested for ${selectedRecords.length} candidate${
                  selectedRecords.length === 1 ? '' : 's'
                }`,
              );
              setSelectedIds(new Set());
              setBulkDialogOpen(false);
            } catch (err) {
              showError(err instanceof Error ? err.message : 'Free trial request failed');
              throw err;
            }
          }}
        />
      )}
    </div>
  );
}
