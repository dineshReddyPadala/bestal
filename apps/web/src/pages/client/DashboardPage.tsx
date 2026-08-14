import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { Avatar, Button, useDashboardHeaderLeading } from '@bestal/ui';
import {
  ArrowRight,
  Monitor,
  Rocket,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClientDashboardTalentRow } from '../../components/client/ClientDashboardTalentRow';
import { ClientPortalStatCard } from '../../components/client/ClientPortalStatCard';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useDeploymentsList } from '../../hooks/api/useDeployments';
import { useTrialsList, toTrialRow } from '../../hooks/api/useTrials';
import { useAuth } from '../../contexts/AuthContext';
import { mapApiCandidateToClientSearchRecord } from '../../lib/client-search-api';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clientId = user?.clientId ?? undefined;

  useDashboardHeaderLeading(
    useMemo(
      () => (
        <span className="text-base font-semibold tracking-tight text-foreground">Dashboard</span>
      ),
      [],
    ),
  );

  const candidates = useCandidatesList({ limit: 50, sort: '-bestalScore' });
  const trials = useTrialsList({ clientId, limit: 50, sort: '-createdAt' });
  const deployments = useDeploymentsList({ clientId, limit: 50, sort: '-createdAt' });

  const candidateRows = candidates.data?.data ?? [];
  const trialRows = (trials.data?.data ?? []).map((item) => toTrialRow(item));
  const deploymentRows = deployments.data?.data ?? [];

  const searchRecords = useMemo(
    () => candidateRows.map(mapApiCandidateToClientSearchRecord),
    [candidateRows],
  );


  const activeTrials = trialRows.filter((t) =>
    ['REQUESTED', 'APPROVED', 'IN_PROGRESS'].includes(t.status),
  );
  const activeDeployments = deploymentRows.filter((d) => d.status === 'ACTIVE');

  const monthlyRunRate = activeDeployments.reduce(
    (sum, d) => sum + (d.billingRate ?? 0) * (d.expectedHoursPerWeek ?? 40) * 4,
    0,
  );

  const benchComposition = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of searchRecords) {
      const key = record.primarySkillCommunityName || record.community || 'General';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [searchRecords]);

  const pipeline = {
    shortlisted: searchRecords.length,
    inEvaluation: searchRecords.filter(
      (r) => (r.evaluationStatus ?? '').toUpperCase() !== 'COMPLETED',
    ).length,
    trialRequested: trialRows.filter((t) => t.status === 'REQUESTED').length,
    deployed: deploymentRows.filter((d) =>
      ['ACTIVE', 'COMPLETED'].includes(d.status),
    ).length,
  };

  const recentActivity = useMemo(() => {
    const items: { id: string; label: string; time: string; tone: 'green' | 'amber' }[] = [];
    for (const trial of trialRows.slice(0, 5)) {
      items.push({
        id: `trial-${trial.id}`,
        label: `${trial.candidateName} trial ${trial.status === 'REQUESTED' ? 'requested' : trial.status.toLowerCase().replace('_', ' ')}`,
        time: timeAgo(trial.requestedAt ?? new Date().toISOString()),
        tone: 'green',
      });
    }
    for (const deployment of deploymentRows.slice(0, 3)) {
      items.push({
        id: `dep-${deployment.id}`,
        label: `${deployment.candidateName} deployment ${deployment.status.toLowerCase()}`,
        time: timeAgo(deployment.createdAt),
        tone: 'amber',
      });
    }
    return items.slice(0, 6);
  }, [trialRows, deploymentRows]);

  const firstName = user?.firstName?.trim() || 'there';

  return (
    <div className="scrollbar-thin min-h-full space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Welcome Back! {firstName}
          </h1>
        </div>
        <Button onClick={() => navigate('/client/search')}>Find talent</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ClientPortalStatCard
          label="Active Trials"
          value={pad2(activeTrials.length)}
          icon={<Monitor className="h-5 w-5" />}
          accent="green"
        />
        <ClientPortalStatCard
          label="Deployments"
          value={pad2(activeDeployments.length)}
          icon={<Rocket className="h-5 w-5" />}
          accent="amber"
        />
        <ClientPortalStatCard
          label="Monthly run rate"
          value={
            monthlyRunRate > 0
              ? formatCurrency(monthlyRunRate, 'USD').replace('.00', '')
              : '$0'
          }
          icon={<TrendingUp className="h-5 w-5" />}
          accent="blue"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Trials</h2>
              <p className="text-xs text-muted-foreground">Latest pilot requests</p>
            </div>
            <Link
              to="/client/trials"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              Browse <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {trialRows.slice(0, 5).map((trial) => (
              <div key={trial.id} className="flex items-center gap-3 py-2.5">
                <Avatar name={trial.candidateName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{trial.candidateName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {trial.roleTitle || 'Trial role'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {trial.startDate ? formatDate(trial.startDate) : 'TBD'}
                </span>
              </div>
            ))}
            {trialRows.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No trials yet.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Talents</h2>
              <p className="text-xs text-muted-foreground">Top published candidates</p>
            </div>
            <Link
              to="/client/search"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              Browse <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/60">
            {searchRecords.slice(0, 5).map((record) => (
              <ClientDashboardTalentRow
                key={record.id}
                id={record.id}
                name={record.fullName}
                subtitle={record.headline || record.role}
                score={record.bestalScore}
                rate={record.hourlyRate}
                currency={record.currency}
                photoUrl={record.photoUrl}
              />
            ))}
            {searchRecords.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No published candidates yet.</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground">Hiring Pipeline</h2>
          <p className="text-xs text-muted-foreground">This quarter</p>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Shortlisted', value: pipeline.shortlisted },
              { label: 'In Evaluation', value: pipeline.inEvaluation },
              { label: 'Trial Requested', value: pipeline.trialRequested },
              { label: 'Deployed', value: pipeline.deployed },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold tabular-nums">{pad2(item.value)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{
                      width: `${Math.min(100, (item.value / Math.max(pipeline.shortlisted, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Median time from shortlist to trial: 6 days
          </p>
        </section>

        <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Bench Composition</h2>
              <p className="text-xs text-muted-foreground">Vetted talent by designation</p>
            </div>
            <Link to="/client/search" className="text-xs font-medium text-brand hover:underline">
              View all →
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {benchComposition.map(([label, count]) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span className="truncate text-muted-foreground">{label}</span>
                <span className="font-semibold tabular-nums">{pad2(count)}</span>
              </li>
            ))}
            {benchComposition.length === 0 ? (
              <li className="text-sm text-muted-foreground">No bench data yet.</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">Updates from your account</p>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex gap-2 text-sm">
                <span
                  className={
                    item.tone === 'green'
                      ? 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500'
                      : 'mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500'
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
            {recentActivity.length === 0 ? (
              <li className="text-sm text-muted-foreground">No recent activity.</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
