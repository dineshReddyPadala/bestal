import { skillCommunities } from '@bestal/mock-data';
import { Container } from '../../components/Container';
import { formatCurrency } from '@bestal/shared-utils';
import {
  Brain,
  CheckCircle,
  Cloud,
  Code,
  Database,
  Link as LinkIcon,
  Palette,
  Shield,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  cloud: Cloud,
  database: Database,
  brain: Brain,
  smartphone: Smartphone,
  shield: Shield,
  palette: Palette,
  'check-circle': CheckCircle,
  link: LinkIcon,
};

export function CommunitiesPage() {
  const featured = skillCommunities.filter((c) => c.featured);
  const others = skillCommunities.filter((c) => !c.featured);

  return (
    <>
      <section className="bg-navy py-16 text-white lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Skill Communities</h1>
            <p className="mt-4 text-lg text-white/75">
              Deep expertise across {skillCommunities.length} specialized domains — each with dedicated vetting standards.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <h2 className="mb-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Featured communities
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((community) => {
              const Icon = iconMap[community.icon] ?? Code;
              return (
                <article
                  key={community.id}
                  className="group rounded-2xl border border-border bg-card p-8 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-elevated"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light">
                    <Icon className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{community.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{community.description}</p>
                  <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6 text-center">
                    <div>
                      <dt className="text-xs text-muted-foreground">Talent</dt>
                      <dd className="mt-1 text-lg font-semibold text-foreground">
                        {community.candidateCount.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Open roles</dt>
                      <dd className="mt-1 text-lg font-semibold text-foreground">{community.activeJobs}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Avg rate</dt>
                      <dd className="mt-1 text-lg font-semibold text-foreground">
                        {formatCurrency(community.avgRate, community.currency)}/hr
                      </dd>
                    </div>
                  </dl>
                  <Link
                    to="/talent"
                    className="mt-6 inline-flex text-sm font-medium text-brand hover:text-brand-hover"
                  >
                    Browse talent →
                  </Link>
                </article>
              );
            })}
          </div>

          {others.length > 0 && (
            <>
              <h2 className="mb-8 mt-16 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                More communities
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {others.map((community) => {
                  const Icon = iconMap[community.icon] ?? Code;
                  return (
                    <article
                      key={community.id}
                      className="rounded-xl border border-border bg-card p-6 shadow-card"
                    >
                      <Icon className="h-5 w-5 text-brand" />
                      <h3 className="mt-4 font-semibold text-foreground">{community.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {community.candidateCount.toLocaleString()} talent · {community.activeJobs} roles
                      </p>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  );
}
