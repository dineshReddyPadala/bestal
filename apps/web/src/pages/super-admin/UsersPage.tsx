import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { UserPlus } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { useAdminMutations, useAdminUsers } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export function SuperAdminUsersPage() {
  const navigate = useNavigate();
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useAdminUsers({ limit: 100, sort: '-createdAt' });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <Link className="font-medium text-brand hover:underline" to={`/super-admin/users/${row.original.id}`}>
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? <StatusBadge status={v} /> : '—';
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusBadge status={(getValue() as boolean) ? 'ACTIVE' : 'INACTIVE'} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'lastLoginAt',
        header: 'Last login',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? new Date(v).toLocaleString() : 'Never';
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.setUserStatus
                  .mutateAsync({ id: row.original.id, isActive: !row.original.isActive })
                  .then(() => show(row.original.isActive ? 'Deactivated' : 'Activated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.resetUserPassword
                  .mutateAsync(row.original.id)
                  .then(() => show('Password reset emailed'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Reset password
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.resendInvite
                  .mutateAsync(row.original.id)
                  .then(() => show('Invite resent'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Resend invite
            </Button>
          </div>
        ),
      },
    ],
    [mutations, show, showError],
  );

  return (
    <ListingPageShell
      title="Users"
      message={message}
      error={isError ? (error instanceof Error ? error.message : 'Failed to load') : null}
      loading={isLoading}
      loadingLabel="Loading users…"
      actions={
        <Button size="sm" onClick={() => navigate('/super-admin/users/new')}>
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Create user
        </Button>
      }
    >
      <TanStackDataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search users…"
        pageSize={12}
        stickyHeader
        fillHeight
        dense
      />
    </ListingPageShell>
  );
}
