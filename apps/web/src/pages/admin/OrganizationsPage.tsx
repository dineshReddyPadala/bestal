import { organizations } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import {
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
import { Plus } from 'lucide-react';

export function OrganizationsPage() {
  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Manage platform organizations and their members"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add organization
          </Button>
        }
      />

      <div className="p-6">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Name</DataTableHead>
              <DataTableHead>Slug</DataTableHead>
              <DataTableHead>Members</DataTableHead>
              <DataTableHead>Clients</DataTableHead>
              <DataTableHead>Candidates</DataTableHead>
              <DataTableHead>Status</DataTableHead>
              <DataTableHead>Created</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {organizations.map((org) => (
              <DataTableRow key={org.id}>
                <DataTableCell className="font-medium">{org.name}</DataTableCell>
                <DataTableCell className="text-muted-foreground">{org.slug}</DataTableCell>
                <DataTableCell>{org.memberCount}</DataTableCell>
                <DataTableCell>{org.clientCount}</DataTableCell>
                <DataTableCell>{org.candidateCount}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={org.isActive ? 'ACTIVE' : 'INACTIVE'} />
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(org.createdAt)}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
