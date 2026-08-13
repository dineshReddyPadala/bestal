import { Button, Dialog, Input, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useAdminMutations, useAdminRoles } from '../../hooks/api/useAdmin';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';

type RoleRow = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  portal: string;
  baseRole: string;
  isSystem: boolean;
  isProtected: boolean;
  isActive: boolean;
  permissionCount: number;
  userCount: number;
};

export function SuperAdminRolesPage() {
  const navigate = useNavigate();
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useAdminRoles({ ...searchParam });
  const mutations = useAdminMutations();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { show, showError, message, dismiss } = useDemoToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [portal, setPortal] = useState('ADMIN');
  const [baseRole, setBaseRole] = useState('VIEWER');
  const [busy, setBusy] = useState(false);

  const rows = useMemo<RoleRow[]>(() => {
    const list = (data?.data ?? []) as Array<Record<string, unknown>>;
    return list.map((r) => ({
      id: Number(r.id),
      code: String(r.code),
      name: String(r.name),
      description: (r.description as string | null) ?? null,
      portal: String(r.portal),
      baseRole: String(r.baseRole),
      isSystem: Boolean(r.isSystem),
      isProtected: Boolean(r.isProtected),
      isActive: Boolean(r.isActive),
      permissionCount: Array.isArray(r.permissions) ? r.permissions.length : 0,
      userCount: Number(r.userCount ?? 0),
    }));
  }, [data]);

  const columns = useMemo<ColumnDef<RoleRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Role',
        cell: ({ row }) => (
          <Link
            className="font-medium text-brand hover:underline"
            to={`/super-admin/roles/${row.original.code}`}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'code',
        header: 'Code',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'portal', header: 'Portal' },
      {
        accessorKey: 'userCount',
        header: 'Assigned users',
      },
      {
        accessorKey: 'permissionCount',
        header: 'Permissions',
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) =>
          row.original.isProtected ? (
            <span className="text-xs text-muted-foreground">Protected</span>
          ) : row.original.isSystem ? (
            <span className="text-xs text-muted-foreground">System</span>
          ) : (
            <span className="text-xs text-muted-foreground">Custom</span>
          ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const items: ActionMenuItem[] = r.isProtected
            ? [
                { id: 'view', label: 'View Role', href: `/super-admin/roles/${r.code}` },
                {
                  id: 'users',
                  label: 'View Assigned Users',
                  href: `/super-admin/roles/${r.code}?tab=users`,
                },
                {
                  id: 'perms',
                  label: 'View Permissions',
                  href: `/super-admin/roles/${r.code}?tab=permissions`,
                },
              ]
            : [
                { id: 'view', label: 'View Role', href: `/super-admin/roles/${r.code}` },
                {
                  id: 'users',
                  label: 'View Assigned Users',
                  href: `/super-admin/roles/${r.code}?tab=users`,
                },
                {
                  id: 'edit',
                  label: 'Edit Role Permissions',
                  href: `/super-admin/roles/${r.code}?tab=permissions&edit=1`,
                },
              ];

          if (!r.isSystem && !r.isProtected) {
            items.push({
              id: 'delete',
              label: 'Delete Role',
              destructive: true,
              separatorBefore: true,
              onSelect: () =>
                requestConfirm({
                  title: `Delete role ${r.name}?`,
                  description: 'This cannot be undone. Users must not be assigned to this role.',
                  confirmLabel: 'Delete',
                  destructive: true,
                  onConfirm: async () => {
                    try {
                      await mutations.deleteRole.mutateAsync(r.code);
                      show('Role deleted');
                    } catch (e) {
                      showError(e instanceof Error ? e.message : 'Delete failed');
                    }
                  },
                }),
            });
          }

          return <ActionMenu items={items} label={`Actions for ${r.name}`} />;
        },
      },
    ],
    [mutations, requestConfirm, show, showError],
  );

  async function handleCreate() {
    if (!name.trim()) {
      showError('Role name is required');
      return;
    }
    setBusy(true);
    try {
      const created = await mutations.createRole.mutateAsync({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        portal,
        baseRole,
        permissions: [],
      });
      show('Role created');
      setCreateOpen(false);
      setName('');
      setCode('');
      setDescription('');
      setPortal('ADMIN');
      setBaseRole('VIEWER');
      navigate(`/super-admin/roles/${String(created.code)}?tab=permissions&edit=1`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ListingPageShell
      title="Role Management"
      message={message}
      onMessageDismiss={dismiss}
      error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
      loading={isLoading}
      loadingLabel="Loading roles…"
    >
      <TanStackDataTable
        key={search}
        columns={columns}
        data={rows}
        searchPlaceholder="Search roles…"
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        serverSideSearch
        pageSize={12}
        stickyHeader
        fillHeight
        dense
        toolbar={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Create role
          </Button>
        }
      />
      {confirmDialog}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create role"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={busy}>
              {busy ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            placeholder="Role name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Code (optional, e.g. OPS_LEAD)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Select value={portal} onChange={(e) => setPortal(e.target.value)}>
            <option value="ADMIN">Admin portal</option>
            <option value="RECRUITER">Recruiter portal</option>
            <option value="SALES">Sales portal</option>
            <option value="CLIENT">Client portal</option>
          </Select>
          <Select value={baseRole} onChange={(e) => setBaseRole(e.target.value)}>
            <option value="ADMIN">Base: Admin</option>
            <option value="RECRUITER">Base: Recruiter</option>
            <option value="SALES">Base: Sales</option>
            <option value="CLIENT">Base: Client</option>
            <option value="VIEWER">Base: Viewer</option>
          </Select>
        </div>
      </Dialog>
    </ListingPageShell>
  );
}
