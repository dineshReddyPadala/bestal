import { users } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
  Avatar,
  Button,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';
import { UserPlus } from 'lucide-react';

export function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Users"
        description="Platform users across all organizations"
        actions={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite user
          </Button>
        }
      />

      <div className="p-6">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>User</DataTableHead>
              <DataTableHead>Email</DataTableHead>
              <DataTableHead>Role</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead>Last login</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {users.map((user) => (
              <DataTableRow key={user.id}>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={`${user.firstName} ${user.lastName}`}
                      src={user.photoUrl}
                      size="sm"
                    />
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">{user.email}</DataTableCell>
                <DataTableCell>{user.role}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(user.lastLoginAt)}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
