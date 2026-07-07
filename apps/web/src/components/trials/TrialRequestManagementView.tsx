import {
  trialRequestCandidates,
  trialRequestClients,
  trialRequestRecords,
  trialRequestStatuses,
  type TrialRequestRecord,
  type TrialRequestStatus,
} from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
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
import { mergeClientTrialsIntoRecords } from '../../lib/client-engagement-sync';
import { useDemoToast } from '../../lib/use-demo-toast';

type TrialAction = 'Approve' | 'Reject' | 'Start' | 'Complete' | 'Convert';

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
  record: TrialRequestRecord;
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
        return ['Start'];
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
  description = 'Review, approve, and track client trial pilots through conversion',
}: TrialRequestManagementViewProps) {
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<TrialRequestRecord[]>(() =>
    mergeClientTrialsIntoRecords([...trialRequestRecords]),
  );
  const [filters, setFilters] = useState(defaultFilters);
  const [rejectTarget, setRejectTarget] = useState<TrialRequestRecord | null>(null);
  const [completeTarget, setCompleteTarget] = useState<TrialRequestRecord | null>(null);
  const [convertTarget, setConvertTarget] = useState<TrialRequestRecord | null>(null);

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

  const handleAction = useCallback((record: TrialRequestRecord, action: TrialAction) => {
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

    setRecords((prev) =>
      prev.map((row) => {
        if (row.id !== record.id) return row;
        if (action === 'Approve') return { ...row, status: 'APPROVED' as TrialRequestStatus };
        if (action === 'Start') return { ...row, status: 'IN_PROGRESS' as TrialRequestStatus };
        return row;
      }),
    );
    show(`${action} — ${record.candidateName} @ ${record.clientName} (demo)`);
  }, [show]);

  const confirmReject = (values: TrialRejectFormValues) => {
    if (!rejectTarget) return;
    setRecords((prev) =>
      prev.map((row) =>
        row.id === rejectTarget.id
          ? { ...row, status: 'REJECTED' as TrialRequestStatus, rejectReason: values.reason?.trim() || null }
          : row,
      ),
    );
    show(`Rejected — ${rejectTarget.candidateName} (demo)`);
    setRejectTarget(null);
  };

  const confirmComplete = (values: TrialCompleteFormValues) => {
    if (!completeTarget) return;
    setRecords((prev) =>
      prev.map((row) =>
        row.id === completeTarget.id
          ? {
              ...row,
              status: 'COMPLETED' as TrialRequestStatus,
              outcome: values.outcome.trim(),
              feedback: values.feedback?.trim() || row.feedback,
            }
          : row,
      ),
    );
    show(`Completed — ${completeTarget.candidateName} (demo)`);
    setCompleteTarget(null);
  };

  const confirmConvert = (values: DeploymentFormValues) => {
    if (!convertTarget) return;
    buildDeploymentPayload(values);
    setRecords((prev) =>
      prev.map((row) =>
        row.id === convertTarget.id ? { ...row, converted: true } : row,
      ),
    );
    show(`Deployment created from trial — ${convertTarget.candidateName} (demo)`);
    setConvertTarget(null);
  };

  const columns = useMemo<ColumnDef<TrialRequestRecord>[]>(
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
    <div className="min-h-full bg-muted/10">
      <PageHeader title={title} description={description} />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by client, candidate, or role…"
          pageSize={10}
          stickyHeader
          filters={
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Filters
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <FilterSelect
                  label="Status"
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
                <FilterSelect
                  label="Date"
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
                <FilterSelect
                  label="Client"
                  value={filters.client}
                  onChange={(v) => updateFilter('client', v)}
                  options={[
                    { value: 'all', label: 'All clients' },
                    ...trialRequestClients.map((c) => ({ value: c, label: c })),
                  ]}
                />
                <FilterSelect
                  label="Candidate"
                  value={filters.candidate}
                  onChange={(v) => updateFilter('candidate', v)}
                  options={[
                    { value: 'all', label: 'All candidates' },
                    ...trialRequestCandidates.map((c) => ({ value: c, label: c })),
                  ]}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)}>
                  Clear filters
                </Button>
              </div>
            </div>
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
      </div>

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
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
