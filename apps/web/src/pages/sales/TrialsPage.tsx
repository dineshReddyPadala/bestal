import { trials } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { MockTrial } from '@bestal/mock-data';
import { marginColumns } from '../../lib/margin-columns';

export function TrialsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...trials];
    return trials.filter((t) => t.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockTrial>[]>(
    () => [
      { accessorKey: 'candidateName', header: 'Candidate', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'title', header: 'Role' },
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
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Trial Requests"
        description="Track 20-hour pilots and trial engagements across clients"
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search trials…"
          toolbar={
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="all">All statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
