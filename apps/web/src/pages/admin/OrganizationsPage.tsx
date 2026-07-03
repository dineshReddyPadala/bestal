import { schemaOrganizations } from '@bestal/mock-data';
import { Button, PageHeader, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import type { SchemaOrganization } from '@bestal/mock-data';
import { useDemoToast } from '../../lib/use-demo-toast';

export function OrganizationsPage() {
  const { message, show } = useDemoToast();

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
      { accessorKey: 'updatedAt', header: 'Updated' },
      { accessorKey: 'deletedAt', header: 'Deleted' },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Platform organizations — all schema fields"
        actions={
          <Button onClick={() => show('Add organization form opened (demo)')}>
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
    </div>
  );
}
