import { deployments } from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@bestal/ui';
import { Briefcase, Clock, DollarSign, Rocket } from 'lucide-react';
import { DEMO_CLIENT_ID } from '../../lib/demo-client';

export function DeploymentsPage() {
  const clientDeployments = deployments.filter((d) => d.clientId === DEMO_CLIENT_ID);
  const active = clientDeployments.filter((d) => ['ACTIVE'].includes(d.status));
  const pending = clientDeployments.filter((d) =>
    ['PENDING', 'ON_HOLD'].includes(d.status),
  );

  return (
    <div>
      <PageHeader
        title="Active Deployments"
        description="Track engaged talent placements and upcoming starts"
      />

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active"
            value={active.length}
            icon={<Rocket className="h-5 w-5" />}
          />
          <StatCard
            label="Pending Start"
            value={pending.length}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            label="Total Placements"
            value={clientDeployments.length}
            icon={<Briefcase className="h-5 w-5" />}
          />
        </div>

        {clientDeployments.length === 0 ? (
          <EmptyState
            icon={<Rocket className="h-8 w-8" />}
            title="No deployments"
            description="Active talent engagements will be listed here once placements begin."
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <DataTable>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Candidate</DataTableHead>
                    <DataTableHead>Role</DataTableHead>
                    <DataTableHead>Type</DataTableHead>
                    <DataTableHead>Rate</DataTableHead>
                    <DataTableHead>Start</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {clientDeployments.map((deployment) => (
                    <DataTableRow key={deployment.id}>
                      <DataTableCell className="font-medium">
                        {deployment.candidateName}
                      </DataTableCell>
                      <DataTableCell>{deployment.title}</DataTableCell>
                      <DataTableCell>{deployment.placementType}</DataTableCell>
                      <DataTableCell>
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatCurrency(deployment.rate, deployment.currency)}/hr
                        </span>
                      </DataTableCell>
                      <DataTableCell>{formatDate(deployment.startDate)}</DataTableCell>
                      <DataTableCell>
                        <StatusBadge status={deployment.status} />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
