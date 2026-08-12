import { HOW_IT_WORKS_STEPS } from '@bestal/shared-utils';
import { Button } from '@bestal/ui';
import { Container } from '../../components/Container';
import { PageMeta } from '../../components/PageMeta';
import { PAGE_SEO } from '../../lib/marketing-seo';
import { Briefcase, CheckCircle2, Clock, UserCheck } from 'lucide-react';

const stepIcons = [Briefcase, UserCheck, Clock, CheckCircle2] as const;

export function HowItWorksPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.howItWorks.title} description={PAGE_SEO.howItWorks.description} />
      <section className="border-b border-border bg-background py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              How BesTal works
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              From role brief to pilot in four steps — continue only when you are satisfied.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-card py-20 lg:py-28">
        <Container>
          <div className="space-y-20">
            {HOW_IT_WORKS_STEPS.map((item, index) => {
              const Icon = stepIcons[index] ?? CheckCircle2;
              return (
                <div
                  key={item.step}
                  className={`flex flex-col gap-10 lg:flex-row lg:items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {item.step}
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <div className="flex h-48 w-48 items-center justify-center rounded-3xl bg-brand-light lg:h-64 lg:w-64">
                      <Icon className="h-20 w-20 text-brand" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-background py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground">Ready to get started?</h2>
            <p className="mt-3 text-muted-foreground">
              Start with a 20-hour pilot — no long-term commitment required.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to="/talent" size="lg">
                View Talent
              </Button>
              <Button to="/contact" size="lg" variant="outline">
                Start a Pilot
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
