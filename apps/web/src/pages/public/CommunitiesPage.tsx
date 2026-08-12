import { PUBLIC_SKILL_COMMUNITIES } from '@bestal/shared-utils';
import { Container } from '../../components/Container';
import { PageMeta } from '../../components/PageMeta';
import { PAGE_SEO } from '../../lib/marketing-seo';
import { Brain, Cloud, Code, Database, Link as LinkIcon, Server, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'data-engineering': Database,
  'ai-genai': Brain,
  'cloud-devops': Cloud,
  'qa-automation': Shield,
  'full-stack': Code,
  sap: Server,
  servicenow: Server,
  salesforce: LinkIcon,
};

export function CommunitiesPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.communities.title} description={PAGE_SEO.communities.description} />
      <section className="border-b border-border bg-background py-16 lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Skill Communities
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Specialist talent pools across the enterprise technologies our clients hire most.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PUBLIC_SKILL_COMMUNITIES.map((community) => {
              const Icon = iconMap[community.slug] ?? Code;
              return (
                <article
                  key={community.slug}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">{community.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {community.description}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-16 rounded-2xl border border-border bg-muted/40 p-8 text-center lg:p-12">
            <h2 className="text-2xl font-bold text-foreground">Need a specific skill mix?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Tell us your role requirements and we will curate a shortlist from the right communities.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex h-11 items-center rounded-md bg-brand px-8 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Contact Us
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
