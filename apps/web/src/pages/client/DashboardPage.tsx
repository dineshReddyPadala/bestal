import { getClientDashboard } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Avatar, PageHeader, SearchInput, StatusBadge } from '@bestal/ui';
import {
  Briefcase,
  Calendar,
  ChevronRight,
  FlaskConical,
  Heart,
  Mail,
  Phone,
  Rocket,
  Sparkles,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PremiumStatCard } from '../../components/admin/PremiumStatCard';
import { RecommendedCandidatesCarousel } from '../../components/client/RecommendedCandidatesCarousel';
import { DEMO_CLIENT_ID, DEMO_USER } from '../../lib/demo-client';

const statIcons: Record<string, React.ReactNode> = {
  recommended: <Sparkles className="h-5 w-5" />,
  shortlisted: <Heart className="h-5 w-5" />,
  interviews: <Calendar className="h-5 w-5" />,
  trials: <FlaskConical className="h-5 w-5" />,
  deployments: <Rocket className="h-5 w-5" />,
};

const statAccents: Record<string, 'brand' | 'emerald' | 'amber' | 'violet' | 'rose' | 'sky'> = {
  recommended: 'violet',
  shortlisted: 'rose',
  interviews: 'sky',
  trials: 'amber',
  deployments: 'emerald',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const dashboard = useMemo(() => getClientDashboard(DEMO_CLIENT_ID), []);

  function handleQuickSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/client/search?q=${encodeURIComponent(q)}` : '/client/search');
  }

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title={`Welcome back, ${DEMO_USER.name.split(' ')[0]}`}
        description={`${DEMO_USER.company} — your talent engagement hub`}
      />

      <div className="space-y-8 p-4 sm:p-6">
        {/* Stat cards */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {dashboard.stats.map((stat) => (
              <PremiumStatCard
                key={stat.id}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                changeLabel={stat.changeLabel}
                icon={statIcons[stat.id]}
                accent={statAccents[stat.id] ?? 'brand'}
              />
            ))}
          </div>
        </section>

        {/* Quick search */}
        <section className="rounded-xl border border-border/80 bg-gradient-to-br from-brand/5 to-background p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="h-4 w-4 text-brand" />
            Quick Search
          </h2>
          <form onSubmit={handleQuickSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              placeholder="Search by skill, role, or candidate name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              className="max-w-xl flex-1"
            />
            <Link
              to="/client/search"
              className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Browse all talent
            </Link>
          </form>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Recommended carousel — spans 2 cols */}
          <section className="xl:col-span-2">
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recommended Candidates</h2>
                <Link
                  to="/client/search"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <RecommendedCandidatesCarousel items={dashboard.recommendedCandidates} />
            </div>
          </section>

          {/* Account manager */}
          <section>
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-navy/5 to-brand/5 p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Account Manager
              </h2>
              <div className="flex flex-col items-center text-center">
                <Avatar
                  name={dashboard.accountManager.name}
                  src={dashboard.accountManager.photoUrl}
                  size="lg"
                  className="h-20 w-20"
                />
                <p className="mt-3 text-lg font-semibold">{dashboard.accountManager.name}</p>
                <p className="text-sm text-muted-foreground">{dashboard.accountManager.title}</p>
                <div className="mt-4 w-full space-y-2 text-left text-sm">
                  <a
                    href={`mailto:${dashboard.accountManager.email}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-brand"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {dashboard.accountManager.email}
                  </a>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {dashboard.accountManager.phone}
                  </p>
                </div>
                <Link
                  to="/client/search"
                  className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-muted"
                >
                  Request talent briefing
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent interviews */}
          <section className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <h2 className="flex items-center gap-2 font-semibold">
                <Calendar className="h-4 w-4 text-brand" />
                Recent Interviews
              </h2>
              <Link to="/client/interviews" className="text-xs font-medium text-brand hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-border/60">
              {dashboard.recentInterviews.map((interview) => (
                <li key={interview.id} className="px-4 py-3 hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/client/candidates/${interview.candidateId}`}
                        className="font-medium hover:text-brand"
                      >
                        {interview.candidateName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {interview.type.replace('_', ' ')} · {interview.interviewer}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {interview.scheduledAt ? formatDate(interview.scheduledAt) : 'Scheduling TBD'}
                      </p>
                    </div>
                    <StatusBadge status={interview.status} className="shrink-0 text-[10px]" />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent pilots */}
          <section className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <h2 className="flex items-center gap-2 font-semibold">
                <FlaskConical className="h-4 w-4 text-brand" />
                Recent Pilots
              </h2>
              <Link to="/client/trials" className="text-xs font-medium text-brand hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-border/60">
              {dashboard.recentPilots.map((pilot) => (
                <li key={pilot.id} className="px-4 py-3 hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/client/candidates/${pilot.candidateId}`}
                        className="font-medium hover:text-brand"
                      >
                        {pilot.candidateName}
                      </Link>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{pilot.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(pilot.startDate)} – {formatDate(pilot.endDate)} · {pilot.pilotType.replace('_', ' ')}
                      </p>
                    </div>
                    <StatusBadge status={pilot.status} className="shrink-0 text-[10px]" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent activity */}
          <section className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 shadow-sm">
            <div className="border-b border-border/60 px-4 py-3">
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            <ul className="divide-y divide-border/60">
              {dashboard.recentActivity.map((item) => (
                <li key={item.id} className="px-4 py-3 hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(item.timestamp)}</p>
                    </div>
                    <StatusBadge status={item.status} className="shrink-0 text-[10px]" />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent notifications */}
          <section className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 shadow-sm">
            <div className="border-b border-border/60 px-4 py-3">
              <h2 className="font-semibold">Recent Notifications</h2>
            </div>
            <ul className="divide-y divide-border/60">
              {dashboard.notifications.map((n) => (
                <li key={n.id} className="px-4 py-3 hover:bg-muted/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                      {n.type}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
