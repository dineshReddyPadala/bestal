import { Button, PageHeader, StatusBadge } from '@bestal/ui';
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  useAdminMutations,
  useAdminRole,
  useAdminUsers,
} from '../../hooks/api/useAdmin';
import {
  PERMISSION_GROUPS,
  permissionLabel,
} from '../../lib/rbac/roles';

export function SuperAdminRoleDetailPage() {
  const navigate = useNavigate();
  const { role: roleParam } = useParams();
  const [params, setSearchParams] = useSearchParams();
  const tab = params.get('tab') === 'permissions' ? 'permissions' : 'overview';
  const editRequested = params.get('edit') === '1';

  const { data: role, isLoading, isError, error } = useAdminRole(roleParam);
  const { data: usersData } = useAdminUsers({ limit: 100 });
  const mutations = useAdminMutations();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { show, showError, message } = useDemoToast();

  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const code = String(role?.code ?? roleParam ?? '');
  const isProtected = Boolean(role?.isProtected);
  const canEdit = Boolean(role) && !isProtected;

  useEffect(() => {
    if (!role) return;
    const perms = Array.isArray(role.permissions) ? (role.permissions as string[]) : [];
    setSelected(perms);
    if (editRequested && canEdit) setEditing(true);
  }, [role, editRequested, canEdit]);

  const assignedUsers = useMemo(() => {
    if (!role) return [];
    const baseRole = String(role.baseRole);
    return ((usersData?.data ?? []) as Array<Record<string, unknown>>).filter(
      (u) => u.role === baseRole || u.role === code,
    );
  }, [usersData, role, code]);

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

  const permissions = Array.isArray(role.permissions) ? (role.permissions as string[]) : [];

  const menuItems: ActionMenuItem[] = isProtected
    ? [
        {
          id: 'perms',
          label: 'View Permissions',
          href: `/super-admin/roles/${code}?tab=permissions`,
        },
        {
          id: 'users',
          label: 'View Assigned Users',
          href: `/super-admin/users?role=${String(role.baseRole)}`,
        },
        {
          id: 'audit',
          label: 'View Audit History',
          href: '/super-admin/audit-logs',
          separatorBefore: true,
        },
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
        },
        {
          id: 'users',
          label: 'View Assigned Users',
          href: `/super-admin/users?role=${String(role.baseRole)}`,
        },
        {
          id: 'matrix',
          label: 'View Permission Matrix',
          href: '/super-admin/roles/permission-matrix',
          separatorBefore: true,
        },
        {
          id: 'audit',
          label: 'View Audit History',
          href: '/super-admin/audit-logs',
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
      await mutations.updateRole.mutateAsync({
        code,
        body: { permissions: selected },
      });
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

      {message ? (
        <div className="mx-6 mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

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
          variant={tab === 'permissions' ? 'primary' : 'outline'}
          to={`/super-admin/roles/${code}?tab=permissions`}
        >
          Permissions
        </Button>
        <Button size="sm" variant="outline" to="/super-admin/roles/permission-matrix">
          Permission matrix
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
                  <dt className="text-muted-foreground">Code</dt>
                  <dd className="mt-0.5">
                    <StatusBadge status={code} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Portal</dt>
                  <dd className="mt-0.5 font-medium">{String(role.portal)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Base role</dt>
                  <dd className="mt-0.5 font-medium">{String(role.baseRole)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="mt-0.5 font-medium">
                    {isProtected
                      ? 'Protected system role'
                      : role.isSystem
                        ? 'System role'
                        : 'Custom role'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Permissions</dt>
                  <dd className="mt-0.5 font-medium">{permissions.length}</dd>
                </div>
              </dl>
              {isProtected ? (
                <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  SUPER_ADMIN permissions cannot be edited, disabled, or removed from this portal.
                </p>
              ) : null}
            </section>

            <section className="rounded-xl border border-border/80 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Assigned users ({assignedUsers.length})</h3>
                <Link
                  to={`/super-admin/users?role=${String(role.baseRole)}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Manage in User Management
                </Link>
              </div>
              {assignedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users currently assigned.</p>
              ) : (
                <ul className="divide-y divide-border/70">
                  {assignedUsers.slice(0, 12).map((u) => (
                    <li key={String(u.id)} className="flex items-center justify-between py-2 text-sm">
                      <Link
                        to={`/super-admin/users/${u.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {String(u.firstName)} {String(u.lastName)}
                      </Link>
                      <span className="text-muted-foreground">{String(u.email)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
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
                            <code className="ml-auto hidden text-[10px] text-muted-foreground lg:inline">
                              {permission}
                            </code>
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
      {confirmDialog}
    </div>
  );
}
