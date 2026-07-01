import { candidates, shortlists } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { Heart, ListChecks } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientCandidateCard } from '../../components/client/ClientCandidateCard';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { DEMO_CLIENT_ID } from '../../lib/demo-client';
import { getClientVisibleCandidates } from '../../lib/client-candidates';

export function ShortlistedCandidatesPage() {
  const navigate = useNavigate();
  const { shortlistedIds, toggleShortlist, isShortlisted } = useClientShortlist();
  const visible = getClientVisibleCandidates();

  const shortlistedCandidates = useMemo(
    () => visible.filter((c) => shortlistedIds.includes(c.id)),
    [visible, shortlistedIds],
  );

  const recruiterShortlists = shortlists.filter((s) => s.clientId === DEMO_CLIENT_ID);

  return (
    <div>
      <PageHeader
        title="Shortlisted Candidates"
        description="Your saved talent and recruiter-prepared shortlists"
      />

      <div className="space-y-8 p-4 sm:p-6">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">Your Shortlist ({shortlistedCandidates.length})</h2>
          </div>

          {shortlistedCandidates.length === 0 ? (
            <EmptyState
              icon={<Heart className="h-8 w-8" />}
              title="No shortlisted candidates"
              description="Save candidates from search to build your shortlist."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {shortlistedCandidates.map((candidate) => (
                <ClientCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  shortlisted={isShortlisted(candidate.id)}
                  onView={() => navigate(`/client/candidates/${candidate.id}`)}
                  onShortlist={() => toggleShortlist(candidate.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold">Recruiter Shortlists</h2>
          </div>

          {recruiterShortlists.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-8 w-8" />}
              title="No recruiter shortlists"
              description="Your BesTal team will share curated shortlists here."
            />
          ) : (
            <div className="grid gap-4">
              {recruiterShortlists.map((shortlist) => (
                <Card key={shortlist.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{shortlist.title}</h3>
                          <StatusBadge status={shortlist.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">{shortlist.jobTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Curated by {shortlist.createdBy} · {formatDate(shortlist.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {shortlist.entries.length} candidates
                      </span>
                    </div>

                    <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
                      {shortlist.entries.map((entry) => {
                        const candidate = candidates.find((c) => c.id === entry.candidateId);
                        if (!candidate) return null;
                        return (
                          <li
                            key={entry.candidateId}
                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium">
                                #{entry.rank} {entry.candidateName}
                              </p>
                              <p className="text-sm text-muted-foreground">{entry.notes}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate(`/client/candidates/${entry.candidateId}`)}
                              className="shrink-0 text-sm font-medium text-brand hover:underline"
                            >
                              View profile
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
