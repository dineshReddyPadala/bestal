import {
  clientIndustries,
  clientManagementRecords,
  clientManagers,
  clientStatuses,
  companyLogoUrl,
  type ClientManagementRecord,
  type ClientManagementStatus,
} from '@bestal/mock-data';
import { formatCurrency } from '@bestal/shared-utils';
import { Avatar, Button, Dialog, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, UserCog, UserX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientForm } from '../forms/ClientForm';
import { buildClientPayload, type ClientFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

type ClientAction = 'View' | 'Edit' | 'Deactivate' | 'Assign Manager';

type ClientManagementViewProps = {
  title?: string;
  description?: string;
  clientDetailBasePath?: string;
};

const defaultFilters = {
  industry: 'all',
  status: 'all',
  manager: 'all',
};

function ClientRowActions({
  record,
  detailPath,
  onAction,
}: {
  record: ClientManagementRecord;
  detailPath?: string;
  onAction: (action: ClientAction) => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const deactivated = record.status === 'INACTIVE' || record.status === 'SUSPENDED';

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const actions: {
    label: ClientAction;
    icon: React.ReactNode;
    disabled?: boolean;
    variant?: 'danger';
  }[] = [
    { label: 'View', icon: <Eye className="h-3.5 w-3.5" /> },
    { label: 'Edit', icon: <Edit className="h-3.5 w-3.5" /> },
    {
      label: 'Deactivate',
      icon: <UserX className="h-3.5 w-3.5" />,
      disabled: deactivated,
      variant: 'danger',
    },
    { label: 'Assign Manager', icon: <UserCog className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="relative flex justify-end" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Client actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[168px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          {actions.map(({ label, icon, disabled, variant }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 ${
                variant === 'danger' ? 'text-destructive' : 'text-foreground'
              }`}
              onClick={() => {
                if (disabled) return;
                if (label === 'View' && detailPath) {
                  navigate(`${detailPath}/${record.id}`);
                  setOpen(false);
                  return;
                }
                onAction(label);
                setOpen(false);
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClientManagementView({
  title = 'Client Management',
  description = 'Enterprise accounts, contacts, commercial terms, and engagement metrics',
  clientDetailBasePath,
}: ClientManagementViewProps) {
  const navigate = useNavigate();
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<ClientManagementRecord[]>(() => [
    ...clientManagementRecords,
  ]);
  const [filters, setFilters] = useState(defaultFilters);
  const [formOpen, setFormOpen] = useState<'add' | 'edit' | null>(null);
  const [editingRecord, setEditingRecord] = useState<ClientManagementRecord | null>(null);

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.industry !== 'all') {
      rows = rows.filter((r) => r.industry === filters.industry);
    }
    if (filters.status !== 'all') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.manager !== 'all') {
      rows = rows.filter((r) => r.accountManager === filters.manager);
    }

    rows.sort((a, b) => b.revenue - a.revenue);

    return rows;
  }, [records, filters]);

  const handleAction = useCallback(
    (record: ClientManagementRecord, action: ClientAction) => {
      if (action === 'Edit') {
        setEditingRecord(record);
        setFormOpen('edit');
        return;
      }
      if (action === 'Deactivate') {
        setRecords((prev) =>
          prev.map((row) =>
            row.id === record.id ? { ...row, status: 'INACTIVE' as ClientManagementStatus } : row,
          ),
        );
      }
      if (action === 'Assign Manager') {
        setRecords((prev) =>
          prev.map((row) => {
            if (row.id !== record.id) return row;
            const idx = clientManagers.indexOf(row.accountManager as (typeof clientManagers)[number]);
            const next = clientManagers[(idx + 1) % clientManagers.length]!;
            return { ...row, accountManager: next };
          }),
        );
      }
      show(`${action} — ${record.company} (demo)`);
    },
    [show],
  );

  const handleFormSubmit = useCallback(
    (values: ClientFormValues) => {
      const payload = buildClientPayload(values, editingRecord ?? undefined);
      if (formOpen === 'edit' && editingRecord) {
        setRecords((prev) =>
          prev.map((row) =>
            row.id === editingRecord.id
              ? {
                  ...row,
                  company: values.company,
                  industry: values.industry,
                  primaryContact: values.primaryContact,
                  email: values.email,
                  phone: values.phone ?? row.phone,
                  paymentTerms: payload.paymentTerms,
                  accountManager: values.accountManager,
                  logoUrl: payload.logoUrl ?? row.logoUrl,
                }
              : row,
          ),
        );
        show(`Client updated — ${values.company} (demo)`);
      } else {
        const nextId = Math.max(0, ...records.map((r) => r.id)) + 1;
        setRecords((prev) => [
          ...prev,
          {
            id: nextId,
            company: values.company,
            industry: values.industry,
            primaryContact: values.primaryContact,
            email: values.email,
            phone: values.phone ?? '',
            paymentTerms: payload.paymentTerms,
            status: 'PROSPECT',
            accountManager: values.accountManager,
            candidateCount: 0,
            deploymentCount: 0,
            revenue: 0,
            currency: 'USD',
            logoUrl: payload.logoUrl ?? companyLogoUrl(values.company),
          },
        ]);
        show(`Client created — ${values.company} (demo)`);
      }
      setFormOpen(null);
      setEditingRecord(null);
    },
    [editingRecord, formOpen, records, show],
  );

  const columns = useMemo<ColumnDef<ClientManagementRecord>[]>(
    () => [
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.company} src={row.original.logoUrl} size="sm" />
            <span className="font-medium">{row.original.company}</span>
          </div>
        ),
      },
      {
        accessorKey: 'industry',
        header: 'Industry',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'primaryContact',
        header: 'Primary Contact',
        cell: ({ getValue }) => <span>{getValue() as string}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => (
          <a
            href={`mailto:${getValue() as string}`}
            className="text-sm text-brand hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {getValue() as string}
          </a>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => (
          <span className="text-sm text-muted-foreground tabular-nums">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'accountManager',
        header: 'Account Manager',
        cell: ({ getValue }) => <span>{getValue() as string}</span>,
      },
      {
        accessorKey: 'candidateCount',
        header: () => <span className="block text-right">Candidates</span>,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ getValue }) => (
          <span className="block font-medium tabular-nums">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: 'deploymentCount',
        header: () => <span className="block text-right">Deployments</span>,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ getValue }) => (
          <span className="block font-medium tabular-nums">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: 'revenue',
        header: () => <span className="block text-right">Revenue</span>,
        meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
        cell: ({ row }) => (
          <span className="block font-semibold tabular-nums">
            {formatCurrency(row.original.revenue, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        meta: { headerClassName: 'w-12 text-right', cellClassName: 'w-12 text-right' },
        cell: ({ row }) => (
          <ClientRowActions
            record={row.original}
            detailPath={clientDetailBasePath}
            onAction={(action) => handleAction(row.original, action)}
          />
        ),
      },
    ],
    [clientDetailBasePath, handleAction],
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
          <Button
            onClick={() => {
              setEditingRecord(null);
              setFormOpen('add');
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add client
          </Button>
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
          searchPlaceholder="Search by company, contact, email, or manager…"
          pageSize={10}
          stickyHeader
          onRowClick={
            clientDetailBasePath
              ? (row) => navigate(`${clientDetailBasePath}/${row.id}`)
              : undefined
          }
          filters={
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Filters
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <FilterSelect
                  label="Industry"
                  value={filters.industry}
                  onChange={(v) => updateFilter('industry', v)}
                  options={[
                    { value: 'all', label: 'All industries' },
                    ...clientIndustries.map((i) => ({ value: i, label: i })),
                  ]}
                />
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  onChange={(v) => updateFilter('status', v)}
                  options={[
                    { value: 'all', label: 'All statuses' },
                    ...clientStatuses.map((s) => ({
                      value: s,
                      label: s.charAt(0) + s.slice(1).toLowerCase(),
                    })),
                  ]}
                />
                <FilterSelect
                  label="Manager"
                  value={filters.manager}
                  onChange={(v) => updateFilter('manager', v)}
                  options={[
                    { value: 'all', label: 'All managers' },
                    ...clientManagers.map((m) => ({ value: m, label: m })),
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
              r.company,
              r.industry,
              r.primaryContact,
              r.email,
              r.phone,
              r.accountManager,
            ].some((field) => field.toLowerCase().includes(q));
          }}
        />
      </div>

      <Dialog
        open={formOpen !== null}
        onClose={() => {
          setFormOpen(null);
          setEditingRecord(null);
        }}
        title={formOpen === 'edit' ? 'Edit client' : 'Add client'}
        className="max-w-2xl"
      >
        <ClientForm
          key={editingRecord?.id ?? 'new'}
          formId="client-mgmt-form"
          submitLabel={formOpen === 'edit' ? 'Save changes' : 'Create client'}
          defaultValues={
            editingRecord
              ? {
                  company: editingRecord.company,
                  industry: editingRecord.industry,
                  primaryContact: editingRecord.primaryContact,
                  email: editingRecord.email,
                  phone: editingRecord.phone,
                  accountManager: editingRecord.accountManager,
                }
              : undefined
          }
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormOpen(null);
            setEditingRecord(null);
          }}
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
