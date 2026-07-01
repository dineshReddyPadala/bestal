import { backgroundChecks } from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
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

export function BackgroundChecksPage() {
  return (
    <div>
      <PageHeader
        title="Background Checks"
        description="Verification and compliance screening status"
      />

      <div className="p-6">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Candidate</DataTableHead>
              <DataTableHead>Type</DataTableHead>
              <DataTableHead>Provider</DataTableHead>
              <DataTableHead>Requested by</DataTableHead>
              <DataTableHead>Requested</DataTableHead>
              <DataTableHead>Completed</DataTableHead>
              <DataTableHead>Status</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {backgroundChecks.map((check) => (
              <DataTableRow key={check.id}>
                <DataTableCell className="font-medium">{check.candidateName}</DataTableCell>
                <DataTableCell>{check.type}</DataTableCell>
                <DataTableCell className="text-muted-foreground">{check.provider}</DataTableCell>
                <DataTableCell>{check.requestedBy}</DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(check.requestedAt)}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {check.completedAt ? formatDate(check.completedAt) : '—'}
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge status={check.status} />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
