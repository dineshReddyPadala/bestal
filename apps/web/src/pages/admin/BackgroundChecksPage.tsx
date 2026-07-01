import { backgroundChecks } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Button, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { MockBackgroundCheck } from '@bestal/mock-data';

export function BackgroundChecksPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...backgroundChecks];
    return backgroundChecks.filter((b) => b.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockBackgroundCheck>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'provider', header: 'Provider' },
      { accessorKey: 'requestedBy', header: 'Requested By' },
      {
        accessorKey: 'requestedAt',
        header: 'Requested',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'completedAt',
        header: 'Completed',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            '—'
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
        title="Background Checks"
        description="Compliance and verification status for vetted talent"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Request check
          </Button>
        }
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search background checks…"
          toolbar={
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-44"
            >
              <option value="all">All statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLEAR">Clear</option>
              <option value="CONSIDER">Consider</option>
              <option value="FAILED">Failed</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
