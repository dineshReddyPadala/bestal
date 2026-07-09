import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InterviewCancelForm } from '../forms/InterviewCancelForm';
import type { InterviewCancelFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';
import { toInterviewCard, useInterviewMutations, useInterviewsList } from '../../hooks/api/useInterviews';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type InterviewCard = ReturnType<typeof toInterviewCard>;

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
  onCancel,
}: {
  record: InterviewCard;
  onCancel: () => void;
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
              onCancel();
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
}: InterviewRequestManagementViewProps) {
  const { message, show } = useDemoToast();
  const { data, isLoading, isError, error } = useInterviewsList({ limit: 100 });
  const { cancel } = useInterviewMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [cancelTarget, setCancelTarget] = useState<InterviewCard | null>(null);

  const records = useMemo(() => (data?.data ?? []).map(toInterviewCard), [data]);

  const filteredData = useMemo(() => {
    let rows = [...records];
    if (filters.status !== 'all') rows = rows.filter((r) => r.status === filters.status);
    if (filters.client !== 'all') rows = rows.filter((r) => r.clientName === filters.client);
    return rows;
  }, [records, filters]);

  const clients = useMemo(
    () => [...new Set(records.map((r) => r.clientName))].sort(),
    [records],
  );

  const handleCancel = useCallback(
    async (values: InterviewCancelFormValues) => {
      if (!cancelTarget) return;
      try {
        await cancel.mutateAsync({
          id: cancelTarget.id,
          cancelReason: values.cancelReason,
        });
        show(`Cancelled — ${cancelTarget.candidateName}`);
        setCancelTarget(null);
      } catch (err) {
        show(err instanceof Error ? err.message : 'Cancel failed');
      }
    },
    [cancel, cancelTarget, show],
  );

  const columns = useMemo<ColumnDef<InterviewCard>[]>(
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
        cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}</span>,
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
          <InterviewRowActions record={row.original} onCancel={() => setCancelTarget(row.original)} />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        loading={isLoading}
        loadingLabel="Loading interview requests…"
        error={isError ? (error instanceof Error ? error.message : 'Failed to load interviews') : null}
      >
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by client or candidate…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
          filters={
            <ListingFiltersRow onClear={() => setFilters(defaultFilters)}>
              <ListingFilterSelect
                label="STATUS"
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: 'REQUESTED', label: 'Requested' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'SCHEDULED', label: 'Scheduled' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                  { value: 'RESCHEDULED', label: 'Rescheduled' },
                ]}
              />
              <ListingFilterSelect
                label="CLIENT"
                value={filters.client}
                onChange={(v) => setFilters((f) => ({ ...f, client: v }))}
                className="w-[180px] min-w-[140px]"
                options={[
                  { value: 'all', label: 'All clients' },
                  ...clients.map((c) => ({ value: c, label: c })),
                ]}
              />
            </ListingFiltersRow>
          }
        />
      </ListingPageShell>

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
    </>
  );
}
