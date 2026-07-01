import { stats } from '@bestal/mock-data';
import { Button } from '@bestal/ui';
import { Container } from '../../components/Container';
import { Building2, Globe, Headphones, Lock, Scale, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const enterpriseClients = stats.find((s) => s.id === 'enterprise-clients');
  const activeDeployments = stats.find((s) => s.id === 'active-deployments');

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-20 text-white lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand/15 via-transparent to-transparent" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">Enterprise</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Scale your team with confidence
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75">
              Fortune 500 companies trust BesTal for mission-critical hires. Enterprise-grade processes,
              dedicated support, and the top 3% of global talent.
            </p>
            <div className="mt-10 flex justify-center gap-12">
              {enterpriseClients && (
                <div>
                  <p className="text-4xl font-bold">{enterpriseClients.value.toLocaleString()}+</p>
                  <p className="mt-1 text-sm text-white/60">{enterpriseClients.label}</p>
                </div>
              )}
              {activeDeployments && (
                <div>
                  <p className="text-4xl font-bold">{activeDeployments.value.toLocaleString()}+</p>
                  <p className="mt-1 text-sm text-white/60">{activeDeployments.label}</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy">Built for enterprise scale</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to hire, onboard, and manage elite talent at organizational scale.
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
            <h2 className="text-2xl font-bold text-navy">Talk to our enterprise team</h2>
            <p className="mt-3 text-muted-foreground">
              Custom SLAs, volume pricing, and a dedicated onboarding plan for your organization.
            </p>
            <Link to="/contact" className="mt-8 inline-block">
              <Button size="lg">Request Enterprise Demo</Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
