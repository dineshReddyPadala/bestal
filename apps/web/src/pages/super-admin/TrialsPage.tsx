import { StatusBadge, Select, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { AdminTrialDetailDialog } from '../../components/super-admin/AdminOpsDetailDialog';
import { ListingPageShell } from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useAdminMutations, useAdminTrials } from '../../hooks/api/useAdmin';
import { trialsApi } from '../../lib/api';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
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

const TRIAL_STATUSES = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
] as const;

function trialActions(
  r: Row,
  helpers: {
    mutations: ReturnType<typeof useAdminMutations>;
    show: (m: string) => void;
    showError: (m: string) => void;
    requestConfirm: ReturnType<typeof useConfirmAction>['requestConfirm'];
    onView: (id: number) => void;
  },
): ActionMenuItem[] {
  const { mutations, show, showError, requestConfirm, onView } = helpers;
  const status = r.status.toUpperCase();
  const label = `${r.candidateName} · ${r.clientName}`;

  const view: ActionMenuItem = {
    id: 'view',
    label: 'View Trial',
    onSelect: () => onView(r.id),
  };

  if (status === 'REQUESTED') {
    return [
      view,
      {
        id: 'approve',
        label: 'Approve Trial',
        onSelect: () =>
          void mutations.approveTrial
            .mutateAsync({ id: r.id })
            .then(() => show('Trial approved'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
      },
      {
        id: 'assign',
        label: 'Assign Recruiter',
        onSelect: () => {
          const raw = window.prompt('Recruiter user id');
          const recruiterId = Number(raw);
          if (!recruiterId) return;
          void mutations.assignTrial
            .mutateAsync({ id: r.id, recruiterId })
            .then(() => show('Recruiter assigned'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
        },
      },
      {
        id: 'reject',
        label: 'Reject Trial',
        destructive: true,
        separatorBefore: true,
        onSelect: () => {
          const reason = window.prompt('Reject reason') ?? 'Rejected';
          requestConfirm({
            title: 'Reject Trial?',
            description: `${label} will be rejected.`,
            confirmLabel: 'Reject Trial',
            destructive: true,
            onConfirm: async () => {
              await mutations.rejectTrial.mutateAsync({ id: r.id, reason });
              show('Trial rejected');
            },
          });
        },
      },
    ];
  }

  if (status === 'APPROVED') {
    return [
      view,
      {
        id: 'start',
        label: 'Start Trial',
        onSelect: () =>
          void trialsApi
            .update(r.id, { status: 'IN_PROGRESS' })
            .then(() => show('Trial started'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
      },
      {
        id: 'assign',
        label: 'Assign Recruiter',
        onSelect: () => {
          const raw = window.prompt('Recruiter user id');
          const recruiterId = Number(raw);
          if (!recruiterId) return;
          void mutations.assignTrial
            .mutateAsync({ id: r.id, recruiterId })
            .then(() => show('Recruiter assigned'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
        },
      },
      {
        id: 'convert',
        label: 'Mark Converted',
        separatorBefore: true,
        onSelect: () =>
          requestConfirm({
            title: 'Mark Trial Converted?',
            description: `${label} will be marked as converted to paid engagement.`,
            confirmLabel: 'Mark Converted',
            onConfirm: async () => {
              await mutations.convertTrial.mutateAsync(r.id);
              show('Trial converted');
            },
          }),
      },
    ];
  }

  if (['IN_PROGRESS', 'ACTIVE', 'STARTED'].includes(status)) {
    return [
      view,
      {
        id: 'convert',
        label: 'Complete / Convert Trial',
        onSelect: () =>
          void mutations.convertTrial
            .mutateAsync(r.id)
            .then(() => show('Trial converted'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
      },
      {
        id: 'reject',
        label: 'Cancel Trial',
        destructive: true,
        separatorBefore: true,
        onSelect: () => {
          const reason = window.prompt('Cancel reason') ?? 'Cancelled';
          requestConfirm({
            title: 'Cancel Trial?',
            description: `${label} will be cancelled.`,
            confirmLabel: 'Cancel Trial',
            destructive: true,
            onConfirm: async () => {
              await mutations.rejectTrial.mutateAsync({ id: r.id, reason });
              show('Trial cancelled');
            },
          });
        },
      },
    ];
  }

  if (status === 'COMPLETED' || r.convertedToPaid) {
    return [
      view,
      {
        id: 'convert',
        label: 'Mark Converted',
        hidden: Boolean(r.convertedToPaid),
        onSelect: () =>
          void mutations.convertTrial
            .mutateAsync(r.id)
            .then(() => show('Converted'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
      },
      {
        id: 'deployment',
        label: 'View Deployments',
        href: '/super-admin/deployments',
        separatorBefore: true,
      },
    ];
  }

  if (status === 'CONVERTED') {
    return [view, { id: 'deployment', label: 'View Deployment', href: '/super-admin/deployments' }];
  }

  return [view];
}

export function SuperAdminTrialsPage() {
  const { message, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const [statusFilter, setStatusFilter] = useState('all');
  const { data, isLoading, isError, error } = useAdminTrials({
    limit: 100,
    ...searchParam,
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
  });
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];
  const [viewTrialId, setViewTrialId] = useState<number | null>(null);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: 'clientName', header: 'Client' },
      { accessorKey: 'candidateName', header: 'Candidate' },
      {
        accessorKey: 'requestedByName',
        header: 'Requested by',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
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
        header: 'Actions',
        cell: ({ row }) => (
          <ActionMenu
            items={trialActions(row.original, {
              mutations,
              show,
              showError,
              requestConfirm,
              onView: setViewTrialId,
            })}
            label={`Actions for trial ${row.original.id}`}
          />
        ),
      },
    ],
    [mutations, requestConfirm, show, showError],
  );

  return (
    <>
      <ListingPageShell
        title="Trials"
        message={message}
        error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
        loading={isLoading}
        loadingLabel="Loading trials…"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 w-[11rem] text-sm"
          >
            <option value="all">All statuses</option>
            {TRIAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </div>
        <TanStackDataTable
          key={`${search}-${statusFilter}`}
          columns={columns}
          data={rows}
          searchPlaceholder="Search trials…"
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
      <AdminTrialDetailDialog trialId={viewTrialId} onClose={() => setViewTrialId(null)} />
    </>
  );
}
