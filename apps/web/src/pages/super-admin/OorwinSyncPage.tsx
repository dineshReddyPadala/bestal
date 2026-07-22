import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Upload } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useAdminMutations, useAdminOorwinHistory } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  fileName: string;
  status: string;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  createdAt: string;
};

export function SuperAdminDataImportPage() {
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useAdminOorwinHistory({ limit: 50 });
  const mutations = useAdminMutations();
  const fileRef = useRef<HTMLInputElement>(null);
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: 'fileName', header: 'File' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: 'createdCount', header: 'Created' },
      { accessorKey: 'updatedCount', header: 'Updated' },
      { accessorKey: 'skippedCount', header: 'Skipped' },
      { accessorKey: 'failedCount', header: 'Failed' },
      {
        accessorKey: 'createdAt',
        header: 'Imported',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const items: ActionMenuItem[] = [
            {
              id: 'details',
              label: 'View Import Details',
              onSelect: () =>
                show(
                  `${r.fileName}: created ${r.createdCount}, updated ${r.updatedCount}, failed ${r.failedCount}`,
                ),
            },
            {
              id: 'imported',
              label: 'View Imported Records',
              href: '/super-admin/candidates',
            },
            {
              id: 'failed',
              label: 'View Failed Records',
              disabled: r.failedCount === 0,
              disabledReason: 'No failed records for this import',
              onSelect: () => show(`${r.failedCount} failed row(s) in ${r.fileName}`),
            },
            {
              id: 'retry',
              label: 'Retry Failed Records',
              separatorBefore: true,
              disabled: r.failedCount === 0,
              disabledReason: 'No failed records to retry',
              onSelect: () =>
                showError('Retry failed records is not available yet — re-upload the CSV'),
            },
            {
              id: 'history',
              label: 'View Import History',
              onSelect: () => show('You are viewing import history'),
            },
          ];
          return <ActionMenu items={items} label={`Actions for ${r.fileName}`} />;
        },
      },
    ],
    [show, showError],
  );

  return (
    <ListingPageShell
      title="Data import from Oorwin"
      message={message}
      error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
      loading={isLoading}
      loadingLabel="Loading import history…"
      actions={
        <>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              void mutations.importOorwin
                .mutateAsync(file)
                .then((r) =>
                  show(
                    `Import done — created ${r.created}, updated ${r.updated}, failed ${r.failed}`,
                  ),
                )
                .catch((err) => showError(err instanceof Error ? err.message : 'Import failed'));
              e.target.value = '';
            }}
          />
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import CSV
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Upload an Oorwin export CSV to create or update candidates. Matching uses email, phone, or
        Oorwin candidate ID.
      </div>
      <TanStackDataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search imports…"
        pageSize={12}
        stickyHeader
        fillHeight
        dense
      />
    </ListingPageShell>
  );
}

export const SuperAdminOorwinSyncPage = SuperAdminDataImportPage;
