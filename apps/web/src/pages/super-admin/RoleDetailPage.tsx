import { Button, Dialog, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../../components/ui/ToastHost';
import { getApiErrorMessage } from '../../lib/api/errors';
import {
  useAdminMutations,
  useAdminRole,
  useAdminRoleUsers,
  useAdminUsers,
} from '../../hooks/api/useAdmin';
import { useClientsList } from '../../hooks/api/useClients';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import {
  PERMISSION_GROUPS,
  permissionLabel,
  portalLabel,
  sanitizePermissionKeys,
} from '../../lib/rbac/roles';

type RoleTab = 'overview' | 'users' | 'permissions';

function resolveTab(value: string | null): RoleTab {
  if (value === 'permissions' || value === 'users') return value;
  return 'overview';
}

export function SuperAdminRoleDetailPage() {
  const navigate = useNavigate();
  const { role: roleParam } = useParams();
  const [params, setSearchParams] = useSearchParams();
  const tab = resolveTab(params.get('tab'));
  const editRequested = params.get('edit') === '1';

  const { data: role, isLoading, isError, error } = useAdminRole(roleParam);
  const {
    searchInput: usersSearchInput,
    setSearchInput: setUsersSearchInput,
    search: usersSearch,
    searchParam: usersSearchParam,
  } = useDebouncedSearch();
  const { data: allAssignedData } = useAdminRoleUsers(roleParam);
  const { data: roleUsersData, isLoading: usersLoading } = useAdminRoleUsers(
    roleParam,
    tab === 'users' ? usersSearchParam : undefined,
  );
  const { data: allUsersData } = useAdminUsers({ limit: 200 });
  const { data: clientsData } = useClientsList({ limit: 100, sort: 'name' });
  const mutations = useAdminMutations();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { show, showError, message, variant, dismiss } = useDemoToast();

  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const code = String(role?.code ?? roleParam ?? '');
  const baseRole = String(role?.baseRole ?? '');
  const isProtected = Boolean(role?.isProtected);
  const canEdit = Boolean(role) && !isProtected;
  const canAssignUsers = Boolean(role) && !isProtected && baseRole !== 'SUPER_ADMIN';
  const allAssignedUsers = allAssignedData?.data ?? [];
  const assignedUsers = tab === 'users' ? (roleUsersData?.data ?? []) : allAssignedUsers;
  const assignedIds = useMemo(
    () => new Set(allAssignedUsers.map((u) => Number(u.id))),
    [allAssignedUsers],
  );
  const availableUsers = useMemo(() => {
    const list = allUsersData?.data ?? [];
    return list.filter((u) => !assignedIds.has(Number(u.id)));
  }, [allUsersData, assignedIds]);
  const clients = clientsData?.data ?? [];
  const needsClient = baseRole === 'CLIENT';

  useEffect(() => {
    if (!role) return;
    const perms = Array.isArray(role.permissions) ? (role.permissions as string[]) : [];
    setSelected(sanitizePermissionKeys(perms));
    if (editRequested && canEdit) setEditing(true);
  }, [role, editRequested, canEdit]);

  const permissions = useMemo(() => {
    const perms = Array.isArray(role?.permissions) ? (role!.permissions as string[]) : [];
    return sanitizePermissionKeys(perms);
  }, [role]);

  const userColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        accessorFn: (row) =>
          `${String(row.firstName ?? '')} ${String(row.lastName ?? '')}`.trim(),
        cell: ({ row }) => {
          const id = Number(row.original.id);
          const name =
            `${String(row.original.firstName ?? '')} ${String(row.original.lastName ?? '')}`.trim();
          return (
            <Link
              to={`/super-admin/users/${id}`}
              className="font-medium text-brand hover:underline"
            >
              {name || String(row.original.email)}
            </Link>
          );
        },
      },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'client',
        header: 'Client',
        cell: ({ row }) =>
          row.original.clientName ? String(row.original.clientName) : '—',
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusBadge status={getValue() ? 'ACTIVE' : 'INACTIVE'} />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          if (!canAssignUsers) return null;
          const id = Number(row.original.id);
          const name =
            `${String(row.original.firstName ?? '')} ${String(row.original.lastName ?? '')}`.trim();
          return (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() =>
                requestConfirm({
                  title: `Remove ${name || row.original.email} from this role?`,
                  description:
                    'They will be moved to the Viewer role. You can reassign them later.',
                  confirmLabel: 'Remove',
                  destructive: true,
                  onConfirm: async () => {
                    try {
                      await mutations.unassignUserFromRole.mutateAsync({
                        code,
                        userId: id,
                      });
                      show('User removed from role');
                    } catch (e) {
                      showError(getApiErrorMessage(e, 'Remove failed'));
                    }
                  },
                })
              }
            >
              Remove
            </Button>
          );
        },
      },
    ],
    [canAssignUsers, code, mutations.unassignUserFromRole, requestConfirm, show, showError],
  );

  const roleTypeLabel = isProtected
    ? 'Protected system role'
    : role?.isSystem
      ? 'System role'
      : 'Custom role';

  if (!roleParam) {
    return <Navigate to="/super-admin/roles" replace />;
  }

  if (isError) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Role not found'}
        </p>
        <Link to="/super-admin/roles" className="mt-2 inline-block text-sm text-brand hover:underline">
          Back to roles
        </Link>
      </div>
    );
  }

  if (isLoading || !role) {
    return <div className="px-6 py-8 text-sm text-muted-foreground">Loading role…</div>;
  }

  const menuItems: ActionMenuItem[] = [
    {
      id: 'users',
      label: 'View Assigned Users',
      href: `/super-admin/roles/${code}?tab=users`,
    },
    ...(isProtected
      ? [
          {
            id: 'perms',
            label: 'View Permissions',
            href: `/super-admin/roles/${code}?tab=permissions`,
          } satisfies ActionMenuItem,
        ]
      : [
          {
            id: 'edit',
            label: editing ? 'Done editing' : 'Edit Permissions',
            onSelect: () => {
              if (editing) {
                setEditing(false);
                setSelected(permissions);
                const next = new URLSearchParams(params);
                next.delete('edit');
                setSearchParams(next, { replace: true });
              } else {
                setEditing(true);
                const next = new URLSearchParams(params);
                next.set('tab', 'permissions');
                next.set('edit', '1');
                setSearchParams(next, { replace: true });
              }
            },
          } satisfies ActionMenuItem,
        ]),
    {
      id: 'audit',
      label: 'View Audit History',
      href: '/super-admin/audit-logs',
      separatorBefore: true,
    },
  ];

  function togglePermission(permission: string) {
    if (!editing || isProtected) return;
    if (permission === 'admin:platform') return;
    setSelected((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  }

  async function savePermissions() {
    setBusy(true);
    try {
      const clean = sanitizePermissionKeys(selected);
      await mutations.updateRole.mutateAsync({
        code,
        body: { permissions: clean },
      });
      setSelected(clean);
      show('Permissions saved');
      setEditing(false);
      const next = new URLSearchParams(params);
      next.delete('edit');
      setSearchParams(next, { replace: true });
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleAssignUser() {
    const userId = Number(selectedUserId);
    if (!userId) {
      showError('Select a user');
      return;
    }
    if (needsClient && !selectedClientId) {
      showError('Select a client account for CLIENT role');
      return;
    }
    setBusy(true);
    try {
      await mutations.assignUserToRole.mutateAsync({
        code,
        userId,
        clientId: needsClient ? Number(selectedClientId) : undefined,
      });
      show('User assigned to role');
      setAddOpen(false);
      setSelectedUserId('');
      setSelectedClientId('');
    } catch (e) {
      showError(getApiErrorMessage(e, 'Assign failed'));
    } finally {
      setBusy(false);
    }
  }

  function renderAssignedUsers(compact = false) {
    return (
      <section className="rounded-xl border border-border/80 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            Assigned users ({allAssignedUsers.length})
          </h3>
          {canAssignUsers ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                to={`/super-admin/users/new?role=${encodeURIComponent(baseRole)}&assignRole=${encodeURIComponent(code)}`}
              >
                Create new user
              </Button>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Add existing user
              </Button>
            </div>
          ) : null}
        </div>
        {usersLoading ? (
          <p className="text-sm text-muted-foreground">Loading users…</p>
        ) : compact ? (
          allAssignedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users assigned to this role yet.</p>
          ) : (
            <ul className="space-y-2">
              {allAssignedUsers.slice(0, 8).map((u) => {
                const id = Number(u.id);
                const name = `${String(u.firstName ?? '')} ${String(u.lastName ?? '')}`.trim();
                return (
                  <li key={id} className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        to={`/super-admin/users/${id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {name || String(u.email)}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{String(u.email)}</p>
                    </div>
                    <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </li>
                );
              })}
              {allAssignedUsers.length > 8 ? (
                <li>
                  <Link
                    to={`/super-admin/roles/${code}?tab=users`}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    View all {allAssignedUsers.length} users
                  </Link>
                </li>
              ) : null}
            </ul>
          )
        ) : (
          <TanStackDataTable
            key={usersSearch}
            columns={userColumns}
            data={assignedUsers as Record<string, unknown>[]}
            searchPlaceholder="Search assigned users…"
            searchValue={usersSearchInput}
            onSearchChange={setUsersSearchInput}
            serverSideSearch
            pageSize={12}
            dense
            emptyTitle="No users assigned"
            emptyDescription="Add an existing user or create a new one for this role."
          />
        )}
        {isProtected ? (
          <p className="mt-3 text-xs text-muted-foreground">
            SUPER_ADMIN assignments are managed outside this screen.
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <div>
      <PageHeader
        title={String(role.name)}
        description={(role.description as string | null) ?? undefined}
        breadcrumbs={
          <Link to="/super-admin/roles" className="hover:text-foreground">
            Role Management
          </Link>
        }
        actions={<ActionMenu items={menuItems} label={`Actions for ${String(role.name)}`} />}
      />

      <ToastHost message={message} variant={variant} onDismiss={dismiss} />

      <div className="flex flex-wrap gap-2 px-6 pb-4">
        <Button
          size="sm"
          variant={tab === 'overview' ? 'primary' : 'outline'}
          to={`/super-admin/roles/${code}`}
        >
          Overview
        </Button>
        <Button
          size="sm"
          variant={tab === 'users' ? 'primary' : 'outline'}
          to={`/super-admin/roles/${code}?tab=users`}
        >
          Assigned users
        </Button>
        <Button
          size="sm"
          variant={tab === 'permissions' ? 'primary' : 'outline'}
          to={`/super-admin/roles/${code}?tab=permissions`}
        >
          Permissions
        </Button>
        {canEdit && tab === 'permissions' ? (
          editing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setSelected(permissions);
                }}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => void savePermissions()} disabled={busy}>
                {busy ? 'Saving…' : 'Save permissions'}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setEditing(true);
                const next = new URLSearchParams(params);
                next.set('tab', 'permissions');
                next.set('edit', '1');
                setSearchParams(next, { replace: true });
              }}
            >
              Edit permissions
            </Button>
          )
        ) : null}
      </div>

      <div className="space-y-4 px-6 pb-8">
        {tab === 'overview' ? (
          <>
            <section className="rounded-xl border border-border/80 p-4">
              <h3 className="mb-3 text-sm font-semibold">Role details</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Role Code</dt>
                  <dd className="mt-0.5 font-mono text-sm font-semibold tracking-wide text-foreground">
                    {code}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Portal</dt>
                  <dd className="mt-0.5 font-medium">{portalLabel(String(role.portal))}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Base role</dt>
                  <dd className="mt-0.5 font-medium">{baseRole}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Role Type</dt>
                  <dd className="mt-0.5 font-medium">{roleTypeLabel}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Permissions ({permissions.length})</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {permissions.length === 0 ? (
                      <span className="text-muted-foreground">No permissions assigned</span>
                    ) : (
                      permissions.map((p) => (
                        <span
                          key={p}
                          className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
                        >
                          {permissionLabel(p)}
                        </span>
                      ))
                    )}
                  </dd>
                </div>
              </dl>
              {isProtected ? (
                <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  SUPER_ADMIN permissions cannot be edited, disabled, or removed from this portal.
                </p>
              ) : null}
            </section>
            {renderAssignedUsers(true)}
          </>
        ) : tab === 'users' ? (
          renderAssignedUsers()
        ) : (
          <section className="rounded-xl border border-border/80 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {isProtected ? 'View permissions' : editing ? 'Edit permissions' : 'Role permissions'}
              </h3>
              {editing ? (
                <p className="text-xs text-muted-foreground">
                  Changes apply to authorization after save (users may need to refresh session).
                </p>
              ) : null}
            </div>
            <div className="space-y-6">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.id}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </h4>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {group.permissions.map((permission) => {
                      const granted = editing
                        ? selected.includes(permission)
                        : permissions.includes(permission);
                      const locked =
                        isProtected || permission === 'admin:platform' || !editing;
                      return (
                        <li key={permission}>
                          <label
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                              locked && !editing ? '' : 'hover:bg-muted/40'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 accent-brand"
                              checked={granted}
                              disabled={locked}
                              onChange={() => togglePermission(permission)}
                            />
                            <span className={granted ? 'font-medium' : 'text-muted-foreground'}>
                              {permissionLabel(permission)}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            {canEdit && !role.isSystem ? (
              <div className="mt-6 border-t border-border/70 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() =>
                    requestConfirm({
                      title: `Delete role ${String(role.name)}?`,
                      description: 'This cannot be undone.',
                      confirmLabel: 'Delete',
                      destructive: true,
                      onConfirm: async () => {
                        try {
                          await mutations.deleteRole.mutateAsync(code);
                          show('Role deleted');
                          navigate('/super-admin/roles');
                        } catch (e) {
                          showError(e instanceof Error ? e.message : 'Delete failed');
                        }
                      },
                    })
                  }
                >
                  Delete role
                </Button>
              </div>
            ) : null}
          </section>
        )}
      </div>

      <Dialog
        open={addOpen}
        onClose={() => {
          if (busy) return;
          setAddOpen(false);
          setSelectedUserId('');
          setSelectedClientId('');
        }}
        title={`Add user to ${String(role.name)}`}
        description="Assign an existing user to this role. Their portal access follows the role’s base role."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleAssignUser()} disabled={busy}>
              {busy ? 'Assigning…' : 'Assign user'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">User</span>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select user…</option>
              {availableUsers.map((u) => (
                <option key={Number(u.id)} value={String(u.id)}>
                  {`${String(u.firstName ?? '')} ${String(u.lastName ?? '')}`.trim() ||
                    String(u.email)}{' '}
                  ({String(u.email)}) — {String(u.role ?? '—')}
                </option>
              ))}
            </Select>
            {availableUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                All users already have this role, or create a new user instead.
              </p>
            ) : null}
          </label>
          {needsClient ? (
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Client account</span>
              <Select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
        </div>
      </Dialog>
      {confirmDialog}
    </div>
  );
}
