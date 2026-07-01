import { candidates } from '@bestal/mock-data';
import { TalentCard } from '@bestal/ui';
import { Container } from '../../components/Container';

const publishedCandidates = candidates.filter((c) => c.visibility === 'PUBLISHED');

export function TalentPage() {
  return (
    <>
      <section className="bg-navy py-16 text-white lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Find Elite Talent</h1>
            <p className="mt-4 text-lg text-white/75">
              Browse our network of rigorously vetted professionals — only the top 3% make it through.
            </p>
            <p className="mt-2 text-sm text-white/50">
              {publishedCandidates.length} published profiles available
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {publishedCandidates.map((candidate) => (
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
                skills={[...candidate.skills]}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
