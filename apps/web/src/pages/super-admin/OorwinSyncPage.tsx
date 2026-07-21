import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Upload } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
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

/** Data import from Oorwin (CSV). Replaces the old “Oorwin Sync” label. */
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
    ],
    [],
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

/** @deprecated Use SuperAdminDataImportPage */
export const SuperAdminOorwinSyncPage = SuperAdminDataImportPage;
