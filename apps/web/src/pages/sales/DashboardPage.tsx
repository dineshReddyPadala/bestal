import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { PageHeader, StatCard, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClientsList } from '../../hooks/api/useClients';
import { useDeploymentsList } from '../../hooks/api/useDeployments';
import { useTrialsList } from '../../hooks/api/useTrials';
import type { DeploymentListItem } from '../../lib/api/types';

export function DashboardPage() {
  const clients = useClientsList({ limit: 100 });
  const trials = useTrialsList({ limit: 100 });
  const deployments = useDeploymentsList({ limit: 100 });

  const clientRows = clients.data?.data ?? [];
  const trialRows = trials.data?.data ?? [];
  const deploymentRows = deployments.data?.data ?? [];

  const trialsRequested = trialRows.filter((t) => t.status === 'REQUESTED').length;
  const trialsApproved = trialRows.filter((t) => t.status === 'APPROVED').length;
  const trialsInProgress = trialRows.filter((t) => t.status === 'IN_PROGRESS').length;
  const activeTrials = trialRows.filter((t) =>
    ['REQUESTED', 'APPROVED', 'IN_PROGRESS'].includes(t.status),
  );
  const activeDeployments = deploymentRows.filter((d) => d.status === 'ACTIVE');
  const completedTrials = trialRows.filter((t) => t.status === 'COMPLETED');
  const convertedTrials = completedTrials.filter(
    (t) => t.outcome === 'CONTINUE' || t.outcome === 'CONVERTED',
  );
  const conversionRate =
    completedTrials.length > 0
      ? Math.round((convertedTrials.length / completedTrials.length) * 100)
      : 0;
  const revenue = activeDeployments.reduce(
    (sum, d) => sum + (d.billingRate ?? 0) * (d.expectedHoursPerWeek ?? 40),
    0,
  );
  const margin = activeDeployments.reduce((sum, d) => {
    const bill = d.billingRate ?? 0;
    const pay = d.candidatePayRate ?? 0;
    return sum + (bill - pay) * (d.expectedHoursPerWeek ?? 40);
  }, 0);

  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
  const newClients = clientRows.filter((c) => {
    const created = c.createdAt ? new Date(c.createdAt).getTime() : 0;
    return created >= thirtyDaysAgo;
  }).length;

  const dealColumns = useMemo<ColumnDef<DeploymentListItem>[]>(
    () => [
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'candidateName', header: 'Candidate' },
      { accessorKey: 'roleTitle', header: 'Role' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'billingRate',
        header: 'Bill rate',
        cell: ({ row }) =>
          row.original.billingRate == null
            ? '—'
            : formatCurrency(row.original.billingRate, row.original.currency ?? 'USD'),
      },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? formatDate(value) : '—';
        },
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Sales Dashboard" />

      <div className="grid gap-4 p-6 md:grid-cols-4 xl:grid-cols-8">
        {clients.isLoading || trials.isLoading || deployments.isLoading ? (
          <p className="text-sm text-muted-foreground md:col-span-4">Loading live metrics…</p>
        ) : (
          <>
            <StatCard label="Total clients" value={clientRows.length} />
            <StatCard label="New clients (30d)" value={newClients} />
            <StatCard
              label="Active clients"
              value={clientRows.filter((c) => c.status === 'ACTIVE').length}
            />
            <StatCard label="Open trials" value={activeTrials.length} />
            <StatCard label="Requested" value={trialsRequested} />
            <StatCard label="Approved" value={trialsApproved} />
            <StatCard label="In progress" value={trialsInProgress} />
            <StatCard label="Completed trials" value={completedTrials.length} />
            <StatCard label="Trial conversion" value={`${conversionRate}%`} />
            <StatCard label="Active deployments" value={activeDeployments.length} />
            <StatCard
              label="Weekly revenue"
              value={formatCurrency(revenue, 'USD')}
            />
            <StatCard label="Weekly margin" value={formatCurrency(margin, 'USD')} />
          </>
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active deployments</h3>
          <Link to="/sales/margin" className="text-sm font-medium text-brand hover:underline">
            View margin report →
          </Link>
        </div>
        <TanStackDataTable
          columns={dealColumns}
          data={activeDeployments}
          searchPlaceholder="Search deployments…"
          emptyTitle="No active deployments"
          emptyDescription="Convert approved trials to populate this list."
        />
      </div>
    </div>
  );
}
