import { Container } from '../../components/Container';
import { ClipboardCheck, Rocket, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: 1,
    icon: Search,
    title: 'Tell us what you need',
    description:
      'Share your role requirements, tech stack, and team culture. Our talent strategists align on success criteria within 24 hours.',
    detail: 'Average kickoff call: 30 minutes',
  },
  {
    step: 2,
    icon: ClipboardCheck,
    title: 'Review curated shortlists',
    description:
      'Receive 3–5 pre-vetted candidates matched to your needs. Every profile includes evaluation scores, interview recordings, and references.',
    detail: 'Shortlists delivered in 48 hours',
  },
  {
    step: 3,
    icon: Rocket,
    title: 'Interview & deploy',
    description:
      'Schedule interviews through our client portal. Once you select a candidate, we handle contracts, onboarding, and ongoing support.',
    detail: 'Average time to deployment: 12 days',
  },
];

export function HowItWorksPage() {
  return (
    <>
      <section className="bg-navy py-16 text-white lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">How BesTal Works</h1>
            <p className="mt-4 text-lg text-white/75">
              From request to deployment in three simple steps — with a dedicated team supporting you throughout.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="space-y-24">
            {steps.map(({ step, icon: Icon, title, description, detail }, index) => (
              <div
                key={step}
                className={`flex flex-col gap-10 lg:flex-row lg:items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {step}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy">{title}</h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{description}</p>
                  <p className="mt-4 text-sm font-medium text-brand">{detail}</p>
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex h-48 w-48 items-center justify-center rounded-3xl bg-brand-light lg:h-64 lg:w-64">
                    <Icon className="h-20 w-20 text-brand" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-muted/40 py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-navy">Ready to get started?</h2>
            <p className="mt-3 text-muted-foreground">
              No upfront fees. Pay only when you hire.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Talk to a Talent Strategist
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
