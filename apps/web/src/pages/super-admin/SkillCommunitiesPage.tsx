import { Button, Dialog, Input, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { useAdminMutations, useAdminSkillCommunities } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
};

export function SuperAdminSkillCommunitiesPage() {
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useAdminSkillCommunities({ limit: 100 });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      { accessorKey: 'slug', header: 'Slug' },
      { accessorKey: 'description', header: 'Description', cell: ({ getValue }) => (getValue() as string) || '—' },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={(getValue() as boolean) ? 'ACTIVE' : 'INACTIVE'} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.setSkillCommunityStatus
                  .mutateAsync({ id: row.original.id, isActive: !row.original.isActive })
                  .then(() => show('Updated'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.deleteSkillCommunity
                  .mutateAsync(row.original.id)
                  .then(() => show('Deleted'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [mutations, show, showError],
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
        <TanStackDataTable columns={columns} data={rows} searchPlaceholder="Search…" pageSize={12} stickyHeader fillHeight dense />
      </ListingPageShell>

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
                  .mutateAsync({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description })
                  .then(() => {
                    show('Created');
                    setOpen(false);
                    setName('');
                    setSlug('');
                    setDescription('');
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
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </Dialog>
    </>
  );
}
