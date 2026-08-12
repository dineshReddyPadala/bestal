import { Container } from '../../components/Container';
import { PageMeta } from '../../components/PageMeta';
import { PAGE_SEO } from '../../lib/marketing-seo';
import { Award, Heart, Target, TrendingUp } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Quality over quantity',
    description:
      'Every BesTal professional has proven expertise through rigorous technical evaluations, external scorecards, and background verification.',
  },
  {
    icon: Heart,
    title: 'People first',
    description:
      'We invest in our talent network with ongoing skill development, fair compensation, and long-term career support.',
  },
  {
    icon: TrendingUp,
    title: 'Outcomes driven',
    description:
      'Success is measured by deployment longevity and client satisfaction — not placement volume.',
  },
  {
    icon: Award,
    title: 'Transparency',
    description:
      'Clients see evaluation scores, interview recordings, and background check status through our portal — no black boxes.',
  },
];

export function AboutPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.about.title} description={PAGE_SEO.about.description} />
      <section className="border-b border-border bg-background py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              About BesTal
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We&apos;re on a mission to connect the world&apos;s best companies with proven
              technology specialists.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container size="narrow">
          <div className="prose prose-lg mx-auto max-w-none text-muted-foreground">
            <p className="text-xl leading-relaxed text-foreground">
              BesTal was founded on a simple belief: hiring great talent shouldn&apos;t take six months.
            </p>
            <p className="mt-6 leading-relaxed">
              Our multi-stage vetting process — technical assessments, external evaluator scorecards,
              communication evaluations, and background verification — means you see the evidence
              before you interview. Companies get pre-qualified candidates. Professionals get
              meaningful opportunities.
            </p>
            <p className="mt-6 leading-relaxed">
              Today, BesTal connects enterprise clients with vetted specialists across Data &amp; AI,
              Cloud, SAP, ServiceNow, Salesforce, and security — with full scorecard and BGV
              transparency in every profile.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-muted/40 py-20 lg:py-28">
        <Container>
          <h2 className="text-center text-3xl font-bold text-foreground">Our values</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
