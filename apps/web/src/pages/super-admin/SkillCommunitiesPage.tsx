import { Button, Dialog, Input, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { IconSelectField } from '../../components/super-admin/IconSelectField';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAdminMutations, useAdminSkillCommunities } from '../../hooks/api/useAdmin';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  displayOrder?: number;
  iconId?: number | null;
  iconUrl?: string | null;
  isActive: boolean;
  candidateCount?: number;
};

export function SuperAdminSkillCommunitiesPage() {
  const { message, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useAdminSkillCommunities({
    limit: 100,
    ...searchParam,
  });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [iconId, setIconId] = useState('');

  function resetForm() {
    setName('');
    setSlug('');
    setDescription('');
    setDisplayOrder('');
    setIconId('');
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setCreateOpen(true);
  }

  function openEdit(row: Row) {
    setEditingId(row.id);
    setName(row.name);
    setSlug(row.slug);
    setDescription(row.description ?? '');
    setDisplayOrder(row.displayOrder != null ? String(row.displayOrder) : '');
    setIconId(row.iconId != null ? String(row.iconId) : '');
    setEditOpen(true);
  }

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: 'icon',
        header: 'Icon',
        cell: ({ row }) =>
          row.original.iconUrl ? (
            <img
              src={row.original.iconUrl}
              alt=""
              className="h-8 w-8 rounded-md object-cover ring-1 ring-border/60"
            />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      { accessorKey: 'slug', header: 'Slug' },
      {
        accessorKey: 'displayOrder',
        header: 'Order',
        cell: ({ getValue }) => getValue() ?? '—',
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (getValue() as string) || '—',
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
          const hasCandidates = (r.candidateCount ?? 0) > 0;
          const items: ActionMenuItem[] = [
            {
              id: 'edit',
              label: 'Edit Community',
              onSelect: () => openEdit(r),
            },
            {
              id: 'activate',
              label: 'Activate',
              hidden: r.isActive,
              onSelect: () =>
                void mutations.setSkillCommunityStatus
                  .mutateAsync({ id: r.id, isActive: true })
                  .then(() => show('Activated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
            },
            {
              id: 'deactivate',
              label: 'Deactivate',
              hidden: !r.isActive,
              onSelect: () =>
                void mutations.setSkillCommunityStatus
                  .mutateAsync({ id: r.id, isActive: false })
                  .then(() => show('Deactivated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
            },
            {
              id: 'candidates',
              label: 'View Candidates',
              href: '/super-admin/candidates',
              separatorBefore: true,
            },
            {
              id: 'delete',
              label: 'Delete',
              destructive: true,
              separatorBefore: true,
              disabled: hasCandidates,
              disabledReason:
                'Cannot delete this community because candidates are currently assigned to it.',
              onSelect: () =>
                requestConfirm({
                  title: 'Delete Community?',
                  description: `${r.name} will be permanently deleted.`,
                  confirmLabel: 'Delete',
                  destructive: true,
                  onConfirm: async () => {
                    await mutations.deleteSkillCommunity.mutateAsync(r.id);
                    show('Deleted');
                  },
                }),
            },
          ];
          return <ActionMenu items={items} label={`Actions for ${r.name}`} />;
        },
      },
    ],
    [mutations, requestConfirm, show, showError],
  );

  const communityFormFields = (
    <div className="space-y-3">
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <Input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        placeholder="Display order"
        type="number"
        value={displayOrder}
        onChange={(e) => setDisplayOrder(e.target.value)}
      />
      <IconSelectField value={iconId} onChange={setIconId} />
    </div>
  );

  return (
    <>
      <ListingPageShell
        title="Skill Communities"
        message={message}
        error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
        loading={isLoading}
        loadingLabel="Loading…"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add
          </Button>
        }
      >
        <TanStackDataTable
          key={search}
          columns={columns}
          data={rows}
          searchPlaceholder="Search…"
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
        title="Create skill community"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                void mutations.createSkillCommunity
                  .mutateAsync({
                    name,
                    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                    description,
                    displayOrder: displayOrder.trim() ? Number(displayOrder) : undefined,
                    iconId: iconId ? Number(iconId) : null,
                  })
                  .then(() => {
                    show('Created');
                    setCreateOpen(false);
                    resetForm();
                  })
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Create
            </Button>
          </>
        }
      >
        {communityFormFields}
      </Dialog>
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit skill community"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={editingId == null}
              onClick={() => {
                if (editingId == null) return;
                void mutations.updateSkillCommunity
                  .mutateAsync({
                    id: editingId,
                    body: {
                      name,
                      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                      description,
                      displayOrder: displayOrder.trim() ? Number(displayOrder) : undefined,
                      iconId: iconId ? Number(iconId) : null,
                    },
                  })
                  .then(() => {
                    show('Updated');
                    setEditOpen(false);
                    resetForm();
                  })
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {communityFormFields}
      </Dialog>
    </>
  );
}
