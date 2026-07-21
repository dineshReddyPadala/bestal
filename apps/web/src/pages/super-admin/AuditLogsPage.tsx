import { StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../../components/layout/ListingPageShell';
import { useAdminAuditLogs } from '../../hooks/api/useAdmin';

type Row = {
  id: number;
  createdAt: string;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: number | null;
  ipAddress: string | null;
};

export function SuperAdminAuditLogsPage() {
  const [action, setAction] = useState('all');
  const { data, isLoading, isError, error } = useAdminAuditLogs({
    limit: 100,
    ...(action !== 'all' ? { action } : {}),
  });
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
      { accessorKey: 'userName', header: 'User', cell: ({ getValue }) => (getValue() as string) || '—' },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'entityType', header: 'Entity type' },
      {
        accessorKey: 'entityId',
        header: 'Entity id',
        cell: ({ getValue }) => getValue() ?? '—',
      },
      { accessorKey: 'ipAddress', header: 'IP', cell: ({ getValue }) => (getValue() as string) || '—' },
    ],
    [],
  );

  return (
    <ListingPageShell
      title="Audit Logs"
      error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
      loading={isLoading}
      loadingLabel="Loading audit logs…"
    >
      <TanStackDataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search…"
        pageSize={12}
        stickyHeader
        fillHeight
        dense
        filtersInline
        filters={
          <ListingFiltersRow onClear={() => setAction('all')}>
            <ListingFilterSelect
              label="ACTION"
              value={action}
              onChange={setAction}
              options={[
                { value: 'all', label: 'All' },
                { value: 'CREATE', label: 'CREATE' },
                { value: 'UPDATE', label: 'UPDATE' },
                { value: 'DELETE', label: 'DELETE' },
                { value: 'APPROVE', label: 'APPROVE' },
                { value: 'REJECT', label: 'REJECT' },
              ]}
            />
          </ListingFiltersRow>
        }
      />
    </ListingPageShell>
  );
}
