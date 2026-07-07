import type { MockInterview } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InterviewCancelForm } from '../forms/InterviewCancelForm';
import { allInterviewsForWorkflow } from '../../lib/client-engagement-sync';
import type { InterviewCancelFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

type InterviewAction = 'Cancel';

type InterviewRequestManagementViewProps = {
  title?: string;
  description?: string;
};

const defaultFilters = {
  status: 'all',
  client: 'all',
};

function InterviewRowActions({
  record,
  onAction,
}: {
  record: MockInterview;
  onAction: (action: InterviewAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (record.status !== 'REQUESTED' && record.status !== 'RESCHEDULED') {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="relative flex justify-end" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Interview actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          <button
            type="button"
            className="flex w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
            onClick={() => {
              onAction('Cancel');
              setOpen(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export function InterviewRequestManagementView({
  title = 'Interview Request Management',
  description = 'Review client interview requests before recruiter scheduling',
}: InterviewRequestManagementViewProps) {
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<MockInterview[]>(() => allInterviewsForWorkflow());
  const [filters, setFilters] = useState(defaultFilters);
  const [cancelTarget, setCancelTarget] = useState<MockInterview | null>(null);

  const filteredData = useMemo(() => {
    let rows = [...records];
    if (filters.status !== 'all') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.client !== 'all') {
      rows = rows.filter((r) => r.clientName === filters.client);
    }
    rows.sort((a, b) => {
      const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return bTime - aTime;
    });
    return rows;
  }, [records, filters]);

  const clients = useMemo(
    () => [...new Set(records.map((r) => r.clientName))].sort(),
    [records],
  );

  const handleCancel = useCallback((values: InterviewCancelFormValues) => {
    if (!cancelTarget) return;
    setRecords((prev) =>
      prev.map((row) =>
        row.id === cancelTarget.id
          ? {
              ...row,
              status: 'CANCELLED',
              notes: values.cancelReason?.trim()
                ? `Cancelled: ${values.cancelReason.trim()}`
                : 'Cancelled by sales',
            }
          : row,
      ),
    );
    show(`Cancelled — ${cancelTarget.candidateName} (demo)`);
    setCancelTarget(null);
  }, [cancelTarget, show]);

  const columns = useMemo<ColumnDef<MockInterview>[]>(
    () => [
      {
        accessorKey: 'clientName',
        header: 'Client',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {(getValue() as string).replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        accessorKey: 'scheduledAt',
        header: 'Preferred',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">Flexible</span>
          );
        },
      },
      {
        accessorKey: 'durationMinutes',
        header: () => <span className="block text-right">Min</span>,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: '',
        meta: { headerClassName: 'w-12 text-right', cellClassName: 'w-12 text-right' },
        cell: ({ row }) => (
          <InterviewRowActions
            record={row.original}
            onAction={() => setCancelTarget(row.original)}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title={title} description={description} />

      {message && (
        <div className="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-3">
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-44"
          >
            <option value="all">All statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </Select>
          <Select
            value={filters.client}
            onChange={(e) => setFilters((f) => ({ ...f, client: e.target.value }))}
            className="w-48"
          >
            <option value="all">All clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <TanStackDataTable columns={columns} data={filteredData} />
      </div>

      <Dialog
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        title={cancelTarget ? `Cancel interview — ${cancelTarget.candidateName}` : 'Cancel interview'}
        scrollable
        className="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Back
            </Button>
            <Button type="submit" form="interview-cancel-form">
              Cancel interview
            </Button>
          </>
        }
      >
        {cancelTarget && (
          <InterviewCancelForm
            formId="interview-cancel-form"
            showActions={false}
            onSubmit={handleCancel}
            onCancel={() => setCancelTarget(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
