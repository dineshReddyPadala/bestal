import { formatDate } from '@bestal/shared-utils';
import { Avatar, Button, Dialog, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal, Plus, UserX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ClientForm } from '../forms/ClientForm';
import type { ClientFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useClientMutations, useClientsList } from '../../hooks/api/useClients';
import { clientsApi } from '../../lib/api/clients';
import { queryKeys } from '../../hooks/api/query-keys';
import type { ClientListItem } from '../../lib/api/types';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type ClientAction = 'View' | 'Edit' | 'Deactivate';

type ClientManagementViewProps = {
  title?: string;
  description?: string;
  clientDetailBasePath?: string;
};

const defaultFilters = {
  industry: 'all',
  status: 'all',
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function ClientRowActions({
  record,
  detailPath,
  onAction,
}: {
  record: ClientListItem;
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
  clientDetailBasePath,
}: ClientManagementViewProps) {
  const navigate = useNavigate();
  const { message, show } = useDemoToast();
  const [filters, setFilters] = useState(defaultFilters);
  const [formOpen, setFormOpen] = useState<'add' | 'edit' | null>(null);
  const [editingRecord, setEditingRecord] = useState<ClientListItem | null>(null);
  const mutations = useClientMutations();

  const { data: editingClient } = useQuery({
    queryKey: queryKeys.clients.detail(editingRecord?.id ?? 0),
    queryFn: () => clientsApi.get(editingRecord!.id),
    enabled: formOpen === 'edit' && editingRecord != null,
  });

  const listParams = useMemo(
    () => ({
      limit: 100,
      sort: '-createdAt',
      status: filters.status === 'all' ? undefined : filters.status,
    }),
    [filters.status],
  );

  const { data, isLoading, isError, error } = useClientsList(listParams);

  const filteredData = useMemo(() => {
    let rows = [...(data?.data ?? [])];
    if (filters.industry !== 'all') {
      rows = rows.filter((r) => (r.industry ?? '') === filters.industry);
    }
    return rows;
  }, [data, filters.industry]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    for (const row of data?.data ?? []) {
      if (row.industry) set.add(row.industry);
    }
    return [...set].sort();
  }, [data]);

  const handleAction = useCallback(
    (record: ClientListItem, action: ClientAction) => {
      if (action === 'Edit') {
        setEditingRecord(record);
        setFormOpen('edit');
        return;
      }
      if (action === 'Deactivate') {
        void (async () => {
          try {
            await mutations.update.mutateAsync({ id: record.id, body: { status: 'INACTIVE' } });
            show(`Deactivated — ${record.name}`);
          } catch (err) {
            show(err instanceof Error ? err.message : 'Failed to deactivate client');
          }
        })();
        return;
      }
      show(`${action} — ${record.name}`);
    },
    [mutations.update, show],
  );

  const handleFormSubmit = useCallback(
    (values: ClientFormValues) => {
      void (async () => {
        try {
          if (formOpen === 'edit' && editingRecord) {
            await mutations.update.mutateAsync({
              id: editingRecord.id,
              body: {
                name: values.company,
                industry: values.industry || undefined,
                contactEmail: values.email || undefined,
                contactPhone: values.phone || undefined,
                contactName: values.primaryContact || undefined,
                companySize: values.companySize || undefined,
                headquarters: values.headquarters || undefined,
                website: values.website || undefined,
                paymentTerms: values.paymentTerms || undefined,
              },
            });
            show(`Client updated — ${values.company}`);
          } else {
            await mutations.create.mutateAsync({
              name: values.company,
              slug: slugify(values.company),
              industry: values.industry || undefined,
              contactEmail: values.email || undefined,
              contactPhone: values.phone || undefined,
              contactName: values.primaryContact || undefined,
              companySize: values.companySize || undefined,
              headquarters: values.headquarters || undefined,
              website: values.website || undefined,
              paymentTerms: values.paymentTerms || undefined,
            });
            show(`Client created — ${values.company}`);
          }
          setFormOpen(null);
          setEditingRecord(null);
        } catch (err) {
          show(err instanceof Error ? err.message : 'Failed to save client');
        }
      })();
    },
    [editingRecord, formOpen, mutations.create, mutations.update, show],
  );

  const columns = useMemo<ColumnDef<ClientListItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Company',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.name} size="sm" />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'industry',
        header: 'Industry',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{(getValue() as string | null) || '—'}</span>
        ),
      },
      {
        accessorKey: 'contactEmail',
        header: 'Email',
        cell: ({ getValue }) => {
          const email = getValue() as string | null;
          if (!email) return '—';
          return (
            <a
              href={`mailto:${email}`}
              className="text-sm text-brand hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {email}
            </a>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'accountManagerName',
        header: 'Account Manager',
        cell: ({ getValue }) => (getValue() as string | null) || '—',
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => formatDate(String(getValue())),
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

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        loading={isLoading}
        loadingLabel="Loading clients…"
        error={isError ? (error instanceof Error ? error.message : 'Failed to load clients') : null}
      >
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by company, email, or manager…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
          emptyTitle="No clients yet"
          emptyDescription="Create a client to start engagement workflows."
          onRowClick={
            clientDetailBasePath
              ? (row) => navigate(`${clientDetailBasePath}/${row.id}`)
              : undefined
          }
          toolbar={
            <Button
              size="sm"
              onClick={() => {
                setEditingRecord(null);
                setFormOpen('add');
              }}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add client
            </Button>
          }
          filters={
            <ListingFiltersRow>
              <ListingFilterSelect
                label="INDUSTRY"
                value={filters.industry}
                onChange={(v) => setFilters((prev) => ({ ...prev, industry: v }))}
                options={[
                  { value: 'all', label: 'All industries' },
                  ...industries.map((i) => ({ value: i, label: i })),
                ]}
              />
              <ListingFilterSelect
                label="STATUS"
                value={filters.status}
                onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                options={[
                  { value: 'all', label: 'All statuses' },
                  { value: 'PROSPECT', label: 'Prospect' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                  { value: 'SUSPENDED', label: 'Suspended' },
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [r.name, r.industry ?? '', r.contactEmail ?? '', r.accountManagerName ?? '']
              .join(' ')
              .toLowerCase()
              .includes(q);
          }}
        />
      </ListingPageShell>

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
            editingRecord && editingClient
              ? {
                  company: editingClient.name,
                  industry: editingClient.industry ?? '',
                  primaryContact: editingClient.contactName ?? '',
                  email: editingClient.contactEmail ?? '',
                  phone: editingClient.contactPhone ?? '',
                  accountManager: editingRecord.accountManagerName ?? '',
                  companySize: editingClient.companySize ?? '',
                  headquarters: editingClient.headquarters ?? '',
                  website: editingClient.website ?? '',
                  paymentTerms: editingClient.paymentTerms ?? '',
                }
              : editingRecord
                ? {
                    company: editingRecord.name,
                    industry: editingRecord.industry ?? '',
                    primaryContact: '',
                    email: editingRecord.contactEmail ?? '',
                    phone: '',
                    accountManager: editingRecord.accountManagerName ?? '',
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
    </>
  );
}
