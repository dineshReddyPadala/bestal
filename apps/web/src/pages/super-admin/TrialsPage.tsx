import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { useAdminMutations, useAdminTrials } from '../../hooks/api/useAdmin';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  clientName: string;
  candidateName: string;
  requestedByName?: string;
  status: string;
  startDate: string | null;
  createdAt: string;
  convertedToPaid?: boolean;
};

export function SuperAdminTrialsPage() {
  const { message, show, showError } = useDemoToast();
  const { data, isLoading, isError, error } = useAdminTrials({ limit: 100 });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'candidateName', header: 'Candidate' },
      { accessorKey: 'requestedByName', header: 'Requested by', cell: ({ getValue }) => (getValue() as string) || '—' },
      {
        accessorKey: 'createdAt',
        header: 'Requested',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'startDate',
        header: 'Start',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? new Date(v).toLocaleDateString() : '—';
        },
      },
      {
        id: 'conversion',
        header: 'Conversion',
        cell: ({ row }) => (row.original.convertedToPaid ? 'Converted' : '—'),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="outline" onClick={() => void mutations.approveTrial.mutateAsync({ id: row.original.id }).then(() => show('Approved')).catch((e) => showError(e instanceof Error ? e.message : 'Failed'))}>
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => { const reason = window.prompt('Reject reason') ?? 'Rejected'; void mutations.rejectTrial.mutateAsync({ id: row.original.id, reason }).then(() => show('Rejected')).catch((e) => showError(e instanceof Error ? e.message : 'Failed')); }}>
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => { const raw = window.prompt('Recruiter user id'); const recruiterId = Number(raw); if (!recruiterId) return; void mutations.assignTrial.mutateAsync({ id: row.original.id, recruiterId }).then(() => show('Assigned')).catch((e) => showError(e instanceof Error ? e.message : 'Failed')); }}>
              Assign
            </Button>
            <Button size="sm" variant="outline" onClick={() => void mutations.convertTrial.mutateAsync(row.original.id).then(() => show('Converted')).catch((e) => showError(e instanceof Error ? e.message : 'Failed'))}>
              Convert
            </Button>
          </div>
        ),
      },
    ],
    [mutations, show, showError],
  );

  return (
    <ListingPageShell title="Trials" message={message} error={isError ? (error instanceof Error ? error.message : 'Failed') : null} loading={isLoading} loadingLabel="Loading trials…">
      <TanStackDataTable columns={columns} data={rows} searchPlaceholder="Search trials…" pageSize={12} stickyHeader fillHeight dense />
    </ListingPageShell>
  );
}
