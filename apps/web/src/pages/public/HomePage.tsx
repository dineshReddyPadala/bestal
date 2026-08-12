import {
  FOR_CLIENTS_BENEFITS,
  FOR_TALENT_BENEFITS,
  HOW_IT_WORKS_STEPS,
  PUBLIC_SKILL_COMMUNITIES,
} from '@bestal/shared-utils';
import { Button } from '@bestal/ui';
import { Container } from '../../components/Container';
import { PageMeta } from '../../components/PageMeta';
import { PAGE_SEO } from '../../lib/marketing-seo';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Globe,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stepIcons = [Briefcase, UserCheck, Clock, CheckCircle2] as const;
const clientIcons = [Globe, UserCheck, Shield, Sparkles, Zap] as const;
const talentIcons = [Clock, Globe, Sparkles, Users, Briefcase] as const;

export function HomePage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.home.title} description={PAGE_SEO.home.description} />
      <section className="relative overflow-hidden border-b border-border bg-background">
        <Container className="relative py-20 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Proven Talent. Ready to Perform.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              See the evidence. Then hire. Review external evaluator scorecards, background
              verification status, hourly rates, and US time-zone overlap before you interview.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button to="/talent" size="lg" className="min-w-[200px]">
                View Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button to="/contact" size="lg" variant="outline" className="min-w-[200px]">
                Start a Pilot
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-border bg-card py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How BesTal works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From role brief to pilot in days — with full transparency at every step.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((item, index) => {
              const Icon = stepIcons[index] ?? CheckCircle2;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/how-it-works"
              className="text-sm font-semibold text-brand hover:text-brand-hover"
            >
              Learn more about our process →
            </Link>
          </div>
        </Container>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Skill Communities
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Deep specialist pools across the technologies enterprises hire most.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PUBLIC_SKILL_COMMUNITIES.map((community) => (
              <Link
                key={community.slug}
                to="/communities"
                className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-brand">
                  {community.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {community.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-card py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              For Clients
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hire faster with confidence — every profile is verified before it reaches your team.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FOR_CLIENTS_BENEFITS.map((item, index) => {
              const Icon = clientIcons[index] ?? Shield;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-border bg-background p-6 shadow-card"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button to="/contact" size="lg">
              Talk to a Talent Strategist
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-background py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              For Talent
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join a vetted network of global technologists working with leading US enterprises.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FOR_TALENT_BENEFITS.map((item, index) => {
              const Icon = talentIcons[index] ?? Users;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button to="/contact" size="lg" variant="outline">
              Join the Network
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-brand py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to start your pilot?
            </h2>
            <p className="mt-4 text-lg text-white/85">
              View vetted profiles or tell us about your role — we respond within one business day.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                to="/talent"
                size="lg"
                className="min-w-[180px] bg-white text-brand hover:bg-white/90"
              >
                View Talent
              </Button>
              <Button
                to="/contact"
                size="lg"
                variant="outline"
                className="min-w-[180px] border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Start a Pilot
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
