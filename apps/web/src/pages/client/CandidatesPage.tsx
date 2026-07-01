import { candidates, shortlists } from '@bestal/mock-data';
import { EmptyState, PageHeader, SearchInput, TalentCard } from '@bestal/ui';
import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DEMO_CLIENT_ID } from '../../lib/demo-client';

export function CandidatesPage() {
  const [query, setQuery] = useState('');

  const shortlistedIds = useMemo(() => {
    const ids = new Set<number>();
    shortlists
      .filter((s) => s.clientId === DEMO_CLIENT_ID)
      .forEach((s) => s.entries.forEach((e) => ids.add(e.candidateId)));
    return ids;
  }, []);

  const publishedCandidates = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.visibility === 'PUBLISHED' &&
          c.approvalStatus === 'APPROVED' &&
          shortlistedIds.has(c.id),
      ),
    [shortlistedIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publishedCandidates;
    return publishedCandidates.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        c.skills.some((s) => s.skillCommunityName.toLowerCase().includes(q)),
    );
  }, [publishedCandidates, query]);

  return (
    <div>
      <PageHeader
        title="Candidates"
        description="Published, approved talent shared with your organization for review"
        actions={
          <SearchInput
            placeholder="Search by name, role, or skill…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
        }
      />

      <div className="p-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No candidates found"
            description={
              query
                ? 'Try adjusting your search terms.'
                : 'Approved candidates from your shortlists will appear here.'
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((candidate) => (
              <TalentCard
                key={candidate.id}
                firstName={candidate.firstName}
                lastName={candidate.lastName}
                headline={candidate.headline}
                location={candidate.location}
                yearsExperience={candidate.yearsExperience}
                expectedRate={candidate.expectedRate}
                currency={candidate.currency}
                photoUrl={candidate.photoUrl}
                status={candidate.approvalStatus}
                skills={[...candidate.skills]}
                onView={() => undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
