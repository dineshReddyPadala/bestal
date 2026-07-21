import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { useAdminClients, useAdminMutations } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  name: string;
  industry: string | null;
  contactName?: string | null;
  contactEmail: string | null;
  accountManagerName: string | null;
  status: string;
  createdAt: string;
};

export function SuperAdminClientsPage() {
  const navigate = useNavigate();
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useAdminClients({ limit: 100 });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Company',
        cell: ({ row }) => (
          <Link className="font-medium text-brand hover:underline" to={`/super-admin/clients/${row.original.id}`}>
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'industry', header: 'Industry', cell: ({ getValue }) => (getValue() as string) || '—' },
      {
        id: 'contact',
        header: 'Primary contact',
        cell: ({ row }) => row.original.contactName || row.original.contactEmail || '—',
      },
      {
        accessorKey: 'accountManagerName',
        header: 'Account manager',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.setClientStatus
                  .mutateAsync({
                    id: row.original.id,
                    status: row.original.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                  })
                  .then(() => show('Status updated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              {row.original.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </Button>
          </div>
        ),
      },
    ],
    [mutations, show, showError],
  );

  return (
    <ListingPageShell
      title="Clients"
      message={message}
      error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
      loading={isLoading}
      loadingLabel="Loading clients…"
      actions={
        <Button size="sm" onClick={() => navigate('/super-admin/clients/new')}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create client
        </Button>
      }
    >
      <TanStackDataTable columns={columns} data={rows} searchPlaceholder="Search clients…" pageSize={12} stickyHeader fillHeight dense />
    </ListingPageShell>
  );
}
