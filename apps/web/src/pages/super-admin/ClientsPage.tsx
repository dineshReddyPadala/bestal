import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
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
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { data, isLoading, isError, error } = useAdminClients({ limit: 100 });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Company',
        cell: ({ row }) => (
          <Link
            className="font-medium text-brand hover:underline"
            to={`/super-admin/clients/${row.original.id}`}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'industry',
        header: 'Industry',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
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
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const active = r.status === 'ACTIVE';
          const items: ActionMenuItem[] = [
            { id: 'view', label: 'View Client', href: `/super-admin/clients/${r.id}` },
            { id: 'edit', label: 'Edit Client', href: `/super-admin/clients/${r.id}` },
            {
              id: 'activate',
              label: 'Activate Client',
              hidden: active,
              onSelect: () =>
                void mutations.setClientStatus
                  .mutateAsync({ id: r.id, status: 'ACTIVE' })
                  .then(() => show('Client activated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
            },
            {
              id: 'suspend',
              label: 'Suspend Client',
              hidden: !active,
              destructive: true,
              separatorBefore: true,
              onSelect: () =>
                requestConfirm({
                  title: 'Suspend Client?',
                  description: `${r.name} will lose portal access until reactivated. Existing deployments remain visible for review.`,
                  confirmLabel: 'Suspend Client',
                  destructive: true,
                  onConfirm: async () => {
                    await mutations.setClientStatus.mutateAsync({ id: r.id, status: 'SUSPENDED' });
                    show('Client suspended');
                  },
                }),
            },
            {
              id: 'assign',
              label: 'Assign Account Manager',
              separatorBefore: true,
              onSelect: () => {
                const raw = window.prompt('Account manager user ID (leave blank to clear)');
                if (raw == null) return;
                const accountManagerId = raw.trim() === '' ? null : Number(raw);
                if (raw.trim() !== '' && !accountManagerId) {
                  showError('Enter a valid user id');
                  return;
                }
                void mutations.assignAccountManager
                  .mutateAsync({ id: r.id, accountManagerId })
                  .then(() => show('Account manager updated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
              },
            },
            {
              id: 'trials',
              label: 'View Trials',
              href: '/super-admin/trials',
              separatorBefore: true,
            },
            { id: 'deployments', label: 'View Deployments', href: '/super-admin/deployments' },
            { id: 'revenue', label: 'View Revenue', href: '/super-admin/reports?tab=revenue' },
            { id: 'audit', label: 'View Audit History', href: '/super-admin/audit-logs' },
          ];
          return <ActionMenu items={items} label={`Actions for ${r.name}`} />;
        },
      },
    ],
    [mutations, requestConfirm, show, showError],
  );

  return (
    <>
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
        <TanStackDataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Search clients…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
        />
      </ListingPageShell>
      {confirmDialog}
    </>
  );
}
