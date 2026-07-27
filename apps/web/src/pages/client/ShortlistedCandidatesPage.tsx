import { formatDate } from '@bestal/shared-utils';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Heart, ListChecks, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PickCandidateDialog } from '../../components/client/PickCandidateDialog';
import { ToptalCandidateCard } from '../../components/client/ToptalCandidateCard';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useShortlist, useShortlistsList } from '../../hooks/api/useShortlists';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { useAuth } from '../../contexts/AuthContext';
import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';
import { useDemoToast } from '../../lib/use-demo-toast';

export function ShortlistedCandidatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message, show } = useDemoToast();
  const {
    shortlistedIds,
    toggleShortlist,
    isShortlisted,
    addToShortlist,
    primaryShortlistId,
  } = useClientShortlist();
  const [pickerOpen, setPickerOpen] = useState(false);

  const clientId = user?.clientId ?? undefined;
  const { data: shortlistsData } = useShortlistsList(
    clientId ? { clientId, limit: 50 } : undefined,
  );
  const recruiterShortlists = (shortlistsData?.data ?? []).filter(
    (s) => s.id !== primaryShortlistId,
  );

  const { data: candidatesData } = useCandidatesList({ limit: 100 });
  const records = useMemo(
    () => (candidatesData?.data ?? []).map(mapApiCandidateToClientSearchRecord),
    [candidatesData],
  );

  const shortlistedRecords = useMemo(
    () => records.filter((r) => shortlistedIds.includes(r.id)),
    [records, shortlistedIds],
  );

  const primaryDetail = useShortlist(primaryShortlistId ?? 0);

  return (
    <div>
      <PageHeader title="Shortlisted Candidates" />

      {message && (
        <div className="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-8 p-4 sm:p-6">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-brand" />
              <h2 className="text-lg font-semibold">
                Your Shortlist ({shortlistedRecords.length})
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add candidate
            </Button>
          </div>

          {shortlistedRecords.length === 0 ? (
            <EmptyState
              icon={<Heart className="h-8 w-8" />}
              title="No shortlisted candidates"
              action={{ label: 'Add candidate', onClick: () => setPickerOpen(true) }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {shortlistedRecords.map((record) => (
                <ToptalCandidateCard
                  key={record.id}
                  record={record}
                  shortlisted={isShortlisted(record.id)}
                  layout="grid"
                  onView={() => navigate(`/client/candidates/${record.id}`)}
                  onShortlist={() => {
                    void toggleShortlist(record.id);
                  }}
                />
              ))}
            </div>
          )}

          {primaryDetail.data?.candidates?.length ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {primaryDetail.data.candidates.length} entr
              {primaryDetail.data.candidates.length === 1 ? 'y' : 'ies'} on “
              {primaryDetail.data.title}”
            </p>
          ) : null}
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">Other Shortlists</h2>
          </div>

          {recruiterShortlists.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-8 w-8" />}
              title="No additional shortlists"
            />
          ) : (
            <div className="grid gap-4">
              {recruiterShortlists.map((shortlist) => (
                <Card key={shortlist.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{shortlist.title}</h3>
                        <StatusBadge status={shortlist.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {shortlist.roleTitle ?? 'General'} · {shortlist.candidateCount} candidate
                        {shortlist.candidateCount === 1 ? '' : 's'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(shortlist.updatedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <PickCandidateDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add to shortlist"
        shortlistedIds={shortlistedIds}
        onSelect={(candidate) => {
          void addToShortlist(candidate.id).then(() => {
            show(`Added ${candidate.fullName} to shortlist`);
          });
        }}
      />
    </div>
  );
}
