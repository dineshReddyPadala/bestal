import { deployments } from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  PageHeader,
  StatusBadge,
} from '@bestal/ui';

export function DeploymentsPage() {
  const active = deployments.filter((d) => d.status === 'ACTIVE' || d.status === 'PENDING');

  return (
    <div>
      <PageHeader
        title="Deployments"
        description="Active talent placements and engagements"
      />

      <div className="p-6">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Title</DataTableHead>
              <DataTableHead>Candidate</DataTableHead>
              <DataTableHead>Client</DataTableHead>
              <DataTableHead>Type</DataTableHead>
              <DataTableHead>Rate</DataTableHead>
              <DataTableHead>Hours/wk</DataTableHead>
              <DataTableHead>Start</DataTableHead>
              <DataTableHead>Status</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {active.map((deployment) => (
              <DataTableRow key={deployment.id}>
                <DataTableCell className="font-medium">{deployment.title}</DataTableCell>
                <DataTableCell>{deployment.candidateName}</DataTableCell>
                <DataTableCell>{deployment.clientName}</DataTableCell>
                <DataTableCell>{deployment.placementType}</DataTableCell>
                <DataTableCell>
                  {formatCurrency(deployment.rate, deployment.currency)}/hr
                </DataTableCell>
                <DataTableCell>{deployment.hoursPerWeek}</DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(deployment.startDate)}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={deployment.status} />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
