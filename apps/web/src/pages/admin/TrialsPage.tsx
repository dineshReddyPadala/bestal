import { trials } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Button, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { MockTrial } from '@bestal/mock-data';
import { marginColumns } from '../../lib/margin-columns';
import { useDemoToast } from '../../lib/use-demo-toast';

export function TrialsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { message, show } = useDemoToast();

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
        accessorKey: 'pilotType',
        header: 'Pilot',
        cell: ({ getValue }) => {
          const val = getValue() as string;
          return val === '20_HOUR' ? '20-hour pilot' : val.replace(/_/g, ' ');
        },
      },
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
      ...marginColumns<MockTrial>(),
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
          <Button onClick={() => show('Schedule trial form opened (demo)')}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule trial
          </Button>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

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
