import {
  deploymentCandidates,
  deploymentClients,
  deploymentManagementRecords,
  deploymentStatuses,
  formatDeploymentTimezone,
  type DeploymentManagementRecord,
  type DeploymentStatus,
} from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { Button, Dialog, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DeploymentForm } from '../forms/DeploymentForm';
import { buildDeploymentPayload, type DeploymentFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

type DeploymentAction = 'Pause' | 'Terminate' | 'Complete' | 'Replace';

type DeploymentManagementViewProps = {
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

function isActivePeriod(start: string, end: string | null): boolean {
  const s = new Date(start);
  if (end) {
    const e = new Date(end);
    return s <= TODAY && e >= TODAY;
  }
  return s <= TODAY;
}

function isUpcoming(start: string): boolean {
  return new Date(start) > TODAY;
}

function isPast(end: string | null): boolean {
  if (!end) return false;
  return new Date(end) < TODAY;
}

function exportDeploymentsCsv(rows: DeploymentManagementRecord[]) {
  const headers = [
    'Client',
    'Candidate',
    'Start',
    'End',
    'Bill Rate',
    'Pay Rate',
    'Margin %',
    'Hours',
    'Timezone',
    'Manager',
    'Status',
  ];
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.clientName,
      r.candidateName,
      r.startDate,
      r.endDate ?? '',
      r.billRate,
      r.payRate,
      r.marginPercent,
      r.hoursPerWeek,
      r.timezone,
      r.manager,
      r.status,
    ]
      .map(escape)
      .join(','),
  );
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `deployments-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function DeploymentActions({
  record,
  onAction,
}: {
  record: DeploymentManagementRecord;
  onAction: (action: DeploymentAction) => void;
}) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const btn = (
    label: DeploymentAction,
    variant: 'primary' | 'outline' = 'primary',
    className?: string,
  ) => (
    <Button
      key={label}
      size="sm"
      variant={variant}
      className={className}
      onClick={() => onAction(label)}
    >
      {label}
    </Button>
  );

  switch (record.status) {
    case 'ACTIVE':
      return (
        <div className="flex flex-wrap gap-1.5" onClick={stop}>
          {btn('Pause', 'outline')}
          {btn('Terminate', 'outline', 'text-destructive hover:text-destructive')}
          {btn('Complete')}
          {btn('Replace', 'outline')}
        </div>
      );
    case 'PENDING':
      return (
        <div className="flex flex-wrap gap-1.5" onClick={stop}>
          {btn('Pause', 'outline')}
          {btn('Terminate', 'outline', 'text-destructive hover:text-destructive')}
          {btn('Replace', 'outline')}
        </div>
      );
    case 'ON_HOLD':
      return (
        <div className="flex flex-wrap gap-1.5" onClick={stop}>
          {btn('Terminate', 'outline', 'text-destructive hover:text-destructive')}
          {btn('Complete')}
          {btn('Replace', 'outline')}
        </div>
      );
    case 'COMPLETED':
    case 'TERMINATED':
      return (
        <div className="flex flex-wrap gap-1.5" onClick={stop}>
          {btn('Replace', 'outline')}
        </div>
      );
    default:
      return <span className="text-muted-foreground">—</span>;
  }
}

export function DeploymentManagementView({
  title = 'Deployment Management',
  description = 'Manage active placements — rates, margins, and lifecycle actions',
}: DeploymentManagementViewProps) {
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<DeploymentManagementRecord[]>(() => [
    ...deploymentManagementRecords,
  ]);
  const [filters, setFilters] = useState(defaultFilters);
  const [createOpen, setCreateOpen] = useState(false);

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
      } else if (filters.date === 'ongoing') {
        rows = rows.filter((r) => !r.endDate);
      }
    }

    rows.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return rows;
  }, [records, filters]);

  const handleExport = useCallback(() => {
    exportDeploymentsCsv(filteredData);
    show(`Exported ${filteredData.length} deployment(s) to CSV (demo)`);
  }, [filteredData, show]);

  const handleAction = useCallback(
    (record: DeploymentManagementRecord, action: DeploymentAction) => {
      if (action === 'Replace') {
        show(`Replace — ${record.candidateName} @ ${record.clientName} (demo)`);
        return;
      }

      setRecords((prev) =>
        prev.map((row) => {
          if (row.id !== record.id) return row;

          switch (action) {
            case 'Pause':
              return { ...row, status: 'ON_HOLD' as DeploymentStatus };
            case 'Terminate':
              return { ...row, status: 'TERMINATED' as DeploymentStatus };
            case 'Complete':
              return { ...row, status: 'COMPLETED' as DeploymentStatus };
            default:
              return row;
          }
        }),
      );
      show(`${action} — ${record.candidateName} @ ${record.clientName} (demo)`);
    },
    [show],
  );

  const handleCreateSubmit = useCallback(
    (values: DeploymentFormValues) => {
      const payload = buildDeploymentPayload(values);
      const nextId = Math.max(0, ...records.map((r) => r.id)) + 1;
      setRecords((prev) => [
        ...prev,
        {
          id: nextId,
          clientId: payload.clientId,
          clientName: values.clientName,
          candidateId: payload.candidateId,
          candidateName: values.candidateName,
          roleTitle: values.roleTitle,
          startDate: values.startDate,
          endDate: values.endDate ?? null,
          billRate: values.billRate,
          payRate: values.payRate,
          marginPercent: payload.marginPercent,
          currency: values.currency,
          hoursPerWeek: values.hoursPerWeek,
          timezone: values.timezone,
          manager: payload.manager,
          status: 'PENDING',
        },
      ]);
      show(`Deployment created — ${values.candidateName} @ ${values.clientName} (demo)`);
      setCreateOpen(false);
    },
    [records, show],
  );

  const columns = useMemo<ColumnDef<DeploymentManagementRecord>[]>(
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
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'End',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return (
            <span className="text-muted-foreground">{val ? formatDate(val) : 'Ongoing'}</span>
          );
        },
      },
      {
        accessorKey: 'billRate',
        header: 'Bill Rate',
        cell: ({ row }) =>
          `${formatCurrency(row.original.billRate, row.original.currency)}/hr`,
      },
      {
        accessorKey: 'payRate',
        header: 'Pay Rate',
        cell: ({ row }) =>
          `${formatCurrency(row.original.payRate, row.original.currency)}/hr`,
      },
      {
        accessorKey: 'marginPercent',
        header: 'Margin',
        cell: ({ getValue }) => (
          <span className="font-medium tabular-nums text-emerald-600">{getValue() as number}%</span>
        ),
      },
      {
        accessorKey: 'hoursPerWeek',
        header: 'Hours',
        cell: ({ getValue }) => <span className="tabular-nums">{getValue() as number}/wk</span>,
      },
      {
        accessorKey: 'timezone',
        header: 'Timezone',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground">
            {formatDeploymentTimezone(getValue() as string)}
          </span>
        ),
      },
      {
        accessorKey: 'manager',
        header: 'Manager',
        cell: ({ getValue }) => <span>{getValue() as string}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DeploymentActions
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
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New deployment
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={filteredData.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by client, candidate, manager, or timezone…"
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
                    ...deploymentStatuses.map((s) => ({
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
                    { value: 'upcoming', label: 'Upcoming starts' },
                    { value: 'active', label: 'Active period' },
                    { value: 'ongoing', label: 'Open-ended' },
                    { value: 'past', label: 'Ended' },
                  ]}
                />
                <FilterSelect
                  label="Client"
                  value={filters.client}
                  onChange={(v) => updateFilter('client', v)}
                  options={[
                    { value: 'all', label: 'All clients' },
                    ...deploymentClients.map((c) => ({ value: c, label: c })),
                  ]}
                />
                <FilterSelect
                  label="Candidate"
                  value={filters.candidate}
                  onChange={(v) => updateFilter('candidate', v)}
                  options={[
                    { value: 'all', label: 'All candidates' },
                    ...deploymentCandidates.map((c) => ({ value: c, label: c })),
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
            return [
              r.clientName,
              r.candidateName,
              r.roleTitle,
              r.manager,
              r.timezone,
              formatDeploymentTimezone(r.timezone),
            ].some((field) => field.toLowerCase().includes(q));
          }}
        />
      </div>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New deployment"
        className="max-w-2xl"
      >
        <DeploymentForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setCreateOpen(false)}
        />
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
