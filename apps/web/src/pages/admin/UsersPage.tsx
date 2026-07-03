import { schemaUsers } from '@bestal/mock-data';
import { Button, Dialog, PageHeader, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SchemaUser } from '@bestal/mock-data';
import { UserInviteForm } from '../../components/forms/UserInviteForm';
import { buildUserPayload, type UserInviteFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

export function UsersPage() {
  const { message, show } = useDemoToast();
  const [inviteOpen, setInviteOpen] = useState(false);

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
      { accessorKey: 'lastLoginAt', header: 'Last Login' },
      { accessorKey: 'createdAt', header: 'Created' },
    ],
    [],
  );

  function handleInvite(values: UserInviteFormValues) {
    buildUserPayload(values);
    show(`Invite sent to ${values.email} (demo)`);
    setInviteOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Platform users — invite by email and role only"
        actions={
          <Button onClick={() => setInviteOpen(true)}>
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

      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite user"
        description="Enter name, email, and role. Organization and audit fields are set automatically."
        className="max-w-lg"
      >
        <UserInviteForm onSubmit={handleInvite} onCancel={() => setInviteOpen(false)} />
      </Dialog>
    </div>
  );
}
