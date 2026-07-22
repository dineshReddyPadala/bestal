import { getClientSearchRecordsLive } from '../../lib/client-search-overrides';
import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { subscribeApprovalChanges } from '../../lib/candidate-approval-overrides';
import { EmptyState, PageHeader, Select } from '@bestal/ui';
import { Grid3X3, List, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToptalCandidateCard } from '../../components/client/ToptalCandidateCard';
import { PremiumSearchFilters } from '../../components/client/PremiumSearchFilters';
import { RequestInterviewDialog } from '../../components/client/RequestInterviewDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useClientInterviewRequests, useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
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
  const { addRequest: addInterviewRequest } = useClientInterviewRequests();
  const { addRequest: addTrialRequest } = useClientTrialRequests();

  const [filters, setFilters] = useState<ClientSearchFilters>(() => ({
    ...DEFAULT_CLIENT_SEARCH_FILTERS,
    query: searchParams.get('q') ?? '',
  }));
  const [sort, setSort] = useState<ClientSearchSort>('best-match');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dialogCandidate, setDialogCandidate] = useState<{ id: number; name: string } | null>(null);
  const [dialogType, setDialogType] = useState<'interview' | 'trial' | null>(null);

  const [approvalTick, setApprovalTick] = useState(0);
  const { data: apiCandidates } = useCandidatesList({ limit: 100 });

  useEffect(() => subscribeApprovalChanges(() => setApprovalTick((t) => t + 1)), []);

  const allRecords = useMemo(() => {
    const apiRows = apiCandidates?.data?.map(mapApiCandidateToClientSearchRecord) ?? [];
    if (apiRows.length > 0) {
      return apiRows;
    }
    return getClientSearchRecordsLive();
  }, [apiCandidates, approvalTick]);

  const filtered = useMemo(() => {
    const rows = filterClientSearchRecords(allRecords, filters);
    return sortClientSearchRecords(rows, sort);
  }, [allRecords, filters, sort]);

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title="Candidate Search"
      />

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
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
            {countActiveFilters(filters) > 0 && (
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

        {filtered.length === 0 ? (
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
                onShortlist={() => toggleShortlist(record.id)}
                onInterview={() => {
                  setDialogCandidate({ id: record.id, name: record.fullName });
                  setDialogType('interview');
                }}
                onPilot={() => {
                  setDialogCandidate({ id: record.id, name: record.fullName });
                  setDialogType('trial');
                }}
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
                onShortlist={() => toggleShortlist(record.id)}
                onInterview={() => {
                  setDialogCandidate({ id: record.id, name: record.fullName });
                  setDialogType('interview');
                }}
                onPilot={() => {
                  setDialogCandidate({ id: record.id, name: record.fullName });
                  setDialogType('trial');
                }}
              />
            ))}
          </div>
        )}
      </div>

      {dialogCandidate && (
        <>
          <RequestInterviewDialog
            open={dialogType === 'interview'}
            onClose={() => setDialogType(null)}
            candidateName={dialogCandidate.name}
            onSubmit={(values) => {
              addInterviewRequest(dialogCandidate.id, dialogCandidate.name, values);
              show(`Interview requested — ${dialogCandidate.name} (demo)`);
              setDialogType(null);
            }}
          />
          <RequestTrialDialog
            open={dialogType === 'trial'}
            onClose={() => setDialogType(null)}
            candidateName={dialogCandidate.name}
            onSubmit={(values) => {
              addTrialRequest(dialogCandidate.id, dialogCandidate.name, values);
              show(`Trial requested — ${dialogCandidate.name} (demo)`);
              setDialogType(null);
            }}
          />
        </>
      )}
    </div>
  );
}
