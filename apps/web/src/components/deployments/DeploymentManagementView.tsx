import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { Button, Dialog, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Download, MoreHorizontal, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useClientsList } from '../../hooks/api/useClients';
import { useDeploymentMutations, useDeploymentsList } from '../../hooks/api/useDeployments';
import type { DeploymentListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import { DeploymentForm } from '../forms/DeploymentForm';
import type { DeploymentFormValues } from '../../lib/entity-field-metadata';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type DeploymentAction = 'Activate' | 'Terminate';

type DeploymentManagementViewProps = {
  title?: string;
  description?: string;
};

const defaultFilters = {
  status: 'all',
  client: 'all',
  candidate: 'all',
};

function exportDeploymentsCsv(rows: DeploymentListItem[]) {
  const headers = [
    'Client',
    'Candidate',
    'Role',
    'Start',
    'End',
    'Bill Rate',
    'Currency',
    'Status',
    'Placement Type',
  ];
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.clientName,
      r.candidateName,
      r.roleTitle,
      r.startDate ?? '',
      r.endDate ?? '',
      r.billingRate ?? '',
      r.currency ?? '',
      r.status,
      r.placementType,
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

function DeploymentRowActions({
  record,
  onAction,
}: {
  record: DeploymentListItem;
  onAction: (action: DeploymentAction) => void;
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

  const actions: { label: DeploymentAction; disabled?: boolean; variant?: 'danger' }[] = [];
  if (record.status === 'PENDING') {
    actions.push({ label: 'Activate' });
    actions.push({ label: 'Terminate', variant: 'danger' });
  } else if (record.status === 'ACTIVE' || record.status === 'ON_HOLD') {
    actions.push({ label: 'Terminate', variant: 'danger' });
  }

  if (actions.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Deployment actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          {actions.map(({ label, disabled, variant }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 ${
                variant === 'danger' ? 'text-destructive' : 'text-foreground'
              }`}
              onClick={() => {
                if (!disabled) onAction(label);
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

export function DeploymentManagementView({
  title = 'Deployment Management',
}: DeploymentManagementViewProps) {
  const { message, show } = useDemoToast();
  const { data, isLoading, isError, error } = useDeploymentsList({ limit: 100, sort: '-startDate' });
  const { data: clientsData } = useClientsList({ limit: 100 });
  const { data: candidatesData } = useCandidatesList({ limit: 100 });
  const mutations = useDeploymentMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [createOpen, setCreateOpen] = useState(false);

  const records = useMemo(() => data?.data ?? [], [data]);

  const clientOptions = useMemo(
    () => (clientsData?.data ?? []).map((c) => ({ id: c.id, name: c.name })),
    [clientsData],
  );

  const candidateOptions = useMemo(
    () =>
      (candidatesData?.data ?? []).map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
      })),
    [candidatesData],
  );

  const statusOptions = useMemo(
    () => [...new Set(records.map((r) => r.status))].sort(),
    [records],
  );

  const clientNames = useMemo(
    () => [...new Set(records.map((r) => r.clientName))].sort(),
    [records],
  );

  const candidateNames = useMemo(
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

    rows.sort((a, b) => {
      const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
      return bTime - aTime;
    });

    return rows;
  }, [records, filters]);

  const handleExport = useCallback(() => {
    exportDeploymentsCsv(filteredData);
    show(`Exported ${filteredData.length} deployment(s) to CSV`);
  }, [filteredData, show]);

  const handleAction = useCallback(
    async (record: DeploymentListItem, action: DeploymentAction) => {
      try {
        if (action === 'Activate') {
          await mutations.activate.mutateAsync(record.id);
          show(`Activated — ${record.candidateName} @ ${record.clientName}`);
        } else {
          await mutations.terminate.mutateAsync({ id: record.id });
          show(`Terminated — ${record.candidateName} @ ${record.clientName}`);
        }
      } catch (err) {
        show(err instanceof Error ? err.message : `${action} failed`);
      }
    },
    [mutations.activate, mutations.terminate, show],
  );

  const handleCreateSubmit = useCallback(
    async (values: DeploymentFormValues) => {
      const client = clientOptions.find((c) => c.name === values.clientName);
      const candidate = candidateOptions.find((c) => c.name === values.candidateName);
      if (!client || !candidate) {
        show('Select a valid client and candidate');
        return;
      }

      try {
        await mutations.create.mutateAsync({
          clientId: client.id,
          candidateId: candidate.id,
          placementType: values.placementType,
          roleTitle: values.roleTitle,
          startDate: values.startDate,
          endDate: values.endDate || undefined,
          billingRate: values.billingRate,
          candidatePayRate: values.candidatePayRate || undefined,
          grossMarginPerHour: values.grossMarginPerHour ?? undefined,
          expectedHoursPerWeek: values.expectedHoursPerWeek ?? undefined,
          timezone: values.timezone || undefined,
          reportingManagerName: values.reportingManagerName || undefined,
          reportingManagerEmail: values.reportingManagerEmail || undefined,
          currency: values.currency,
          workLocation: values.workLocation || undefined,
          notes: values.notes || undefined,
        });
        show(`Deployment created — ${values.candidateName} @ ${values.clientName}`);
        setCreateOpen(false);
      } catch (err) {
        show(err instanceof Error ? err.message : 'Create failed');
      }
    },
    [candidateOptions, clientOptions, mutations.create, show],
  );

  const columns = useMemo<ColumnDef<DeploymentListItem>[]>(
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
          <span className="text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return (
            <span className="text-muted-foreground">{val ? formatDate(val) : '—'}</span>
          );
        },
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
        accessorKey: 'billingRate',
        header: 'Bill Rate',
        cell: ({ row }) => {
          const rate = row.original.billingRate;
          if (rate == null) return <span className="text-muted-foreground">—</span>;
          return `${formatCurrency(rate, row.original.currency ?? 'USD')}/hr`;
        },
      },
      {
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{(getValue() as string | null) ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'placementType',
        header: 'Placement',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DeploymentRowActions
            record={row.original}
            onAction={(action) => void handleAction(row.original, action)}
          />
        ),
      },
    ],
    [handleAction],
  );

  const updateFilter = (key: keyof typeof defaultFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const listError = isError
    ? error instanceof Error
      ? error.message
      : 'Failed to load deployments'
    : null;

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        error={listError}
        loading={isLoading}
        loadingLabel="Loading deployments…"
        actions={
          <>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New deployment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredData.length === 0}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </>
        }
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
                  ...statusOptions.map((s) => ({
                    value: s,
                    label: s.replace(/_/g, ' '),
                  })),
                ]}
              />
              <ListingFilterSelect
                label="CLIENT"
                value={filters.client}
                onChange={(v) => updateFilter('client', v)}
                options={[
                  { value: 'all', label: 'All clients' },
                  ...clientNames.map((c) => ({ value: c, label: c })),
                ]}
              />
              <ListingFilterSelect
                label="CANDIDATE"
                value={filters.candidate}
                onChange={(v) => updateFilter('candidate', v)}
                options={[
                  { value: 'all', label: 'All candidates' },
                  ...candidateNames.map((c) => ({ value: c, label: c })),
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [r.clientName, r.candidateName, r.roleTitle, r.status, r.placementType].some(
              (field) => String(field).toLowerCase().includes(q),
            );
          }}
        />
      </ListingPageShell>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New deployment"
        scrollable
        className="max-w-2xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="deployment-form">
              Create deployment
            </Button>
          </>
        }
      >
        <DeploymentForm
          formId="deployment-form"
          showActions={false}
          clients={clientOptions}
          candidates={candidateOptions}
          onSubmit={(values) => void handleCreateSubmit(values)}
          onCancel={() => setCreateOpen(false)}
        />
      </Dialog>
    </>
  );
}
