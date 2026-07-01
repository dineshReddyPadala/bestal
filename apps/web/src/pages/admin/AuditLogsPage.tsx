import { auditLogs } from '@bestal/mock-data';
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

export function AuditLogsPage() {
  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Complete platform activity and compliance trail"
      />

      <div className="p-6">
        <DataTable>
          <DataTableHeader>
            <DataTableRow>
              <DataTableHead>Action</DataTableHead>
              <DataTableHead>Entity</DataTableHead>
              <DataTableHead>Summary</DataTableHead>
              <DataTableHead>Actor</DataTableHead>
              <DataTableHead>IP</DataTableHead>
              <DataTableHead>Date</DataTableHead>
            </DataTableRow>
          </DataTableHeader>
          <DataTableBody>
            {auditLogs.map((log) => (
              <DataTableRow key={log.id}>
                <DataTableCell>
                  <StatusBadge status={log.action} />
                </DataTableCell>
                <DataTableCell>
                  {log.entityType} #{log.entityId}
                </DataTableCell>
                <DataTableCell className="max-w-md">{log.summary}</DataTableCell>
                <DataTableCell>
                  <div>
                    <p className="font-medium">{log.actorName}</p>
                    <p className="text-xs text-muted-foreground">{log.actorEmail}</p>
                  </div>
                </DataTableCell>
                <DataTableCell className="font-mono text-xs text-muted-foreground">
                  {log.ipAddress}
                </DataTableCell>
                <DataTableCell className="text-muted-foreground">
                  {formatDate(log.createdAt)}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </div>
  );
}
