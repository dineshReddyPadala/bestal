import { Button } from '@bestal/ui';
import { Container } from '../../components/Container';
import { PageMeta } from '../../components/PageMeta';
import { PAGE_SEO } from '../../lib/marketing-seo';
import { Building2, Globe, Headphones, Lock, Scale, Users } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Dedicated talent strategists',
    description: 'A named account team that understands your tech stack, culture, and hiring velocity requirements.',
  },
  {
    icon: Scale,
    title: 'Flexible engagement models',
    description: 'Contract, permanent, temp-to-perm, and team augmentation — with unified billing and reporting.',
  },
  {
    icon: Lock,
    title: 'Enterprise security & compliance',
    description: 'SOC 2 aligned processes, background checks, NDAs, and IP assignment handled end-to-end.',
  },
  {
    icon: Globe,
    title: 'Global talent network',
    description: 'Access vetted professionals across North America, Europe, and LATAM with timezone overlap guarantees.',
  },
  {
    icon: Headphones,
    title: '24/7 client support',
    description: 'Priority SLA with dedicated Slack channel, quarterly business reviews, and escalation paths.',
  },
  {
    icon: Building2,
    title: 'Volume pricing & MSAs',
    description: 'Master service agreements, consolidated invoicing, and volume discounts for 10+ concurrent deployments.',
  },
];

export function EnterprisePage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.enterprise.title} description={PAGE_SEO.enterprise.description} />
      <section className="relative overflow-hidden border-b border-border bg-background py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">Enterprise</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Scale your team with confidence
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Enterprise teams trust BesTal for mission-critical hires. See external evaluator
              scorecards, BGV status, and transparent pricing on every shortlisted profile — with
              dedicated support at scale.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Built for enterprise scale</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to hire, onboard, and manage proven talent at organizational scale.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-border p-8 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-muted/40 py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground">Talk to our enterprise team</h2>
            <p className="mt-3 text-muted-foreground">
              Custom SLAs, volume pricing, and a dedicated onboarding plan for your organization.
            </p>
            <Button to="/contact" size="lg" className="mt-8">
              Request Enterprise Demo
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
