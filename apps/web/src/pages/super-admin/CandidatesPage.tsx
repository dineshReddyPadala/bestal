import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { FileSpreadsheet, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import {
  useAdminCandidates,
  useAdminMutations,
  useAdminPendingCandidates,
} from '../../hooks/api/useAdmin';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';

type Row = {
  id: number;
  name: string;
  role: string | null;
  community: string | null;
  yearsExperience: number | null;
  clientBillRate: number | null;
  availabilityStatus: string | null;
  bestalScore: number | null;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  profileStatus: string | null;
  visibilityStatus: string | null;
  approvalStatus?: string | null;
  submittedForApprovalAt?: string | null;
  updatedAt: string;
};

const defaultFilters = {
  profileStatus: 'all',
  visibilityStatus: 'all',
};

function buildCandidateActions(
  r: Row,
  pendingOnly: boolean,
  helpers: {
    mutations: ReturnType<typeof useAdminMutations>;
    show: (m: string) => void;
    showError: (m: string) => void;
    requestConfirm: ReturnType<typeof useConfirmAction>['requestConfirm'];
  },
): ActionMenuItem[] {
  const { mutations, show, showError, requestConfirm } = helpers;
  const profile = (r.profileStatus ?? '').toUpperCase();
  const visibility = (r.visibilityStatus ?? '').toUpperCase();
  const approval = (r.approvalStatus ?? '').toUpperCase();
  const isArchived = profile.includes('ARCHIVE') || visibility === 'ARCHIVED';
  const isPending =
    pendingOnly ||
    profile === 'PENDING_APPROVAL' ||
    (approval === 'PENDING' && Boolean(r.submittedForApprovalAt)) ||
    (profile === 'PROFILE_DRAFT' && Boolean(r.submittedForApprovalAt));
  const isPublished = visibility === 'CLIENT_VISIBLE';
  const isApproved =
    approval === 'APPROVED' ||
    profile.includes('APPROVED') ||
    profile === 'ADMIN_APPROVED';
  const isDraft =
    profile.includes('DRAFT') || profile === '' || profile === 'PROFILE_DRAFT';
  const isAiScreened = profile.includes('AI') || profile.includes('SCREEN');

  const view: ActionMenuItem = {
    id: 'view',
    label: pendingOnly ? 'Review Candidate' : 'View Candidate',
    href: `/super-admin/candidates/${r.id}`,
  };

  const edit: ActionMenuItem = {
    id: 'edit',
    label: 'Edit Candidate',
    href: `/super-admin/candidates/${r.id}/edit`,
  };

  if (isArchived) {
    return [
      view,
      edit,
      {
        id: 'restore',
        label: 'Restore',
        disabled: true,
        disabledReason: 'Restore is not available yet for archived candidates',
      },
      {
        id: 'delete',
        label: 'Permanently Delete',
        destructive: true,
        separatorBefore: true,
        disabled: true,
        disabledReason: 'Permanent delete requires additional confirmation workflow',
      },
    ];
  }

  if (isPending) {
    return [
      view,
      edit,
      {
        id: 'approve-publish',
        label: 'Approve & Publish',
        onSelect: () =>
          requestConfirm({
            title: 'Approve & Publish?',
            description: `${r.name} will be approved and made visible to clients.`,
            confirmLabel: 'Approve & Publish',
            onConfirm: async () => {
              await mutations.approveCandidate.mutateAsync(r.id);
              show('Approved & published');
            },
            onError: showError,
          }),
      },
      {
        id: 'approve-internal',
        label: 'Approve Internal Only',
        onSelect: () =>
          void mutations.approveCandidateInternal
            .mutateAsync(r.id)
            .then(() => show('Approved (internal)'))
            .catch((e) => showError(getApiErrorMessage(e, 'Approve failed'))),
      },
      {
        id: 'return',
        label: 'Return to Recruiter',
        onSelect: () => {
          const reason = window.prompt('Return reason (optional)') ?? undefined;
          void mutations.sendBackCandidate
            .mutateAsync({ id: r.id, reason })
            .then(() => show('Returned to recruiter'))
            .catch((e) => showError(getApiErrorMessage(e, 'Send back failed')));
        },
      },
      {
        id: 'reject',
        label: 'Reject',
        destructive: true,
        separatorBefore: true,
        onSelect: () => {
          const reason = window.prompt('Rejection reason');
          if (!reason) return;
          requestConfirm({
            title: 'Reject Candidate?',
            description: `${r.name} will be rejected. Reason: ${reason}`,
            confirmLabel: 'Reject',
            destructive: true,
            onConfirm: async () => {
              await mutations.rejectCandidate.mutateAsync({ id: r.id, reason });
              show('Rejected');
            },
            onError: showError,
          });
        },
      },
    ];
  }

  if (isPublished) {
    return [
      view,
      edit,
      {
        id: 'hide',
        label: 'Hide from Clients',
        separatorBefore: true,
        onSelect: () =>
          requestConfirm({
            title: 'Hide from Clients?',
            description: `${r.name} will no longer appear in the client portal.`,
            confirmLabel: 'Hide from Clients',
            destructive: true,
            onConfirm: async () => {
              await mutations.hideCandidate.mutateAsync(r.id);
              show('Hidden from clients');
            },
          }),
      },
      {
        id: 'archive',
        label: 'Archive',
        destructive: true,
        separatorBefore: true,
        onSelect: () =>
          requestConfirm({
            title: 'Archive Candidate?',
            description: `${r.name} will be archived and removed from active pipelines.`,
            confirmLabel: 'Archive',
            destructive: true,
            onConfirm: async () => {
              await mutations.archiveCandidate.mutateAsync(r.id);
              show('Archived');
            },
          }),
      },
    ];
  }

  if (isApproved) {
    return [
      view,
      edit,
      {
        id: 'publish',
        label: 'Publish',
        onSelect: () =>
          void mutations.publishCandidate
            .mutateAsync(r.id)
            .then(() => show('Published'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
      },
      {
        id: 'hide',
        label: 'Hide',
        onSelect: () =>
          void mutations.hideCandidate
            .mutateAsync(r.id)
            .then(() => show('Hidden'))
            .catch((e) => showError(e instanceof Error ? e.message : 'Failed')),
      },
      {
        id: 'archive',
        label: 'Archive',
        destructive: true,
        separatorBefore: true,
        onSelect: () =>
          requestConfirm({
            title: 'Archive Candidate?',
            description: `${r.name} will be archived.`,
            confirmLabel: 'Archive',
            destructive: true,
            onConfirm: async () => {
              await mutations.archiveCandidate.mutateAsync(r.id);
              show('Archived');
            },
          }),
      },
    ];
  }

  // Draft / AI-screened / default
  return [
    view,
    edit,
    {
      id: 'ai',
      label: isAiScreened ? 'Review AI Screening' : 'Run AI Screening',
      disabled: true,
      disabledReason: 'Open the candidate profile to run or review AI screening',
    },
    {
      id: 'submit',
      label: 'Submit for Approval',
      hidden: !isDraft && !isAiScreened,
      disabled: true,
      disabledReason: 'Submit for approval is available from the recruiter workflow',
    },
    {
      id: 'archive',
      label: 'Archive',
      destructive: true,
      separatorBefore: true,
      onSelect: () =>
        requestConfirm({
          title: 'Archive Candidate?',
          description: `${r.name} will be archived.`,
          confirmLabel: 'Archive',
          destructive: true,
          onConfirm: async () => {
            await mutations.archiveCandidate.mutateAsync(r.id);
            show('Archived');
          },
        }),
    },
  ];
}

function CandidatesTable({ pendingOnly }: { pendingOnly: boolean }) {
  const { message, variant, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const [filters, setFilters] = useState(defaultFilters);
  const query = {
    limit: 100,
    ...(filters.profileStatus !== 'all' ? { profileStatus: filters.profileStatus } : {}),
    ...(filters.visibilityStatus !== 'all' ? { visibilityStatus: filters.visibilityStatus } : {}),
  };
  const allQuery = useAdminCandidates(query);
  const pendingQuery = useAdminPendingCandidates({ limit: 100 });
  const { data, isLoading, isError, error } = pendingOnly ? pendingQuery : allQuery;
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Candidate',
        cell: ({ row }) => (
          <Link
            className="font-medium text-brand hover:underline"
            to={`/super-admin/candidates/${row.original.id}`}
          >
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: 'role', header: 'Role', cell: ({ getValue }) => (getValue() as string) || '—' },
      {
        accessorKey: 'community',
        header: 'Community',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      { accessorKey: 'yearsExperience', header: 'Exp', cell: ({ getValue }) => getValue() ?? '—' },
      {
        accessorKey: 'clientBillRate',
        header: 'Bill rate',
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v != null ? `$${v}` : '—';
        },
      },
      {
        accessorKey: 'availabilityStatus',
        header: 'Availability',
        cell: ({ getValue }) => (getValue() as string) || '—',
      },
      { accessorKey: 'bestalScore', header: 'Score', cell: ({ getValue }) => getValue() ?? '—' },
      {
        accessorKey: 'evaluationStatus',
        header: 'Evaluation',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? <StatusBadge status={v} /> : '—';
        },
      },
      {
        accessorKey: 'bgvStatus',
        header: 'BGV',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? <StatusBadge status={v} /> : '—';
        },
      },
      {
        accessorKey: 'profileStatus',
        header: 'Profile',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? <StatusBadge status={v} /> : '—';
        },
      },
      {
        accessorKey: 'visibilityStatus',
        header: 'Visibility',
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? <StatusBadge status={v} /> : '—';
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <ActionMenu
            items={buildCandidateActions(row.original, pendingOnly, {
              mutations,
              show,
              showError,
              requestConfirm,
            })}
            label={`Actions for ${row.original.name}`}
          />
        ),
      },
    ],
    [mutations, pendingOnly, requestConfirm, show, showError],
  );

  return (
    <>
      <ListingPageShell
        title={pendingOnly ? 'Pending Approvals' : 'Candidates'}
        message={message}
        messageVariant={variant}
        error={isError ? (error instanceof Error ? error.message : 'Failed') : null}
        loading={isLoading}
        loadingLabel="Loading candidates…"
      >
        <TanStackDataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Search candidates…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline={!pendingOnly}
          toolbar={
            pendingOnly ? undefined : (
              <>
                <Button size="sm" to="/super-admin/candidates/import">
                  <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                  Import Candidates
                </Button>
                <Button size="sm" to="/super-admin/candidates/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Candidate
                </Button>
              </>
            )
          }
          filters={
            pendingOnly ? undefined : (
              <ListingFiltersRow>
                <ListingFilterSelect
                  label="PROFILE"
                  value={filters.profileStatus}
                  onChange={(v) => setFilters((p) => ({ ...p, profileStatus: v }))}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'CLIENT_VISIBLE', label: 'Client visible' },
                    { value: 'ADMIN_APPROVED', label: 'Admin approved' },
                    { value: 'REJECTED', label: 'Rejected' },
                  ]}
                />
                <ListingFilterSelect
                  label="VISIBILITY"
                  value={filters.visibilityStatus}
                  onChange={(v) => setFilters((p) => ({ ...p, visibilityStatus: v }))}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'INTERNAL_ONLY', label: 'Internal' },
                    { value: 'CLIENT_VISIBLE', label: 'Client visible' },
                    { value: 'HIDDEN', label: 'Hidden' },
                  ]}
                />
              </ListingFiltersRow>
            )
          }
        />
      </ListingPageShell>
      {confirmDialog}
    </>
  );
}

export function SuperAdminCandidatesPage() {
  return <CandidatesTable pendingOnly={false} />;
}

export function SuperAdminPendingCandidatesPage() {
  return <CandidatesTable pendingOnly />;
}
