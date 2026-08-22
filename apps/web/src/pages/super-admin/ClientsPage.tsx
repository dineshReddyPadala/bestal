import { Button, Dialog, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAdminClients, useAdminMutations } from '../../hooks/api/useAdmin';
import { clientsApi } from '../../lib/api/clients';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  name: string;
  industry: string | null;
  contactName?: string | null;
  contactEmail: string | null;
  accountManagerId?: number | null;
  accountManagerName: string | null;
  status: string;
  createdAt: string;
};

export function SuperAdminClientsPage() {
  const navigate = useNavigate();
  const { message, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useAdminClients({ limit: 100, ...searchParam });
  const { data: managersData } = useQuery({
    queryKey: ['clients', 'account-managers'],
    queryFn: async () => (await clientsApi.listAccountManagers()).data,
  });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];
  const managerUsers = managersData ?? [];

  const [assignTarget, setAssignTarget] = useState<Row | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);

  function openAssign(row: Row) {
    setAssignTarget(row);
    setSelectedManagerId(
      row.accountManagerId != null && row.accountManagerId !== undefined
        ? String(row.accountManagerId)
        : '',
    );
  }

  async function confirmAssign() {
    if (!assignTarget) return;
    setAssignBusy(true);
    try {
      const accountManagerId =
        selectedManagerId.trim() === '' ? null : Number(selectedManagerId);
      if (selectedManagerId.trim() !== '' && !Number.isFinite(accountManagerId)) {
        showError('Select an account manager');
        return;
      }
      await mutations.assignAccountManager.mutateAsync({
        id: assignTarget.id,
        accountManagerId,
      });
      show(
        accountManagerId
          ? 'Account manager assigned'
          : 'Account manager cleared',
      );
      setAssignTarget(null);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to assign account manager');
    } finally {
      setAssignBusy(false);
    }
  }

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
            { id: 'edit', label: 'Edit Client', href: `/super-admin/clients/${r.id}/edit` },
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
              id: 'delete',
              label: 'Delete Client',
              destructive: true,
              onSelect: () =>
                requestConfirm({
                  title: 'Delete Client?',
                  description: `${r.name} and linked portal users will be removed. The contact can sign up again from the public registration form.`,
                  confirmLabel: 'Delete Client',
                  destructive: true,
                  onConfirm: async () => {
                    await mutations.deleteClient.mutateAsync(r.id);
                    show('Client deleted');
                  },
                  onError: showError,
                }),
            },
            {
              id: 'assign',
              label: 'Assign Account Manager',
              separatorBefore: true,
              onSelect: () => openAssign(r),
            },
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
          key={search}
          columns={columns}
          data={rows}
          searchPlaceholder="Search clients…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          stickyHeader
          fillHeight
          dense
        />
      </ListingPageShell>

      <Dialog
        open={assignTarget != null}
        onClose={() => {
          if (assignBusy) return;
          setAssignTarget(null);
        }}
        title="Assign account manager"
        description={
          assignTarget
            ? `Choose an account manager for ${assignTarget.name}.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setAssignTarget(null)}
              disabled={assignBusy}
            >
              Cancel
            </Button>
            <Button onClick={() => void confirmAssign()} disabled={assignBusy}>
              {assignBusy ? 'Saving…' : 'Save assignment'}
            </Button>
          </>
        }
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Account manager</span>
          <Select
            value={selectedManagerId}
            onChange={(e) => setSelectedManagerId(e.target.value)}
          >
            <option value="">— Unassigned —</option>
            {managerUsers.map((u) => (
              <option key={String(u.id)} value={String(u.id)}>
                {u.label}
              </option>
            ))}
          </Select>
          {managerUsers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No eligible users found. Create a non–super-admin user first.
            </p>
          ) : null}
        </label>
      </Dialog>

      {confirmDialog}
    </>
  );
}
