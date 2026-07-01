import { trials } from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { Button, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { MockTrial } from '@bestal/mock-data';

export function TrialsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...trials];
    return trials.filter((t) => t.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockTrial>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      { accessorKey: 'clientName', header: 'Client' },
      {
        accessorKey: 'title',
        header: 'Role',
        cell: ({ getValue }) => (
          <span className="max-w-xs truncate">{getValue() as string}</span>
        ),
      },
      { accessorKey: 'recruiter', header: 'Recruiter' },
      {
        id: 'period',
        header: 'Period',
        accessorFn: (row) => row.startDate,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
          </span>
        ),
      },
      {
        id: 'rate',
        header: 'Rate',
        accessorFn: (row) => row.rate,
        cell: ({ row }) =>
          `${formatCurrency(row.original.rate, row.original.currency)}/hr`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'feedback',
        header: 'Feedback',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="max-w-xs truncate text-muted-foreground">{val}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Trials"
        description="Client trial engagements before full deployment"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule trial
          </Button>
        }
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search trials…"
          toolbar={
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-44"
            >
              <option value="all">All statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="EXTENDED">Extended</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
