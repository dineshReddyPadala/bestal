import { deployments } from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { MockDeployment } from '@bestal/mock-data';

export function DeploymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...deployments];
    return deployments.filter((d) => d.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockDeployment>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      { accessorKey: 'candidateName', header: 'Candidate' },
      { accessorKey: 'clientName', header: 'Client' },
      {
        accessorKey: 'placementType',
        header: 'Type',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'rate',
        header: 'Rate',
        accessorFn: (row) => row.rate,
        cell: ({ row }) =>
          `${formatCurrency(row.original.rate, row.original.currency)}/hr`,
      },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'End',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return (
            <span className="text-muted-foreground">{val ? formatDate(val) : 'Ongoing'}</span>
          );
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
      <PageHeader
        title="Deployments"
        description="Active and historical talent placements across all clients"
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search deployments…"
          toolbar={
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
