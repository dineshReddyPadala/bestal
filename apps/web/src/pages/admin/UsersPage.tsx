import { schemaUsers } from '@bestal/mock-data';
import { Button, PageHeader, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { UserPlus } from 'lucide-react';
import { useMemo } from 'react';
import type { SchemaUser } from '@bestal/mock-data';
import { useDemoToast } from '../../lib/use-demo-toast';

export function UsersPage() {
  const { message, show } = useDemoToast();

  const columns = useMemo<ColumnDef<SchemaUser>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'firstName',
        header: 'Name',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ getValue }) => <StatusBadge status={(getValue() as boolean) ? 'ACTIVE' : 'INACTIVE'} />,
      },
      { accessorKey: 'organizationId', header: 'Org ID' },
      { accessorKey: 'lastLoginAt', header: 'Last Login' },
      { accessorKey: 'createdAt', header: 'Created' },
      { accessorKey: 'updatedAt', header: 'Updated' },
      { accessorKey: 'deletedAt', header: 'Deleted' },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Users"
        description="All platform users — full schema fields"
        actions={
          <Button onClick={() => show('Invite user dialog opened (demo)')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite user
          </Button>
        }
      />
      {message && (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      <div className="p-6">
        <TanStackDataTable columns={columns} data={[...schemaUsers]} searchPlaceholder="Search users…" />
      </div>
    </div>
  );
}
