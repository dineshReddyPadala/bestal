import { evaluations } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import type { MockEvaluation } from '@bestal/mock-data';

export function EvaluationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...evaluations];
    return evaluations.filter((e) => e.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockEvaluation>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      { accessorKey: 'skillCommunity', header: 'Skill Community' },
      {
        accessorKey: 'evaluatorName',
        header: 'Evaluator',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'overallScore',
        header: 'Overall',
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          return val !== null ? (
            <span className="font-medium">{val}/100</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'technicalScore',
        header: 'Technical',
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          return val !== null ? `${val}/100` : '—';
        },
      },
      {
        accessorKey: 'communicationScore',
        header: 'Communication',
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          return val !== null ? `${val}/100` : '—';
        },
      },
      {
        accessorKey: 'recommendation',
        header: 'Recommendation',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? <StatusBadge status={val} /> : '—';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
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
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Evaluations"
        description="Technical and behavioral assessments across the talent pool"
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search evaluations…"
          toolbar={
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-44"
            >
              <option value="all">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
