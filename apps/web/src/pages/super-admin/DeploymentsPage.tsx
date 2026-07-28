import { StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
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

function deploymentActions(
  r: Row,
  helpers: {
    mutations: ReturnType<typeof useAdminMutations>;
    show: (m: string) => void;
    showError: (m: string) => void;
    requestConfirm: ReturnType<typeof useConfirmAction>['requestConfirm'];
  },
): ActionMenuItem[] {
  const { mutations, show, showError, requestConfirm } = helpers;
  const status = r.status.toUpperCase();
  const label = `${r.candidateName} · ${r.clientName}`;
  const view: ActionMenuItem = { id: 'view', label: 'View Deployment' };

  if (status === 'ACTIVE') {
    return [
      view,
      {
        id: 'extend',
        label: 'Extend Deployment',
        onSelect: () => {
          const endDate = window.prompt('New end date (YYYY-MM-DD)');
          if (!endDate) return;
          void mutations.extendDeployment
            .mutateAsync({ id: r.id, endDate })
            .then(() => show('Deployment extended'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
        },
      },
      {
        id: 'pause',
        label: 'Pause Deployment',
        onSelect: () =>
          requestConfirm({
            title: 'Pause Deployment?',
            description: `${label} will be paused. Billing and availability may be affected.`,
            confirmLabel: 'Pause Deployment',
            onConfirm: async () => {
              await mutations.pauseDeployment.mutateAsync(r.id);
              show('Deployment paused');
            },
          }),
      },
      {
        id: 'complete',
        label: 'Complete Deployment',
        separatorBefore: true,
        onSelect: () =>
          requestConfirm({
            title: 'Complete Deployment?',
            description: `${label} will be marked completed.`,
            confirmLabel: 'Complete Deployment',
            onConfirm: async () => {
              await mutations.completeDeployment.mutateAsync(r.id);
              show('Deployment completed');
            },
          }),
      },
      {
        id: 'terminate',
        label: 'Terminate Deployment',
        destructive: true,
        onSelect: () => {
          const reason = window.prompt('Terminate reason') ?? 'Terminated';
          requestConfirm({
            title: 'Terminate Deployment?',
            description: `${label} will be terminated. Reason: ${reason}`,
            confirmLabel: 'Terminate Deployment',
            destructive: true,
            onConfirm: async () => {
              await mutations.terminateDeployment.mutateAsync({ id: r.id, reason });
              show('Deployment terminated');
            },
          });
        },
      },
    ];
  }

  if (status === 'ON_HOLD') {
    return [
      view,
      {
        id: 'extend',
        label: 'Extend Deployment',
        onSelect: () => {
          const endDate = window.prompt('New end date (YYYY-MM-DD)');
          if (!endDate) return;
          void mutations.extendDeployment
            .mutateAsync({ id: r.id, endDate })
            .then(() => show('Extended'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
        },
      },
      {
        id: 'complete',
        label: 'Complete Deployment',
        onSelect: () =>
          void mutations.completeDeployment
            .mutateAsync(r.id)
            .then(() => show('Completed'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
      },
      {
        id: 'terminate',
        label: 'Terminate Deployment',
        destructive: true,
        separatorBefore: true,
        onSelect: () => {
          const reason = window.prompt('Terminate reason') ?? 'Terminated';
          requestConfirm({
            title: 'Terminate Deployment?',
            description: `${label} will be terminated.`,
            confirmLabel: 'Terminate Deployment',
            destructive: true,
            onConfirm: async () => {
              await mutations.terminateDeployment.mutateAsync({ id: r.id, reason });
              show('Terminated');
            },
          });
        },
      },
    ];
  }

  if (status === 'COMPLETED') {
    return [view, { id: 'commercials', label: 'View Commercials', href: '/super-admin/reports?tab=margin' }];
  }

  if (status === 'TERMINATED') {
    return [view];
  }

  return [
    view,
    {
      id: 'extend',
      label: 'Extend Deployment',
      onSelect: () => {
        const endDate = window.prompt('New end date (YYYY-MM-DD)');
        if (!endDate) return;
        void mutations.extendDeployment
          .mutateAsync({ id: r.id, endDate })
          .then(() => show('Extended'))
          .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
      },
    },
  ];
}

export function SuperAdminDeploymentsPage() {
  const { message, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
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
        header: 'Actions',
        cell: ({ row }) => (
          <ActionMenu
            items={deploymentActions(row.original, {
              mutations,
              show,
              showError,
              requestConfirm,
            })}
            label={`Actions for deployment ${row.original.id}`}
          />
        ),
      },
    ],
    [mutations, requestConfirm, show, showError],
  );

  return (
    <>
      <ListingPageShell
        title="Deployments"
        message={message}
        error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
        loading={isLoading}
        loadingLabel="Loading deployments…"
      >
        <TanStackDataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Search deployments…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
        />
      </ListingPageShell>
      {confirmDialog}
    </>
  );
}
