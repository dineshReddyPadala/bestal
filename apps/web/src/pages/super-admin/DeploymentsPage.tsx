import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { useAdminDeployments, useAdminMutations } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  clientName: string;
  candidateName: string;
  startDate: string | null;
  endDate: string | null;
  billingRate: number | null;
  candidatePayRate: number | null;
  grossMarginPerHour: number | null;
  status: string;
};

export function SuperAdminDeploymentsPage() {
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useAdminDeployments({ limit: 100 });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'candidateName', header: 'Candidate' },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? new Date(v).toLocaleDateString() : '—';
        },
      },
      {
        accessorKey: 'endDate',
        header: 'End',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? new Date(v).toLocaleDateString() : '—';
        },
      },
      {
        accessorKey: 'billingRate',
        header: 'Bill',
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v != null ? `$${v}` : '—';
        },
      },
      {
        accessorKey: 'candidatePayRate',
        header: 'Pay',
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v != null ? `$${v}` : '—';
        },
      },
      {
        accessorKey: 'grossMarginPerHour',
        header: 'Margin',
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v != null ? `$${v}` : '—';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" onClick={() => { const endDate = window.prompt('New end date (YYYY-MM-DD)'); if (!endDate) return; void mutations.extendDeployment.mutateAsync({ id: row.original.id, endDate }).then(() => show('Extended')).catch((e) => showError(e instanceof Error ? e.message : 'Failed')); }}>
              Extend
            </Button>
            <Button size="sm" variant="outline" onClick={() => void mutations.pauseDeployment.mutateAsync(row.original.id).then(() => show('Paused')).catch((e) => showError(e instanceof Error ? e.message : 'Failed'))}>
              Pause
            </Button>
            <Button size="sm" variant="outline" onClick={() => void mutations.completeDeployment.mutateAsync(row.original.id).then(() => show('Completed')).catch((e) => showError(e instanceof Error ? e.message : 'Failed'))}>
              Complete
            </Button>
            <Button size="sm" variant="outline" onClick={() => { const reason = window.prompt('Terminate reason') ?? 'Terminated'; void mutations.terminateDeployment.mutateAsync({ id: row.original.id, reason }).then(() => show('Terminated')).catch((e) => showError(e instanceof Error ? e.message : 'Failed')); }}>
              Terminate
            </Button>
          </div>
        ),
      },
    ],
    [mutations, show, showError],
  );

  return (
    <ListingPageShell title="Deployments" message={message} error={isError ? (error instanceof Error ? error.message : 'Failed') : null} loading={isLoading} loadingLabel="Loading deployments…">
      <TanStackDataTable columns={columns} data={rows} searchPlaceholder="Search deployments…" pageSize={12} stickyHeader fillHeight dense />
    </ListingPageShell>
  );
}
