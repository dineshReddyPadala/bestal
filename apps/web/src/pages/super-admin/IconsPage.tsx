import { Button, Dialog, Input, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { IconUploadField } from '../../components/super-admin/IconUploadField';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAdminIcons, useAdminMutations } from '../../hooks/api/useAdmin';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useDemoToast } from '../../lib/use-demo-toast';

type IconRow = {
  id: number;
  name: string;
  url: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

export function SuperAdminIconsPage() {
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useAdminIcons({ limit: 100, ...searchParam });
  const mutations = useAdminMutations();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<IconRow | null>(null);
  const [name, setName] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo<IconRow[]>(() => {
    return ((data?.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      url: String(row.url),
      isActive: Boolean(row.isActive),
      usageCount: Number(row.usageCount ?? 0),
      createdAt: String(row.createdAt ?? ''),
      updatedAt: String(row.updatedAt ?? ''),
    }));
  }, [data]);

  function resetForm() {
    setName('');
    setIconFile(null);
    setSelected(null);
  }

  function openCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function openEdit(row: IconRow) {
    setSelected(row);
    setName(row.name);
    setIconFile(null);
    setEditOpen(true);
  }

  function openView(row: IconRow) {
    setSelected(row);
    setViewOpen(true);
  }

  async function handleCreate() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showError('Icon name is required');
      return;
    }
    if (!iconFile) {
      showError('Icon image is required');
      return;
    }
    setBusy(true);
    try {
      await mutations.createIcon.mutateAsync({ name: trimmedName, file: iconFile });
      show('Icon created');
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create icon');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate() {
    if (!selected) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      showError('Icon name is required');
      return;
    }
    setBusy(true);
    try {
      await mutations.updateIcon.mutateAsync({
        id: selected.id,
        body: { name: trimmedName },
      });
      if (iconFile) {
        await mutations.uploadIconFile.mutateAsync({ id: selected.id, file: iconFile });
      }
      show('Icon updated');
      setEditOpen(false);
      resetForm();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update icon');
    } finally {
      setBusy(false);
    }
  }

  const columns = useMemo<ColumnDef<IconRow>[]>(
    () => [
      {
        id: 'preview',
        header: 'Preview',
        cell: ({ row }) =>
          row.original.url && row.original.url !== 'pending' ? (
            <img
              src={row.original.url}
              alt=""
              className="h-8 w-8 rounded-md object-cover ring-1 ring-border/60"
            />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'name',
        header: 'Icon Name',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'usageCount',
        header: 'Used By',
        cell: ({ getValue }) =>
          `${getValue() as number} communit${(getValue() as number) === 1 ? 'y' : 'ies'}`,
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => (
          <StatusBadge status={(getValue() as boolean) ? 'ACTIVE' : 'INACTIVE'} />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const inUse = r.usageCount > 0;
          const items: ActionMenuItem[] = [
            {
              id: 'view',
              label: 'View Details',
              onSelect: () => openView(r),
            },
            {
              id: 'edit',
              label: 'Edit',
              onSelect: () => openEdit(r),
            },
            {
              id: 'delete',
              label: 'Delete',
              destructive: true,
              separatorBefore: true,
              disabled: inUse,
              disabledReason:
                'Cannot delete this icon because it is assigned to one or more skill communities.',
              onSelect: () =>
                requestConfirm({
                  title: 'Delete Icon?',
                  description: `${r.name} will be permanently deleted.`,
                  confirmLabel: 'Delete',
                  destructive: true,
                  onConfirm: async () => {
                    await mutations.deleteIcon.mutateAsync(r.id);
                    show('Icon deleted');
                  },
                  onError: showError,
                }),
            },
          ];
          return <ActionMenu items={items} label={`Actions for ${r.name}`} />;
        },
      },
    ],
    [mutations.deleteIcon, requestConfirm, show, showError],
  );

  return (
    <>
      <ListingPageShell
        title="Icons"
        message={message}
        messageVariant={variant}
        onMessageDismiss={dismiss}
        error={isError ? (error instanceof Error ? error.message : 'Failed to load icons') : null}
        loading={isLoading}
        loadingLabel="Loading icons…"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Icon
          </Button>
        }
      >
        <TanStackDataTable
          key={search}
          columns={columns}
          data={rows}
          searchPlaceholder="Search icons…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          stickyHeader
          fillHeight
          dense
        />
      </ListingPageShell>
      {confirmDialog}

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create icon"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreate()} disabled={busy}>
              {busy ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input placeholder="Icon name" value={name} onChange={(e) => setName(e.target.value)} />
          <IconUploadField file={iconFile} onChange={setIconFile} required />
        </div>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit icon"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleUpdate()} disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input placeholder="Icon name" value={name} onChange={(e) => setName(e.target.value)} />
          <IconUploadField
            file={iconFile}
            onChange={setIconFile}
            currentPreviewUrl={selected?.url}
            label="Replace icon image"
          />
        </div>
      </Dialog>

      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Icon details"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            {selected ? (
              <Button
                onClick={() => {
                  setViewOpen(false);
                  openEdit(selected);
                }}
              >
                Edit
              </Button>
            ) : null}
          </>
        }
      >
        {selected ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <img
                src={selected.url}
                alt=""
                className="h-12 w-12 rounded-md object-cover ring-1 ring-border/60"
              />
              <div>
                <p className="font-semibold text-foreground">{selected.name}</p>
                <StatusBadge status={selected.isActive ? 'ACTIVE' : 'INACTIVE'} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Used by</p>
              <p className="mt-1">
                {selected.usageCount} skill communit{selected.usageCount === 1 ? 'y' : 'ies'}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Created</p>
                <p className="mt-1">
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Updated</p>
                <p className="mt-1">
                  {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
