import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeploymentForm } from '../forms/DeploymentForm';
import { TrialCompleteForm } from '../forms/TrialCompleteForm';
import { TrialRejectForm } from '../forms/TrialRejectForm';
import {
  buildDeploymentPayload,
  type DeploymentFormValues,
  type TrialCompleteFormValues,
  type TrialRejectFormValues,
} from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  toTrialRow,
  useTrialMutations,
  useTrialsList,
  type TrialManagementRow,
} from '../../hooks/api/useTrials';
import { useDeploymentMutations } from '../../hooks/api/useDeployments';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type TrialAction = 'Approve' | 'Reject' | 'Confirm' | 'Start' | 'Complete' | 'Convert';

type TrialRequestStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

const trialRequestStatuses: TrialRequestStatus[] = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
];

type TrialRequestManagementViewProps = {
  title?: string;
  description?: string;
};

const defaultFilters = {
  status: 'all',
  date: 'all',
  client: 'all',
  candidate: 'all',
};

const TODAY = new Date('2026-06-30');

function isActivePeriod(start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  return new Date(start) <= TODAY && new Date(end) >= TODAY;
}

function isUpcoming(start: string | null): boolean {
  if (!start) return false;
  return new Date(start) > TODAY;
}

function isPast(end: string | null): boolean {
  if (!end) return false;
  return new Date(end) < TODAY;
}

function TrialRowActions({
  record,
  onAction,
}: {
  record: TrialManagementRow;
  onAction: (action: TrialAction) => void;
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

  const actions: TrialAction[] = (() => {
    switch (record.status) {
      case 'REQUESTED':
        return ['Approve', 'Reject'];
      case 'APPROVED':
        return record.candidateConfirmedAt ? ['Start'] : ['Confirm', 'Start'];
      case 'IN_PROGRESS':
        return ['Complete'];
      case 'COMPLETED':
        return record.converted ? [] : ['Convert'];
      default:
        return [];
    }
  })();

  if (actions.length === 0) {
    return record.converted ? (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Deployed
      </span>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }

  return (
    <div className="relative flex justify-end" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Trial actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          {actions.map((label) => (
            <button
              key={label}
              type="button"
              className={`flex w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                label === 'Reject' ? 'text-destructive' : 'text-foreground'
              }`}
              onClick={() => {
                onAction(label);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrialRequestManagementView({
  title = 'Trial Request Management',
}: TrialRequestManagementViewProps) {
  const { message, show } = useDemoToast();
  const { data, isLoading, isError, error } = useTrialsList({ limit: 100 });
  const { approve, reject, update, confirmCandidate } = useTrialMutations();
  const { create: createDeployment } = useDeploymentMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [rejectTarget, setRejectTarget] = useState<TrialManagementRow | null>(null);
  const [completeTarget, setCompleteTarget] = useState<TrialManagementRow | null>(null);
  const [convertTarget, setConvertTarget] = useState<TrialManagementRow | null>(null);

  const records = useMemo(
    () => (data?.data ?? []).map((item) => toTrialRow(item)),
    [data],
  );

  const trialRequestClients = useMemo(
    () => [...new Set(records.map((r) => r.clientName))].sort(),
    [records],
  );
  const trialRequestCandidates = useMemo(
    () => [...new Set(records.map((r) => r.candidateName))].sort(),
    [records],
  );

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.status !== 'all') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.client !== 'all') {
      rows = rows.filter((r) => r.clientName === filters.client);
    }
    if (filters.candidate !== 'all') {
      rows = rows.filter((r) => r.candidateName === filters.candidate);
    }
    if (filters.date !== 'all') {
      if (filters.date === 'upcoming') {
        rows = rows.filter((r) => isUpcoming(r.startDate));
      } else if (filters.date === 'active') {
        rows = rows.filter((r) => isActivePeriod(r.startDate, r.endDate));
      } else if (filters.date === 'past') {
        rows = rows.filter((r) => isPast(r.endDate));
      } else if (filters.date === 'no-dates') {
        rows = rows.filter((r) => !r.startDate && !r.endDate);
      }
    }

    rows.sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    );

    return rows;
  }, [records, filters]);

  const handleAction = useCallback(
    async (record: TrialManagementRow, action: TrialAction) => {
      if (action === 'Reject') {
        setRejectTarget(record);
        return;
      }
      if (action === 'Complete') {
        setCompleteTarget(record);
        return;
      }
      if (action === 'Convert') {
        setConvertTarget(record);
        return;
      }

      try {
        if (action === 'Approve') {
          await approve.mutateAsync(record.id);
        } else if (action === 'Confirm') {
          await confirmCandidate.mutateAsync(record.id);
        } else if (action === 'Start') {
          await update.mutateAsync({ id: record.id, body: { status: 'IN_PROGRESS' } });
        }
        show(`${action} — ${record.candidateName} @ ${record.clientName}`);
      } catch (err) {
        show(err instanceof Error ? err.message : 'Action failed');
      }
    },
    [approve, confirmCandidate, update, show],
  );

  const confirmReject = async (values: TrialRejectFormValues) => {
    if (!rejectTarget) return;
    try {
      await reject.mutateAsync({ id: rejectTarget.id, reason: values.reason });
      show(`Rejected — ${rejectTarget.candidateName}`);
      setRejectTarget(null);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Reject failed');
    }
  };

  const confirmComplete = async (values: TrialCompleteFormValues) => {
    if (!completeTarget) return;
    try {
      await update.mutateAsync({
        id: completeTarget.id,
        body: {
          status: 'COMPLETED',
          outcome: values.outcome.trim(),
          feedback: values.feedback?.trim(),
        },
      });
      show(`Completed — ${completeTarget.candidateName}`);
      setCompleteTarget(null);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Complete failed');
    }
  };

  const confirmConvert = async (values: DeploymentFormValues) => {
    if (!convertTarget) return;
    try {
      const payload = buildDeploymentPayload(values);
      await createDeployment.mutateAsync(payload as unknown as Record<string, unknown>);
      await update.mutateAsync({
        id: convertTarget.id,
        body: { status: 'COMPLETED' },
      });
      show(`Deployment created from trial — ${convertTarget.candidateName}`);
      setConvertTarget(null);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Convert failed');
    }
  };

  const columns = useMemo<ColumnDef<TrialManagementRow>[]>(
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
        accessorKey: 'roleTitle',
        header: 'Role',
        cell: ({ getValue }) => (
          <span className="max-w-[200px] truncate text-sm text-muted-foreground">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'durationDays',
        header: () => <span className="block text-right">Days</span>,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ getValue }) => {
          const val = getValue() as number | null;
          return <span className="tabular-nums">{val ?? '—'}</span>;
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'endDate',
        header: 'End',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'outcome',
        header: 'Outcome',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="max-w-[180px] truncate text-sm">{val}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        meta: { headerClassName: 'w-12 text-right', cellClassName: 'w-12 text-right' },
        cell: ({ row }) => (
          <TrialRowActions
            record={row.original}
            onAction={(action) => handleAction(row.original, action)}
          />
        ),
      },
    ],
    [handleAction],
  );

  const updateFilter = (key: keyof typeof defaultFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        loading={isLoading}
        loadingLabel="Loading trial requests…"
        error={isError ? (error instanceof Error ? error.message : 'Failed to load trials') : null}
      >
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by client, candidate, or role…"
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
                onChange={(v) => updateFilter('status', v)}
                options={[
                  { value: 'all', label: 'All statuses' },
                  ...trialRequestStatuses.map((s) => ({
                    value: s,
                    label: s.replace(/_/g, ' '),
                  })),
                ]}
              />
              <ListingFilterSelect
                label="DATE"
                value={filters.date}
                onChange={(v) => updateFilter('date', v)}
                options={[
                  { value: 'all', label: 'All dates' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'active', label: 'Active now' },
                  { value: 'past', label: 'Past' },
                  { value: 'no-dates', label: 'Not scheduled' },
                ]}
              />
              <ListingFilterSelect
                label="CLIENT"
                value={filters.client}
                onChange={(v) => updateFilter('client', v)}
                options={[
                  { value: 'all', label: 'All clients' },
                  ...trialRequestClients.map((c) => ({ value: c, label: c })),
                ]}
              />
              <ListingFilterSelect
                label="CANDIDATE"
                value={filters.candidate}
                onChange={(v) => updateFilter('candidate', v)}
                options={[
                  { value: 'all', label: 'All candidates' },
                  ...trialRequestCandidates.map((c) => ({ value: c, label: c })),
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [r.clientName, r.candidateName, r.roleTitle, r.outcome ?? ''].some((field) =>
              field.toLowerCase().includes(q),
            );
          }}
        />
      </ListingPageShell>

      <Dialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        title="Reject trial request"
        scrollable
        className="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" form="trial-reject-form">
              Confirm reject
            </Button>
          </>
        }
      >
        <TrialRejectForm
          formId="trial-reject-form"
          showActions={false}
          onSubmit={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      </Dialog>

      <Dialog
        open={completeTarget !== null}
        onClose={() => setCompleteTarget(null)}
        title="Complete trial"
        scrollable
        className="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCompleteTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" form="trial-complete-form">
              Mark completed
            </Button>
          </>
        }
      >
        <TrialCompleteForm
          formId="trial-complete-form"
          showActions={false}
          onSubmit={confirmComplete}
          onCancel={() => setCompleteTarget(null)}
        />
      </Dialog>

      <Dialog
        open={convertTarget !== null}
        onClose={() => setConvertTarget(null)}
        title="Convert trial to deployment"
        scrollable
        className="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setConvertTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" form="trial-convert-deployment-form">
              Create deployment
            </Button>
          </>
        }
      >
        {convertTarget && (
          <DeploymentForm
            formId="trial-convert-deployment-form"
            showActions={false}
            defaultValues={{
              clientName: convertTarget.clientName,
              candidateName: convertTarget.candidateName,
              roleTitle: convertTarget.roleTitle,
              startDate: convertTarget.startDate ?? '',
              endDate: convertTarget.endDate ?? undefined,
            }}
            onSubmit={confirmConvert}
            onCancel={() => setConvertTarget(null)}
          />
        )}
      </Dialog>
    </>
  );
}
