import { Dialog, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useAdminAuditLogs } from '../../hooks/api/useAdmin';

type Row = {
  id: number;
  createdAt: string;
  userName: string | null;
  userId?: number | null;
  action: string;
  entityType: string;
  entityId: number | null;
  ipAddress: string | null;
  description?: string | null;
};

export function SuperAdminAuditLogsPage() {
  const [action, setAction] = useState('all');
  const [detail, setDetail] = useState<Row | null>(null);
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
      {
        accessorKey: 'userName',
        header: 'User',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
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
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const entityHref =
            r.entityType?.toLowerCase().includes('candidate') && r.entityId
              ? `/super-admin/candidates/${r.entityId}`
              : r.entityType?.toLowerCase().includes('client') && r.entityId
                ? `/super-admin/clients/${r.entityId}`
                : r.entityType?.toLowerCase().includes('user') && r.entityId
                  ? `/super-admin/users/${r.entityId}`
                  : undefined;

          const items: ActionMenuItem[] = [
            {
              id: 'details',
              label: 'View Details',
              onSelect: () => setDetail(r),
            },
            {
              id: 'user',
              label: 'View Related User',
              ...(r.userId
                ? { href: `/super-admin/users/${r.userId}` }
                : {
                    disabled: true,
                    disabledReason: 'No related user on this log entry',
                  }),
            },
            {
              id: 'entity',
              label: 'View Related Entity',
              ...(entityHref
                ? { href: entityHref }
                : {
                    disabled: true,
                    disabledReason: 'No linked entity for this log entry',
                  }),
            },
            {
              id: 'history',
              label: 'View Full Change History',
              onSelect: () => setDetail(r),
            },
          ];
          return <ActionMenu items={items} label={`Actions for audit ${r.id}`} />;
        },
      },
    ],
    [],
  );

  return (
    <>
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

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Audit log details"
        description={detail ? new Date(detail.createdAt).toLocaleString() : undefined}
      >
        {detail ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">User</dt>
              <dd className="font-medium">{detail.userName || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Action</dt>
              <dd>
                <StatusBadge status={detail.action} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Entity</dt>
              <dd className="font-medium">
                {detail.entityType}
                {detail.entityId != null ? ` #${detail.entityId}` : ''}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">IP</dt>
              <dd className="font-medium">{detail.ipAddress || '—'}</dd>
            </div>
            {detail.description ? (
              <div>
                <dt className="mb-1 text-muted-foreground">Description</dt>
                <dd className="rounded-md bg-muted/40 p-2">{detail.description}</dd>
              </div>
            ) : null}
            {detail.entityType?.toLowerCase().includes('candidate') && detail.entityId ? (
              <Link
                className="inline-block text-sm font-medium text-brand hover:underline"
                to={`/super-admin/candidates/${detail.entityId}`}
              >
                Open related candidate
              </Link>
            ) : null}
          </dl>
        ) : null}
      </Dialog>
    </>
  );
}
