import { Button, Dialog, Input, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAdminMutations, useAdminSkillCommunities } from '../../hooks/api/useAdmin';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploadIconCommunityId, setUploadIconCommunityId] = useState<number | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

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
            { id: 'view', label: 'View Community' },
            {
              id: 'upload-icon',
              label: 'Upload icon',
              onSelect: () => {
                setUploadIconCommunityId(r.id);
                iconInputRef.current?.click();
              },
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

  return (
    <>
      <ListingPageShell
        title="Skill Communities"
        message={message}
        error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
        loading={isLoading}
        loadingLabel="Loading…"
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
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
        open={open}
        onClose={() => setOpen(false)}
        title="Create skill community"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                void mutations.createSkillCommunity
                  .mutateAsync({
                    name,
                    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                    description,
                  })
                  .then(async (created) => {
                    const communityId = Number((created as { id?: number }).id);
                    if (iconFile && communityId) {
                      await mutations.uploadSkillCommunityIcon.mutateAsync({
                        id: communityId,
                        file: iconFile,
                      });
                    }
                    show('Created');
                    setOpen(false);
                    setName('');
                    setSlug('');
                    setDescription('');
                    setIconFile(null);
                  })
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Community icon</span>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-3 py-3 text-sm hover:bg-muted/30">
              <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>{iconFile ? iconFile.name : 'Upload icon image (PNG, JPG, WebP)'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        </div>
      </Dialog>
      <input
        ref={iconInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file || uploadIconCommunityId == null) return;
          void mutations.uploadSkillCommunityIcon
            .mutateAsync({ id: uploadIconCommunityId, file })
            .then(() => show('Icon uploaded'))
            .catch((err) => showError(err instanceof Error ? err.message : 'Upload failed'))
            .finally(() => {
              setUploadIconCommunityId(null);
              if (iconInputRef.current) iconInputRef.current.value = '';
            });
        }}
      />
    </>
  );
}
