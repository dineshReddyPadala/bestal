import { candidates } from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import {
  Avatar,
  Button,
  PageHeader,
  Select,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { MockCandidate } from '@bestal/mock-data';

export function CandidatesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return [...candidates];
    return candidates.filter((c) => c.status === statusFilter);
  }, [statusFilter]);

  const columns = useMemo<ColumnDef<MockCandidate>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Candidate',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar
              name={`${row.original.firstName} ${row.original.lastName}`}
              src={row.original.photoUrl}
              size="sm"
            />
            <div>
              <p className="font-medium">
                {row.original.firstName} {row.original.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'headline',
        header: 'Headline',
        cell: ({ getValue }) => (
          <span className="max-w-xs truncate text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
      },
      {
        id: 'rate',
        header: 'Rate',
        accessorFn: (row) => row.expectedRate,
        cell: ({ row }) =>
          `${formatCurrency(row.original.expectedRate, row.original.currency)}/hr`,
      },
      {
        accessorKey: 'visibility',
        header: 'Visibility',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'approvalStatus',
        header: 'Approval',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Link
            to={`/admin/candidates/${row.original.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Candidates"
        description="Full talent pool — search, filter, and manage candidate profiles"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add candidate
          </Button>
        }
      />

      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search candidates…"
          onRowClick={(row) => navigate(`/admin/candidates/${row.id}`)}
          toolbar={
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All statuses</option>
              <option value="NEW">New</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PLACED">Placed</option>
            </Select>
          }
        />
      </div>
    </div>
  );
}
