import { candidates } from '@bestal/mock-data';
import { EmptyState, PageHeader, SearchInput, TalentCard } from '@bestal/ui';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CandidatesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.skills.some((s) => s.skillCommunityName.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div>
      <PageHeader
        title="Candidates"
        description="Search and review vetted talent in your pipeline"
        actions={
          <SearchInput
            placeholder="Search by name, skill, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            className="w-72"
          />
        }
      />

      <div className="p-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="No candidates found"
            description="Try adjusting your search terms"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                status={candidate.status}
                skills={[...candidate.skills]}
                onView={() => navigate(`/recruiter/candidates/${candidate.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
