import { Card, CardContent, CardHeader, CardTitle, PageHeader, StatCard } from '@bestal/ui';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/api/useAdmin';

export function SuperAdminDashboardPage() {
  const { data, isLoading, isError, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading dashboard…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Failed to load dashboard'}
      </div>
    );
  }

  const d = data ?? {};
  const recentCandidates = (d.recentCandidates as Array<Record<string, unknown>>) ?? [];
  const recentApprovals = (d.recentApprovals as Array<Record<string, unknown>>) ?? [];
  const recentTrials = (d.recentTrials as Array<Record<string, unknown>>) ?? [];
  const recentDeployments = (d.recentDeployments as Array<Record<string, unknown>>) ?? [];

  return (
    <div>
      <PageHeader title="Super Admin Dashboard" description="Platform overview" />
      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total candidates" value={String(d.totalCandidates ?? 0)} />
        <StatCard label="Client visible" value={String(d.clientVisibleCandidates ?? 0)} />
        <StatCard label="Pending approvals" value={String(d.pendingApprovals ?? 0)} />
        <StatCard label="Active clients" value={String(d.activeClients ?? 0)} />
        <StatCard label="Active trials" value={String(d.activeTrials ?? 0)} />
        <StatCard label="Active deployments" value={String(d.activeDeployments ?? 0)} />
        <StatCard
          label="Est. monthly revenue"
          value={`$${Number(d.estimatedMonthlyRevenue ?? 0).toLocaleString()}`}
        />
        <StatCard
          label="Est. monthly margin"
          value={`$${Number(d.estimatedMonthlyMargin ?? 0).toLocaleString()}`}
        />
      </div>

      <div className="grid gap-4 px-6 pb-6 md:grid-cols-2">
        <ActivityCard
          title="Latest candidates"
          rows={recentCandidates.map((r) => ({
            id: Number(r.id),
            label: String(r.name),
            meta: String(r.role ?? r.profileStatus ?? ''),
            href: `/super-admin/candidates/${r.id}`,
          }))}
        />
        <ActivityCard
          title="Latest approvals"
          rows={recentApprovals.map((r) => ({
            id: Number(r.id),
            label: String(r.name),
            meta: String(r.approvedAt ?? ''),
            href: `/super-admin/candidates/${r.id}`,
          }))}
        />
        <ActivityCard
          title="Latest trials"
          rows={recentTrials.map((r) => ({
            id: Number(r.id),
            label: `${r.candidateName} · ${r.clientName}`,
            meta: String(r.status ?? ''),
            href: `/super-admin/trials`,
          }))}
        />
        <ActivityCard
          title="Latest deployments"
          rows={recentDeployments.map((r) => ({
            id: Number(r.id),
            label: `${r.candidateName} · ${r.clientName}`,
            meta: String(r.status ?? ''),
            href: `/super-admin/deployments`,
          }))}
        />
      </div>
    </div>
  );
}

function ActivityCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ id: number; label: string; meta: string; href: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          rows.map((row) => (
            <Link
              key={row.id}
              to={row.href}
              className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm hover:bg-muted/70"
            >
              <span className="font-medium">{row.label}</span>
              <span className="text-xs text-muted-foreground">{row.meta}</span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
