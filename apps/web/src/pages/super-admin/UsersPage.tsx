import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { UserPlus } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminMutations, useAdminUsers } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';
import { isPlatformRole } from '../../lib/rbac/roles';

type Row = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
  clientId?: number | null;
  clientName?: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

function userDisplayName(row: Row) {
  return `${row.firstName} ${row.lastName}`.trim() || row.email;
}

export function SuperAdminUsersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get('role');
  const { user } = useAuth();
  const { message, variant, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { data, isLoading, isError, error } = useAdminUsers({ limit: 100, sort: '-createdAt' });
  const mutations = useAdminMutations();
  const allRows = (data?.data ?? []) as unknown as Row[];
  const rows = useMemo(() => {
    if (!roleFilter || !isPlatformRole(roleFilter)) return allRows;
    return allRows.filter((r) => r.role === roleFilter);
  }, [allRows, roleFilter]);

  const activeSuperAdminCount = useMemo(
    () => allRows.filter((r) => r.role === 'SUPER_ADMIN' && r.isActive).length,
    [allRows],
  );

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
        cell: ({ row }) => (
          <Link
            className="font-medium text-brand hover:underline"
            to={`/super-admin/users/${row.original.id}`}
          >
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
        id: 'client',
        header: 'Client',
        cell: ({ row }) => {
          if (row.original.role !== 'CLIENT') {
            return <span className="text-muted-foreground">—</span>;
          }
          if (row.original.clientName) {
            return <span className="text-sm text-foreground">{row.original.clientName}</span>;
          }
          return <span className="text-sm text-muted-foreground">Not linked</span>;
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
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const isSelf = user?.id === r.id;
          const isLastActiveSuperAdmin =
            r.role === 'SUPER_ADMIN' && r.isActive && activeSuperAdminCount <= 1;
          const name = userDisplayName(r);

          const items: ActionMenuItem[] = [
            {
              id: 'edit',
              label: 'Edit User',
              href: `/super-admin/users/${r.id}`,
            },
            {
              id: 'change-role',
              label: 'Assign Role',
              href: `/super-admin/users/${r.id}`,
              hidden: isSelf,
            },
            {
              id: 'view-role',
              label: 'View Role Definition',
              href: r.role && isPlatformRole(r.role) ? `/super-admin/roles/${r.role}` : '/super-admin/roles',
              hidden: !r.role,
            },
            {
              id: 'activate',
              label: 'Activate User',
              hidden: r.isActive,
              onSelect: () =>
                void mutations.setUserStatus
                  .mutateAsync({ id: r.id, isActive: true })
                  .then(() => show('User activated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
            },
            {
              id: 'deactivate',
              label: 'Deactivate User',
              hidden: !r.isActive || isSelf,
              disabled: isLastActiveSuperAdmin,
              disabledReason: 'Cannot deactivate the last active Super Admin',
              destructive: true,
              separatorBefore: true,
              onSelect: () =>
                requestConfirm({
                  title: 'Deactivate User?',
                  description: `${name} will no longer be able to access the platform. You can reactivate this user later.`,
                  confirmLabel: 'Deactivate User',
                  destructive: true,
                  onConfirm: async () => {
                    await mutations.setUserStatus.mutateAsync({ id: r.id, isActive: false });
                    show('User deactivated');
                  },
                }),
            },
            {
              id: 'reset',
              label: 'Reset Password',
              separatorBefore: true,
              onSelect: () =>
                requestConfirm({
                  title: 'Reset Password?',
                  description: `A temporary password reset email will be sent to ${r.email}.`,
                  confirmLabel: 'Reset Password',
                  onConfirm: async () => {
                    await mutations.resetUserPassword.mutateAsync(r.id);
                    show('Password reset emailed');
                  },
                }),
            },
            {
              id: 'resend',
              label: 'Resend Invitation',
              onSelect: () =>
                void mutations.resendInvite
                  .mutateAsync(r.id)
                  .then(() => show('Invitation resent'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
            },
            {
              id: 'audit',
              label: 'View Audit History',
              href: '/super-admin/audit-logs',
              separatorBefore: true,
            },
          ];

          return <ActionMenu items={items} label={`Actions for ${name}`} />;
        },
      },
    ],
    [
      activeSuperAdminCount,
      mutations,
      requestConfirm,
      show,
      showError,
      user?.id,
    ],
  );

  return (
    <>
      <ListingPageShell
        title="User Management"
        message={message}
        messageVariant={variant}
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
        <div className="mb-4">
          {roleFilter ? (
            <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Filtered by <StatusBadge status={roleFilter} />{' '}
              <Link className="font-medium text-brand hover:underline" to="/super-admin/users">
                Clear filter
              </Link>
            </div>
          ) : null}
        </div>
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
      {confirmDialog}
    </>
  );
}
