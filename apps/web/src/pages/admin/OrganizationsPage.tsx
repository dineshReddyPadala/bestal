import { schemaOrganizations } from '@bestal/mock-data';
import { Button, Dialog, PageHeader, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SchemaOrganization } from '@bestal/mock-data';
import { OrganizationForm } from '../../components/forms/OrganizationForm';
import { buildOrganizationPayload, type OrganizationFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

export function OrganizationsPage() {
  const { message, show } = useDemoToast();
  const [createOpen, setCreateOpen] = useState(false);

  const columns = useMemo<ColumnDef<SchemaOrganization>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Name', cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span> },
      { accessorKey: 'slug', header: 'Slug' },
      { accessorKey: 'memberCount', header: 'Members' },
      { accessorKey: 'clientCount', header: 'Clients' },
      { accessorKey: 'candidateCount', header: 'Candidates' },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={(getValue() as boolean) ? 'ACTIVE' : 'INACTIVE'} />,
      },
      { accessorKey: 'createdAt', header: 'Created' },
    ],
    [],
  );

  function handleCreate(values: OrganizationFormValues) {
    buildOrganizationPayload(values);
    show(`Organization created — ${values.name} (demo)`);
    setCreateOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Platform organizations — name only; slug and counts are automatic"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add organization
          </Button>
        }
      />
      {message && (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={[...schemaOrganizations]}
          searchPlaceholder="Search organizations…"
        />
      </div>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add organization"
        description="Enter the organization name. Slug, counts, and timestamps are generated automatically."
        className="max-w-md"
      >
        <OrganizationForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Dialog>
    </div>
  );
}
