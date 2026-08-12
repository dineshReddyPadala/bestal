import { candidates } from '@bestal/mock-data';
import { TalentCard } from '@bestal/ui';
import { Container } from '../../components/Container';
import { PageMeta } from '../../components/PageMeta';
import { PAGE_SEO } from '../../lib/marketing-seo';

const publishedCandidates = candidates.filter((c) => c.visibility === 'CLIENT_VISIBLE');

export function TalentPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.talent.title} description={PAGE_SEO.talent.description} />
      <section className="border-b border-border bg-background py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Find Proven Talent
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Browse vetted specialists with external evaluator scorecards, background verification
              status, hourly rates, and US time-zone overlap — before you interview.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
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
