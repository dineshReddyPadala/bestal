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

  const activeTrials = trialRows.filter((t) =>
    ['REQUESTED', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS'].includes(t.status),
  );
  const activeDeployments = deploymentRows.filter((d) => d.status === 'ACTIVE');

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
      <PageHeader
        title="Sales Dashboard"
      />

      <div className="grid gap-4 p-6 md:grid-cols-4">
        {clients.isLoading || trials.isLoading || deployments.isLoading ? (
          <p className="text-sm text-muted-foreground md:col-span-4">Loading live metrics…</p>
        ) : (
          <>
            <StatCard
              label="Active clients"
              value={clientRows.filter((c) => c.status === 'ACTIVE').length}
            />
            <StatCard label="Open trials" value={activeTrials.length} />
            <StatCard label="Active deployments" value={activeDeployments.length} />
            <StatCard label="Total clients" value={clientRows.length} />
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
