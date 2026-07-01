import { companies, stats, testimonials } from '@bestal/mock-data';
import { Button } from '@bestal/ui';
import { Container } from '../../components/Container';
import { formatCurrency } from '@bestal/shared-utils';
import { ArrowRight, CheckCircle2, Shield, Star, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatStatValue(value: number | string, format?: string) {
  if (typeof value === 'string') return value;
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return `${value}%`;
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    default:
      return String(value);
  }
}

const heroStats = stats.slice(0, 4);
const featuredTestimonials = testimonials.filter((t) => t.featured);
const featuredCompanies = companies.filter((c) => c.featured);

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent" />
        <Container className="relative py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Shield className="h-4 w-4 text-brand-light" />
              Trusted by 340+ enterprise clients
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Hire the Top 3% of Talent
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
              BesTal connects you with rigorously vetted developers, designers, and specialists —
              screened by experts, ready to deliver from day one.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <Button size="lg" className="min-w-[200px] bg-white text-navy hover:bg-white/90">
                  Hire Talent
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px] border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  How It Works
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                No cost until you hire
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                12-day avg. time to hire
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                94% placement success
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-white py-16">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <div key={stat.id} className="text-center lg:text-left">
                <p className="text-3xl font-bold tracking-tight text-navy lg:text-4xl">
                  {formatStatValue(stat.value, stat.format)}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
                {stat.changeLabel && (
                  <p className="mt-1 text-xs text-muted-foreground">{stat.changeLabel}</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Value props */}
      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Why companies choose BesTal
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A rigorous vetting process that saves you months of interviewing — without sacrificing quality.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'Elite talent pool',
                description:
                  'Only 3% of applicants pass our multi-stage evaluation. Every candidate is proven at senior level.',
              },
              {
                icon: Zap,
                title: 'Speed without compromise',
                description:
                  'Receive curated shortlists within 48 hours. Average time from request to deployment: 12 days.',
              },
              {
                icon: Shield,
                title: 'Enterprise-grade compliance',
                description:
                  'Background checks, NDAs, and contracts handled end-to-end. SOC 2 aligned processes.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-8 shadow-card transition-shadow hover:shadow-elevated"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Trusted by industry leaders
            </h2>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {featuredTestimonials.map((t) => (
              <blockquote
                key={t.id}
                className="flex flex-col rounded-2xl border border-border bg-white p-8 shadow-card"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-base leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 flex items-center gap-4 border-t border-border pt-6">
                  <img
                    src={t.companyLogoUrl}
                    alt={t.company}
                    className="h-8 w-auto max-w-[80px] object-contain opacity-70"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t.authorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.authorTitle}, {t.company}
                    </p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </Container>
      </section>

      {/* Company logos */}
      <section className="border-y border-border py-16">
        <Container>
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Companies that hire through BesTal
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {featuredCompanies.map((company) => (
              <img
                key={company.id}
                src={company.logoUrl}
                alt={company.name}
                className="h-8 w-auto max-w-[120px] object-contain opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to build your dream team?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Tell us what you need. We&apos;ll deliver a curated shortlist of top-tier talent within 48 hours.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact">
                <Button size="lg" className="min-w-[200px] bg-white text-navy hover:bg-white/90">
                  Get Started
                </Button>
              </Link>
              <Link to="/talent">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px] border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  Browse Talent
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
