import { schemaAuditLogs } from '@bestal/mock-data';
import { PageHeader, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { SchemaAuditLog } from '@bestal/mock-data';

export function AuditLogsPage() {
  const columns = useMemo<ColumnDef<SchemaAuditLog>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'resourceType', header: 'Resource Type' },
      { accessorKey: 'resourceId', header: 'Resource ID' },
      { accessorKey: 'description', header: 'Description' },
      { accessorKey: 'actorName', header: 'Actor' },
      { accessorKey: 'actorId', header: 'Actor ID' },
      { accessorKey: 'organizationId', header: 'Org ID' },
      { accessorKey: 'ipAddress', header: 'IP' },
      { accessorKey: 'userAgent', header: 'User Agent' },
      { accessorKey: 'createdAt', header: 'Created' },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Audit Logs" description="Append-only compliance trail — all schema fields" />
      <div className="p-6">
        <TanStackDataTable
          columns={columns}
          data={[...schemaAuditLogs]}
          searchPlaceholder="Search audit logs…"
        />
      </div>
    </div>
  );
}
