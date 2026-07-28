import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Briefcase, Clock, Rocket } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDeploymentsList } from '../../hooks/api/useDeployments';
import type { DeploymentListItem } from '../../lib/api/types';

export function DeploymentsPage() {
  const { user } = useAuth();
  const clientId = user?.clientId ?? undefined;
  const { data, isLoading } = useDeploymentsList({
    limit: 100,
    sort: '-createdAt',
    ...(clientId ? { clientId } : {}),
  });
  const rows = data?.data ?? [];
  const active = rows.filter((d) => d.status === 'ACTIVE');
  const pending = rows.filter((d) => ['PENDING', 'ON_HOLD'].includes(d.status));

  const columns = useMemo<ColumnDef<DeploymentListItem>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() as string}</span>
        ),
      },
      { accessorKey: 'roleTitle', header: 'Role' },
      { accessorKey: 'placementType', header: 'Type' },
      {
        id: 'rate',
        header: 'Rate',
        cell: ({ row }) =>
          row.original.billingRate != null
            ? `${formatCurrency(row.original.billingRate, row.original.currency ?? 'USD')}/hr`
            : '—',
      },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? formatDate(v) : '—';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Active Deployments" />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active" value={active.length} icon={<Rocket className="h-5 w-5" />} />
          <StatCard
            label="Pending / On hold"
            value={pending.length}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            label="Total placements"
            value={rows.length}
            icon={<Briefcase className="h-5 w-5" />}
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading deployments…</p>
        ) : rows.length === 0 ? (
          <EmptyState icon={<Rocket className="h-8 w-8" />} title="No deployments" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <TanStackDataTable columns={columns} data={rows} pageSize={12} dense />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
