import { StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { ExtendDeploymentDialog } from '../../components/deployments/ExtendDeploymentDialog';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAdminDeployments, useAdminMutations } from '../../hooks/api/useAdmin';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { getApiErrorMessage } from '../../lib/api/errors';
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
    onExtend: (row: Row) => void;
  },
): ActionMenuItem[] {
  const { mutations, show, requestConfirm, onExtend } = helpers;
  const status = r.status.toUpperCase();
  const label = `${r.candidateName} · ${r.clientName}`;
  const view: ActionMenuItem = { id: 'view', label: 'View Deployment' };

  if (status === 'ACTIVE') {
    return [
      view,
      {
        id: 'extend',
        label: 'Extend Deployment',
        onSelect: () => onExtend(r),
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
        onSelect: () =>
          requestConfirm({
            title: 'Terminate Deployment?',
            description: `${label} will be terminated.`,
            confirmLabel: 'Terminate Deployment',
            destructive: true,
            onConfirm: async () => {
              await mutations.terminateDeployment.mutateAsync({
                id: r.id,
                reason: 'Terminated',
              });
              show('Deployment terminated');
            },
          }),
      },
    ];
  }

  if (status === 'ON_HOLD') {
    return [
      view,
      {
        id: 'extend',
        label: 'Extend Deployment',
        onSelect: () => onExtend(r),
      },
      {
        id: 'complete',
        label: 'Complete Deployment',
        onSelect: () =>
          requestConfirm({
            title: 'Complete Deployment?',
            description: `${label} will be marked completed.`,
            confirmLabel: 'Complete Deployment',
            onConfirm: async () => {
              await mutations.completeDeployment.mutateAsync(r.id);
              show('Completed');
            },
          }),
      },
      {
        id: 'terminate',
        label: 'Terminate Deployment',
        destructive: true,
        separatorBefore: true,
        onSelect: () =>
          requestConfirm({
            title: 'Terminate Deployment?',
            description: `${label} will be terminated.`,
            confirmLabel: 'Terminate Deployment',
            destructive: true,
            onConfirm: async () => {
              await mutations.terminateDeployment.mutateAsync({
                id: r.id,
                reason: 'Terminated',
              });
              show('Terminated');
            },
          }),
      },
    ];
  }

  if (status === 'COMPLETED') {
    return [
      view,
      {
        id: 'commercials',
        label: 'View Commercials',
        href: '/super-admin/reports?tab=margin',
      },
    ];
  }

  if (status === 'TERMINATED') {
    return [view];
  }

  return [
    view,
    {
      id: 'extend',
      label: 'Extend Deployment',
      onSelect: () => onExtend(r),
    },
  ];
}

export function SuperAdminDeploymentsPage() {
  const { message, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useAdminDeployments({ limit: 100, ...searchParam });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];
  const [extendTarget, setExtendTarget] = useState<Row | null>(null);

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
              onExtend: setExtendTarget,
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
          key={search}
          columns={columns}
          data={rows}
          searchPlaceholder="Search deployments…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          stickyHeader
          fillHeight
          dense
        />
      </ListingPageShell>
      {confirmDialog}

      <ExtendDeploymentDialog
        open={extendTarget != null}
        title={
          extendTarget
            ? `Extend deployment — ${extendTarget.candidateName}`
            : 'Extend deployment'
        }
        initialEndDate={extendTarget?.endDate ?? null}
        onClose={() => setExtendTarget(null)}
        onSubmit={async ({ endDate }) => {
          if (!extendTarget) return;
          try {
            await mutations.extendDeployment.mutateAsync({
              id: extendTarget.id,
              endDate,
            });
            show('Deployment extended');
            setExtendTarget(null);
          } catch (err) {
            throw new Error(getApiErrorMessage(err, 'Extend failed'));
          }
        }}
      />
    </>
  );
}
