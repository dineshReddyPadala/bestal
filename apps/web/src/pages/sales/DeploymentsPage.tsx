import { deployments } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { MockDeployment } from '@bestal/mock-data';
import { marginColumns } from '../../lib/margin-columns';

export function DeploymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...deployments];
    return deployments.filter((d) => d.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockDeployment>[]>(
    () => [
      { accessorKey: 'title', header: 'Title', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      { accessorKey: 'candidateName', header: 'Candidate' },
      { accessorKey: 'clientName', header: 'Client' },
      {
        accessorKey: 'placementType',
        header: 'Type',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      ...marginColumns<MockDeployment>(),
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue() as string)}</span>,
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
        description="Active placements with bill rate, pay rate, and margin"
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search deployments…"
          toolbar={
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="all">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
