import { approvals } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Button, PageHeader, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MockApproval } from '@bestal/mock-data';
import { useDemoToast } from '../../lib/use-demo-toast';

type ApprovalRow = MockApproval & { status: 'PENDING' | 'APPROVED' | 'REJECTED' };

export function AdminApprovalsPage() {
  const { message, show } = useDemoToast();
  const [rows, setRows] = useState<ApprovalRow[]>(() => [...approvals] as ApprovalRow[]);

  const columns = useMemo<ColumnDef<ApprovalRow>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'title', header: 'Title', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="line-clamp-2 text-sm text-muted-foreground">{getValue() as string}</span>
        ),
      },
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'requestedBy', header: 'Requested By' },
      {
        accessorKey: 'requestedAt',
        header: 'Requested',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          if (r.status !== 'PENDING') return <span className="text-muted-foreground">—</span>;
          return (
            <div className="flex gap-1">
              {r.type === 'CANDIDATE' && (
                <Link
                  to={`/admin/candidates/${r.entityId}/workflow`}
                  className="text-xs text-brand hover:underline"
                >
                  Workflow
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRows((prev) =>
                    prev.map((a) =>
                      a.id === r.id ? { ...a, status: 'APPROVED' as const, reviewedBy: 'Admin', reviewedAt: new Date().toISOString() } : a,
                    ),
                  );
                  show(`Approved — ${r.title} (demo)`);
                }}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                onClick={() => {
                  setRows((prev) =>
                    prev.map((a) =>
                      a.id === r.id ? { ...a, status: 'REJECTED' as const, reviewedBy: 'Admin', reviewedAt: new Date().toISOString() } : a,
                    ),
                  );
                  show(`Rejected — ${r.title} (demo)`);
                }}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [show],
  );

  const pending = rows.filter((r) => r.status === 'PENDING').length;

  return (
    <div>
      <PageHeader
        title="Approval Queue"
        description={`${pending} pending admin review${pending === 1 ? '' : 's'} — candidate visibility, shortlists, and deployments`}
      />
      {message && (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      <div className="p-6">
        <TanStackDataTable columns={columns} data={rows} searchPlaceholder="Search approvals…" />
      </div>
    </div>
  );
}
