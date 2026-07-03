import {
  adminDashboardStats,
  candidatesByAvailability,
  candidatesByCommunity,
  candidatesByStatus,
  dashboardNotifications,
  latestAiScreenings,
  latestBgvUpdates,
  latestCandidateUploads,
  latestClientRequests,
  latestDeployments,
  latestEvaluations,
  latestTrialRequests,
  monthlyDeployments,
} from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import {
  Button,
  ChartCard,
  DeploymentBarChart,
  PageHeader,
  PipelineBarChart,
  StatusPieChart,
} from '@bestal/ui';
import {
  Award,
  Building2,
  ClipboardCheck,
  DollarSign,
  Eye,
  FileUp,
  FlaskConical,
  Percent,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  FileSpreadsheet,
  CheckCircle,
  Bell,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AdminKpi } from '@bestal/mock-data';
import { ActivityFeed } from '../../components/admin/ActivityFeed';
import { PremiumStatCard } from '../../components/admin/PremiumStatCard';
import { useDemoToast } from '../../lib/use-demo-toast';

function formatStatValue(kpi: AdminKpi) {
  if (kpi.id === 'avg-bestal-score') return String(kpi.value);
  if (kpi.format === 'currency' && typeof kpi.value === 'number') {
    return formatCurrency(kpi.value);
  }
  if (kpi.format === 'percent') return `${kpi.value}%`;
  if (typeof kpi.value === 'number') return kpi.value.toLocaleString();
  return String(kpi.value);
}

const statConfig: Record<
  string,
  { icon: React.ReactNode; accent: 'brand' | 'emerald' | 'amber' | 'violet' | 'rose' | 'sky' }
> = {
  'total-candidates': { icon: <Users className="h-5 w-5" />, accent: 'brand' },
  'client-visible': { icon: <Eye className="h-5 w-5" />, accent: 'sky' },
  'ai-screened': { icon: <Sparkles className="h-5 w-5" />, accent: 'violet' },
  'evaluation-pending': { icon: <ClipboardCheck className="h-5 w-5" />, accent: 'amber' },
  'bgv-pending': { icon: <ShieldCheck className="h-5 w-5" />, accent: 'rose' },
  'active-clients': { icon: <Building2 className="h-5 w-5" />, accent: 'emerald' },
  'trial-requests': { icon: <FlaskConical className="h-5 w-5" />, accent: 'amber' },
  deployments: { icon: <Rocket className="h-5 w-5" />, accent: 'brand' },
  'monthly-revenue': { icon: <DollarSign className="h-5 w-5" />, accent: 'emerald' },
  'monthly-margin': { icon: <Percent className="h-5 w-5" />, accent: 'emerald' },
  'avg-bestal-score': { icon: <Award className="h-5 w-5" />, accent: 'violet' },
};

const quickActions = [
  { label: 'Add Candidate', href: '/admin/candidates/new', icon: UserPlus, primary: true },
  { label: 'Import CSV', action: 'import-csv', icon: FileSpreadsheet },
  { label: 'Manage Clients', href: '/admin/clients', icon: Building2 },
  { label: 'Pending Approvals', href: '/admin/candidates', icon: CheckCircle },
  { label: 'View Deployments', href: '/admin/deployments', icon: Rocket },
];

export function DashboardPage() {
  const { message, show } = useDemoToast();

  return (
    <div className="min-h-full bg-muted/20">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview — talent pipeline, revenue, and real-time activity"
      />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-8 p-4 sm:p-6">
        {/* Top statistics */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Top Statistics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {adminDashboardStats.map((kpi) => {
              const cfg = statConfig[kpi.id] ?? { icon: null, accent: 'brand' as const };
              return (
                <PremiumStatCard
                  key={kpi.id}
                  label={kpi.label}
                  value={formatStatValue(kpi)}
                  change={kpi.change}
                  changeLabel={kpi.changeLabel}
                  icon={cfg.icon}
                  accent={cfg.accent}
                />
              );
            })}
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Analytics
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Candidates by Community" description="Distribution across skill communities">
              <PipelineBarChart data={candidatesByCommunity} />
            </ChartCard>
            <ChartCard title="Candidates by Availability" description="Ready-to-start timeline">
              <StatusPieChart data={candidatesByAvailability} />
            </ChartCard>
            <ChartCard title="Candidates by Status" description="Pipeline health breakdown">
              <StatusPieChart data={candidatesByStatus} />
            </ChartCard>
            <ChartCard title="Monthly Deployments" description="New placements per month">
              <DeploymentBarChart
                data={monthlyDeployments.map((d) => ({
                  label: d.label,
                  value: d.value2 ?? 0,
                  value2: d.value,
                }))}
              />
            </ChartCard>
          </div>
        </section>

        {/* Recent activities */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Activities
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <ActivityFeed
              title="Latest Candidate Uploads"
              items={latestCandidateUploads}
              viewAllHref="/admin/candidates"
            />
            <ActivityFeed
              title="Latest AI Screenings"
              items={latestAiScreenings}
              viewAllHref="/admin/candidates"
            />
            <ActivityFeed
              title="Latest Evaluations"
              items={latestEvaluations}
              viewAllHref="/admin/evaluations"
            />
            <ActivityFeed
              title="Latest BGV Updates"
              items={latestBgvUpdates}
              viewAllHref="/admin/background-checks"
            />
            <ActivityFeed
              title="Latest Client Requests"
              items={latestClientRequests}
              viewAllHref="/admin/clients"
            />
            <ActivityFeed
              title="Latest Trial Requests"
              items={latestTrialRequests}
              viewAllHref="/admin/trials"
            />
            <ActivityFeed
              title="Latest Deployments"
              items={latestDeployments}
              viewAllHref="/admin/deployments"
            />
          </div>
        </section>

        {/* Quick actions + notifications */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-navy/5 to-brand/5 p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Rocket className="h-4 w-4" />
                Quick Actions
              </h2>
              <div className="grid gap-2">
                {quickActions.map(({ label, href, icon: Icon, primary }) =>
                  href ? (
                    <Button
                      key={label}
                      to={href}
                      variant={primary ? 'primary' : 'outline'}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  ) : (
                    <Button
                      key={label}
                      variant="outline"
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => show(`${label} opened (demo)`)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Bell className="h-4 w-4 text-brand" />
                  Recent Notifications
                </h2>
                <Link to="/admin/settings" className="text-xs font-medium text-brand hover:underline">
                  Notification settings
                </Link>
              </div>
              <ul className="divide-y divide-border/60">
                {dashboardNotifications.map((n) => (
                  <li key={n.id} className="flex gap-4 px-4 py-3 transition-colors hover:bg-muted/30">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      {n.type === 'DOCUMENT' && <FileUp className="h-4 w-4" />}
                      {n.type === 'TRIAL' && <FlaskConical className="h-4 w-4" />}
                      {n.type === 'BACKGROUND_CHECK' && <ShieldCheck className="h-4 w-4" />}
                      {n.type === 'DEPLOYMENT' && <Rocket className="h-4 w-4" />}
                      {n.type === 'EVALUATION' && <ClipboardCheck className="h-4 w-4" />}
                      {n.type === 'GENERAL' && <Bell className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{n.title}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                          {n.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
