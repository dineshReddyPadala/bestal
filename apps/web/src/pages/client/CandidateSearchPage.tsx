import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { EmptyState, PageHeader, Select } from '@bestal/ui';
import { Grid3X3, List, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToptalCandidateCard } from '../../components/client/ToptalCandidateCard';
import { PremiumSearchFilters } from '../../components/client/PremiumSearchFilters';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import {
  countActiveFilters,
  DEFAULT_CLIENT_SEARCH_FILTERS,
  filterClientSearchRecords,
  sortClientSearchRecords,
  type ClientSearchFilters,
  type ClientSearchSort,
} from '../../lib/client-search';
import { useDemoToast } from '../../lib/use-demo-toast';
import { cn } from '@bestal/shared-utils';

export function CandidateSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message, show } = useDemoToast();
  const { isShortlisted, toggleShortlist } = useClientShortlist();
  const { addRequest: addTrialRequest } = useClientTrialRequests();

  const [filters, setFilters] = useState<ClientSearchFilters>(() => ({
    ...DEFAULT_CLIENT_SEARCH_FILTERS,
    query: searchParams.get('q') ?? '',
  }));
  const [sort, setSort] = useState<ClientSearchSort>('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dialogCandidate, setDialogCandidate] = useState<{ id: number; name: string } | null>(
    null,
  );

  const { data: apiCandidates, isLoading } = useCandidatesList({ limit: 100 });

  const allRecords = useMemo(() => {
    return (apiCandidates?.data ?? []).map(mapApiCandidateToClientSearchRecord);
  }, [apiCandidates]);

  const filtered = useMemo(() => {
    const rows = filterClientSearchRecords(allRecords, filters);
    return sortClientSearchRecords(rows, sort);
  }, [allRecords, filters, sort]);

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader title="Candidate Search" />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-6 p-4 sm:p-6">
        <PremiumSearchFilters
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />

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
                  viewMode === 'grid' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted',
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
                  viewMode === 'list' ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted',
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((record) => (
              <ToptalCandidateCard
                key={record.id}
                record={record}
                shortlisted={isShortlisted(record.id)}
                layout="grid"
                onView={() => navigate(`/client/candidates/${record.id}`)}
                onShortlist={() => {
                  void toggleShortlist(record.id);
                }}
                onPilot={() => setDialogCandidate({ id: record.id, name: record.fullName })}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((record) => (
              <ToptalCandidateCard
                key={record.id}
                record={record}
                shortlisted={isShortlisted(record.id)}
                layout="list"
                onView={() => navigate(`/client/candidates/${record.id}`)}
                onShortlist={() => {
                  void toggleShortlist(record.id);
                }}
                onPilot={() => setDialogCandidate({ id: record.id, name: record.fullName })}
              />
            ))}
          </div>
        )}
      </div>

      {dialogCandidate && (
        <RequestTrialDialog
          open
          onClose={() => setDialogCandidate(null)}
          candidateName={dialogCandidate.name}
          onSubmit={(values) => {
            addTrialRequest(dialogCandidate.id, dialogCandidate.name, values);
            show(`Trial requested — ${dialogCandidate.name}`);
            setDialogCandidate(null);
          }}
        />
      )}
    </div>
  );
}
