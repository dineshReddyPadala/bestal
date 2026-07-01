import { EmptyState, PageHeader } from '@bestal/ui';
import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CandidateFiltersPanel,
  MobileFilterButton,
} from '../../components/client/CandidateFiltersPanel';
import { ClientCandidateCard } from '../../components/client/ClientCandidateCard';
import { RequestInterviewDialog } from '../../components/client/RequestInterviewDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import {
  DEFAULT_FILTERS,
  filterCandidates,
  getClientVisibleCandidates,
  type CandidateFilters,
} from '../../lib/client-candidates';
import type { MockCandidate } from '@bestal/mock-data';

export function CandidateSearchPage() {
  const navigate = useNavigate();
  const { isShortlisted, toggleShortlist } = useClientShortlist();
  const [filters, setFilters] = useState<CandidateFilters>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dialogCandidate, setDialogCandidate] = useState<MockCandidate | null>(null);
  const [dialogType, setDialogType] = useState<'interview' | 'trial' | null>(null);

  const visible = useMemo(() => getClientVisibleCandidates(), []);
  const filtered = useMemo(
    () => filterCandidates(visible, filters),
    [visible, filters],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.community !== 'all') count++;
    if (filters.minExperience > 0) count++;
    if (filters.maxRate < 250) count++;
    if (filters.minScore > 0) count++;
    if (filters.availability !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <div>
      <PageHeader
        title="Candidate Search"
        description="Browse vetted, client-visible talent with advanced filters"
        actions={
          <MobileFilterButton
            onClick={() => setMobileFiltersOpen(true)}
            activeCount={activeFilterCount}
          />
        }
      />

      <div className="flex gap-6 p-4 sm:p-6">
        <CandidateFiltersPanel
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />

        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No candidates match your filters"
              description="Try adjusting search terms, rate, or community filters."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {filtered.map((candidate) => (
                <ClientCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  shortlisted={isShortlisted(candidate.id)}
                  onView={() => navigate(`/client/candidates/${candidate.id}`)}
                  onShortlist={() => toggleShortlist(candidate.id)}
                  onRequestInterview={() => {
                    setDialogCandidate(candidate);
                    setDialogType('interview');
                  }}
                  onRequestTrial={() => {
                    setDialogCandidate(candidate);
                    setDialogType('trial');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {dialogCandidate && (
        <>
          <RequestInterviewDialog
            open={dialogType === 'interview'}
            onClose={() => setDialogType(null)}
            candidateName={`${dialogCandidate.firstName} ${dialogCandidate.lastName}`}
          />
          <RequestTrialDialog
            open={dialogType === 'trial'}
            onClose={() => setDialogType(null)}
            candidateName={`${dialogCandidate.firstName} ${dialogCandidate.lastName}`}
          />
        </>
      )}
    </div>
  );
}
