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
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useDemoToast } from '../../lib/use-demo-toast';
import { isPlatformRole } from '../../lib/rbac/roles';

type Row = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
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
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useAdminUsers({
    limit: 100,
    sort: '-updatedAt',
    ...(roleFilter && isPlatformRole(roleFilter) ? { role: roleFilter } : {}),
    ...searchParam,
  });
  const { data: superAdminData } = useAdminUsers({
    limit: 100,
    role: 'SUPER_ADMIN',
    isActive: true,
  });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];
  const activeSuperAdminCount = (superAdminData?.data ?? []).length;

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
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => {
          const phone = getValue() as string | null;
          return phone ? <span className="text-sm text-foreground">{phone}</span> : '—';
        },
      },
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
              id: 'delete',
              label: 'Delete User',
              hidden: isSelf,
              disabled: isLastActiveSuperAdmin,
              disabledReason: 'Cannot delete the last active Super Admin',
              destructive: true,
              onSelect: () =>
                requestConfirm({
                  title: 'Delete User?',
                  description: `${name} will be permanently removed from user lists. They can register again with the same email if applicable.`,
                  confirmLabel: 'Delete User',
                  destructive: true,
                  onConfirm: async () => {
                    await mutations.deleteUser.mutateAsync(r.id);
                    show('User deleted');
                  },
                  onError: showError,
                }),
            },
            {
              id: 'reset',
              label: 'Reset Password',
              separatorBefore: true,
              onSelect: () =>
                requestConfirm({
                  title: 'Reset Password?',
                  description: `A password reset link will be sent to ${r.email}. The user can set a new password from that link.`,
                  confirmLabel: 'Send Reset Email',
                  onConfirm: async () => {
                    const result = await mutations.resetUserPassword.mutateAsync(r.id);
                    show(
                      result.emailSent
                        ? `Password reset email sent to ${r.email}`
                        : 'Password reset link created — email was not sent (check SMTP / Platform Settings)',
                      result.emailSent ? 'success' : 'error',
                    );
                  },
                  onError: showError,
                }),
            },
            {
              id: 'resend',
              label: 'Resend Invitation',
              onSelect: () =>
                requestConfirm({
                  title: 'Resend Invitation?',
                  description: `A new invitation email with portal login credentials will be sent to ${r.email}.`,
                  confirmLabel: 'Resend Invitation',
                  onConfirm: async () => {
                    const result = await mutations.resendInvite.mutateAsync(r.id);
                    show(
                      result.emailSent
                        ? `Invitation email sent to ${r.email}`
                        : 'Invitation not sent — email delivery failed (check SMTP / Platform Settings)',
                      result.emailSent ? 'success' : 'error',
                    );
                  },
                  onError: showError,
                }),
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
          key={search}
          columns={columns}
          data={rows}
          searchPlaceholder="Search users…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          toolbar={
            <Button size="sm" onClick={() => navigate('/super-admin/users/new')}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Create user
            </Button>
          }
        />
      </ListingPageShell>
      {confirmDialog}
    </>
  );
}
