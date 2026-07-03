import {
  trialRequestCandidates,
  trialRequestClients,
  trialRequestRecords,
  trialRequestStatuses,
  type TrialRequestRecord,
  type TrialRequestStatus,
} from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Badge, Button, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Star, XCircle } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
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
  rating: 'all',
};

const TODAY = new Date('2026-06-30');

function isActivePeriod(start: string | null, end: string | null): boolean {
  if (!start || !end) return false;
  const s = new Date(start);
  const e = new Date(end);
  return s <= TODAY && e >= TODAY;
}

function isUpcoming(start: string | null): boolean {
  if (!start) return false;
  return new Date(start) > TODAY;
}

function isPast(end: string | null): boolean {
  if (!end) return false;
  return new Date(end) < TODAY;
}

function RatingDisplay({ rating }: { rating: number | null }) {
  if (rating == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="font-medium">{rating}</span>
      <span className="text-muted-foreground">/ 5</span>
    </span>
  );
}

function TrialRequestActions({
  record,
  onAction,
}: {
  record: TrialRequestRecord;
  onAction: (action: TrialAction) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  switch (record.status) {
    case 'REQUESTED':
      return (
        <div className="flex flex-wrap gap-1.5" onClick={stop}>
          <Button size="sm" onClick={() => onAction('Approve')}>
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAction('Reject')}>
            Reject
          </Button>
        </div>
      );
    case 'APPROVED':
      return (
        <div onClick={stop}>
          <Button size="sm" onClick={() => onAction('Start')}>
            Start
          </Button>
        </div>
      );
    case 'IN_PROGRESS':
      return (
        <div onClick={stop}>
          <Button size="sm" onClick={() => onAction('Complete')}>
            Complete
          </Button>
        </div>
      );
    case 'COMPLETED':
      if (record.converted) {
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Converted
          </Badge>
        );
      }
      return (
        <div onClick={stop}>
          <Button size="sm" onClick={() => onAction('Convert')}>
            Convert
          </Button>
        </div>
      );
    default:
      return <span className="text-muted-foreground">—</span>;
  }
}

export function TrialRequestManagementView({
  title = 'Trial Request Management',
  description = 'Review, approve, and track client trial pilots through conversion',
}: TrialRequestManagementViewProps) {
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<TrialRequestRecord[]>(() => [...trialRequestRecords]);
  const [filters, setFilters] = useState(defaultFilters);

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
    if (filters.rating !== 'all') {
      if (filters.rating === 'unrated') {
        rows = rows.filter((r) => r.rating == null);
      } else if (filters.rating === '4plus') {
        rows = rows.filter((r) => r.rating != null && r.rating >= 4);
      } else if (filters.rating === '3plus') {
        rows = rows.filter((r) => r.rating != null && r.rating >= 3);
      } else if (filters.rating === 'below3') {
        rows = rows.filter((r) => r.rating != null && r.rating < 3);
      }
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
    setRecords((prev) =>
      prev.map((row) => {
        if (row.id !== record.id) return row;

        switch (action) {
          case 'Approve':
            return { ...row, status: 'APPROVED' as TrialRequestStatus };
          case 'Reject':
            return { ...row, status: 'REJECTED' as TrialRequestStatus };
          case 'Start':
            return { ...row, status: 'IN_PROGRESS' as TrialRequestStatus };
          case 'Complete':
            return {
              ...row,
              status: 'COMPLETED' as TrialRequestStatus,
              rating: row.rating ?? 4,
            };
          case 'Convert':
            return { ...row, converted: true };
          default:
            return row;
        }
      }),
    );
    show(`${action} — ${record.candidateName} @ ${record.clientName} (demo)`);
  }, [show]);

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
        accessorKey: 'trialHours',
        header: 'Trial Hours',
        cell: ({ getValue }) => (
          <span className="tabular-nums">{getValue() as number} hrs</span>
        ),
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
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ getValue }) => <RatingDisplay rating={getValue() as number | null} />,
      },
      {
        accessorKey: 'converted',
        header: 'Converted',
        cell: ({ getValue }) => {
          const converted = getValue() as boolean;
          return converted ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4" />
              No
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <TrialRequestActions
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
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
                <FilterSelect
                  label="Rating"
                  value={filters.rating}
                  onChange={(v) => updateFilter('rating', v)}
                  options={[
                    { value: 'all', label: 'All ratings' },
                    { value: 'unrated', label: 'Unrated' },
                    { value: '4plus', label: '4+ stars' },
                    { value: '3plus', label: '3+ stars' },
                    { value: 'below3', label: 'Below 3' },
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
            return [r.clientName, r.candidateName, r.roleTitle].some((field) =>
              field.toLowerCase().includes(q),
            );
          }}
        />
      </div>
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
