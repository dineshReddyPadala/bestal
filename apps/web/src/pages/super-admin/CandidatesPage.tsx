import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle, EyeOff, FileSpreadsheet, Globe, Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useReasonPrompt } from '../../components/super-admin/useReasonPrompt';
import {
  useAdminCandidates,
  useAdminMutations,
  useAdminPendingCandidates,
} from '../../hooks/api/useAdmin';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { getApiErrorMessage } from '../../lib/api/errors';
import { canApprove, canPublish, type ApprovalGateInput } from '../../lib/candidate-approval-gates';
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

const selectColumn: ColumnDef<Row> = {
  id: 'select',
  header: ({ table }) => (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-border accent-brand"
      checked={table.getIsAllPageRowsSelected()}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
      onClick={(e) => e.stopPropagation()}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-border accent-brand"
      checked={row.getIsSelected()}
      onChange={row.getToggleSelectedHandler()}
      onClick={(e) => e.stopPropagation()}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
};

function rowToGateInput(row: Row): ApprovalGateInput {
  return {
    profileStatus: row.profileStatus,
    evaluationStatus: row.evaluationStatus,
    bgvStatus: row.bgvStatus,
    approvalStatus: row.approvalStatus ?? 'PENDING',
    visibility: row.visibilityStatus ?? 'INTERNAL_ONLY',
    submittedForApprovalAt: row.submittedForApprovalAt ?? null,
  };
}

function canUnpublishRow(row: Row): boolean {
  return (row.visibilityStatus ?? '').toUpperCase() === 'CLIENT_VISIBLE';
}

function buildCandidateActions(
  r: Row,
  pendingOnly: boolean,
  archivedTab: boolean,
  helpers: {
    mutations: ReturnType<typeof useAdminMutations>;
    show: (m: string) => void;
    showError: (m: string) => void;
    requestConfirm: ReturnType<typeof useConfirmAction>['requestConfirm'];
    requestReason: ReturnType<
      typeof import('../../components/super-admin/useReasonPrompt').useReasonPrompt
    >['requestReason'];
  },
): ActionMenuItem[] {
  const { mutations, show, showError, requestConfirm, requestReason } = helpers;
  const profile = (r.profileStatus ?? '').toUpperCase();
  const approval = (r.approvalStatus ?? '').toUpperCase();
  const isArchived = profile === 'INACTIVE';
  const isPending =
    !archivedTab &&
    (pendingOnly ||
      profile === 'PENDING_APPROVAL' ||
      (approval === 'PENDING' && Boolean(r.submittedForApprovalAt)) ||
      (profile === 'PROFILE_DRAFT' && Boolean(r.submittedForApprovalAt)));
  const isPublished = !archivedTab && (r.visibilityStatus ?? '').toUpperCase() === 'CLIENT_VISIBLE';
  const isApproved =
    !archivedTab &&
    (approval === 'APPROVED' ||
      profile.includes('APPROVED') ||
      profile === 'ADMIN_APPROVED');
  const isDraft =
    !archivedTab && (profile.includes('DRAFT') || profile === '' || profile === 'PROFILE_DRAFT');
  const isAiScreened = !archivedTab && (profile.includes('AI') || profile.includes('SCREEN'));

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

  const archiveAction: ActionMenuItem = {
    id: 'archive',
    label: 'Archive',
    destructive: true,
    separatorBefore: true,
    onSelect: () =>
      requestConfirm({
        title: 'Archive Candidate?',
        description: `${r.name} will be archived and removed from active listings.`,
        confirmLabel: 'Archive',
        destructive: true,
        onConfirm: async () => {
          await mutations.archiveCandidate.mutateAsync(r.id);
          show('Candidate archived');
        },
        onError: showError,
      }),
  };

  const unarchiveAction: ActionMenuItem = {
    id: 'unarchive',
    label: 'Unarchive',
    onSelect: () =>
      requestConfirm({
        title: 'Unarchive Candidate?',
        description: `${r.name} will be restored to active candidates.`,
        confirmLabel: 'Unarchive',
        onConfirm: async () => {
          await mutations.unarchiveCandidate.mutateAsync(r.id);
          show('Candidate unarchived');
        },
        onError: showError,
      }),
  };

  if (archivedTab || isArchived) {
    return [view, edit, unarchiveAction];
  }

  if (isPending) {
    return [
      view,
      edit,
      {
        id: 'approve',
        label: 'Approve',
        onSelect: () =>
          requestConfirm({
            title: 'Approve candidate?',
            description: `${r.name} will be approved internally. Publish separately when ready for clients.`,
            confirmLabel: 'Approve',
            onConfirm: async () => {
              await mutations.approveCandidate.mutateAsync(r.id);
              show('Approved — ready to publish');
            },
            onError: showError,
          }),
      },
      {
        id: 'return',
        label: 'Return to Recruiter',
        onSelect: () =>
          requestReason({
            title: 'Return to Recruiter?',
            description: `${r.name} will be sent back to the recruiter for revision.`,
            confirmLabel: 'Return to Recruiter',
            reasonLabel: 'Reason (optional)',
            reasonPlaceholder: 'What should the recruiter address?',
            onConfirm: async (reason) => {
              await mutations.sendBackCandidate.mutateAsync({
                id: r.id,
                reason: reason || undefined,
              });
              show('Returned to recruiter');
            },
            onError: showError,
          }),
      },
      {
        id: 'reject',
        label: 'Reject',
        destructive: true,
        separatorBefore: true,
        onSelect: () =>
          requestReason({
            title: 'Reject Candidate?',
            description: `${r.name} will be rejected.`,
            confirmLabel: 'Reject',
            reasonLabel: 'Rejection reason',
            reasonRequired: true,
            reasonPlaceholder: 'Why is this candidate being rejected?',
            destructive: true,
            onConfirm: async (reason) => {
              await mutations.rejectCandidate.mutateAsync({ id: r.id, reason });
              show('Rejected');
            },
            onError: showError,
          }),
      },
    ];
  }

  if (isPublished) {
    return [view, edit, archiveAction];
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
      archiveAction,
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
    archiveAction,
  ];
}

function CandidatesTable({ pendingOnly }: { pendingOnly: boolean }) {
  const { message, variant, show, showError } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { requestReason, reasonDialog } = useReasonPrompt();
  const [filters, setFilters] = useState(defaultFilters);
  const [listTab, setListTab] = useState<'active' | 'archived'>('active');
  const [bulkBusy, setBulkBusy] = useState(false);
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const query = {
    limit: 100,
    ...searchParam,
    archived: listTab === 'archived' ? 'true' : 'false',
    ...(filters.profileStatus !== 'all' ? { profileStatus: filters.profileStatus } : {}),
    ...(filters.visibilityStatus !== 'all' ? { visibilityStatus: filters.visibilityStatus } : {}),
  };
  const allQuery = useAdminCandidates(query);
  const pendingQuery = useAdminPendingCandidates({ limit: 100, ...searchParam });
  const { data, isLoading, isError, error } = pendingOnly ? pendingQuery : allQuery;
  const mutations = useAdminMutations();
  const rows = (data?.data ?? []) as unknown as Row[];
  const enableBulkActions = listTab !== 'archived';

  const runBulkAction = useCallback(
    async (
      selected: Row[],
      eligible: Row[],
      action: 'approve' | 'publish' | 'unpublish',
    ) => {
      if (eligible.length === 0) {
        showError(`None of the selected candidates can be ${action}d`);
        return;
      }

      setBulkBusy(true);
      let success = 0;
      const failures: string[] = [];

      for (const row of eligible) {
        try {
          if (action === 'approve') {
            await mutations.approveCandidate.mutateAsync(row.id);
          } else if (action === 'publish') {
            await mutations.publishCandidate.mutateAsync(row.id);
          } else {
            await mutations.hideCandidate.mutateAsync(row.id);
          }
          success += 1;
        } catch (err) {
          failures.push(`${row.name}: ${getApiErrorMessage(err, 'failed')}`);
        }
      }

      setBulkBusy(false);

      const skipped = selected.length - eligible.length;
      const actionLabel =
        action === 'approve' ? 'Approved' : action === 'publish' ? 'Published' : 'Unpublished';

      if (failures.length === 0) {
        show(
          `${actionLabel} ${success} candidate${success === 1 ? '' : 's'}${
            skipped > 0 ? ` (${skipped} skipped — not eligible)` : ''
          }`,
        );
      } else {
        showError(
          `${actionLabel} ${success}, failed ${failures.length}${
            skipped > 0 ? `, skipped ${skipped}` : ''
          }. ${failures[0]}`,
        );
      }
    },
    [
      mutations.approveCandidate,
      mutations.hideCandidate,
      mutations.publishCandidate,
      show,
      showError,
    ],
  );

  const bulkApprove = useCallback(
    (selected: Row[]) => {
      const eligible = selected.filter((row) => canApprove(rowToGateInput(row)).allowed);
      void runBulkAction(selected, eligible, 'approve');
    },
    [runBulkAction],
  );

  const bulkPublish = useCallback(
    (selected: Row[]) => {
      const eligible = selected.filter((row) => canPublish(rowToGateInput(row)).allowed);
      void runBulkAction(selected, eligible, 'publish');
    },
    [runBulkAction],
  );

  const bulkUnpublish = useCallback(
    (selected: Row[]) => {
      const eligible = selected.filter(canUnpublishRow);
      if (eligible.length === 0) {
        showError('None of the selected candidates are published to clients');
        return;
      }
      requestConfirm({
        title: 'Unpublish selected candidates?',
        description: `${eligible.length} candidate${eligible.length === 1 ? '' : 's'} will be hidden from the client portal.`,
        confirmLabel: 'Unpublish',
        destructive: true,
        onConfirm: async () => {
          await runBulkAction(selected, eligible, 'unpublish');
        },
        onError: showError,
      });
    },
    [requestConfirm, runBulkAction, showError],
  );

  const columns = useMemo<ColumnDef<Row>[]>(
    () => {
      const cols: ColumnDef<Row>[] = enableBulkActions ? [selectColumn] : [];

      cols.push(
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
            items={buildCandidateActions(row.original, pendingOnly, listTab === 'archived', {
              mutations,
              show,
              showError,
              requestConfirm,
              requestReason,
            })}
            label={`Actions for ${row.original.name}`}
          />
        ),
      },
      );

      return cols;
    },
    [enableBulkActions, listTab, mutations, pendingOnly, requestConfirm, requestReason, show, showError],
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
        {!pendingOnly ? (
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={listTab === 'active' ? 'primary' : 'outline'}
              onClick={() => setListTab('active')}
            >
              Candidates
            </Button>
            <Button
              size="sm"
              variant={listTab === 'archived' ? 'primary' : 'outline'}
              onClick={() => setListTab('archived')}
            >
              Archived Candidates
            </Button>
          </div>
        ) : null}
        <TanStackDataTable
          key={`${pendingOnly}-${listTab}-${search}`}
          columns={columns}
          data={rows}
          searchPlaceholder="Search candidates…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          getRowId={(row) => String(row.id)}
          stickyHeader
          fillHeight
          dense
          filtersInline={!pendingOnly && listTab === 'active'}
          enableRowSelection={enableBulkActions}
          bulkActions={
            enableBulkActions
              ? (selected) => {
                  const approveEligible = selected.filter(
                    (row) => canApprove(rowToGateInput(row)).allowed,
                  );
                  const publishEligible = selected.filter(
                    (row) => canPublish(rowToGateInput(row)).allowed,
                  );
                  const unpublishEligible = selected.filter(canUnpublishRow);

                  return (
                    <>
                      <Button
                        size="sm"
                        disabled={bulkBusy || approveEligible.length === 0}
                        title={
                          approveEligible.length === 0
                            ? 'Select candidates pending admin approval'
                            : `Approve ${approveEligible.length} candidate(s)`
                        }
                        onClick={() => bulkApprove(selected)}
                      >
                        {bulkBusy ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Approve{approveEligible.length > 0 ? ` (${approveEligible.length})` : ''}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={bulkBusy || publishEligible.length === 0}
                        title={
                          publishEligible.length === 0
                            ? 'Select approved candidates ready to publish'
                            : `Publish ${publishEligible.length} candidate(s)`
                        }
                        onClick={() => bulkPublish(selected)}
                      >
                        {bulkBusy ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Globe className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Publish{publishEligible.length > 0 ? ` (${publishEligible.length})` : ''}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={bulkBusy || unpublishEligible.length === 0}
                        title={
                          unpublishEligible.length === 0
                            ? 'Select candidates published to clients'
                            : `Unpublish ${unpublishEligible.length} candidate(s)`
                        }
                        onClick={() => bulkUnpublish(selected)}
                      >
                        {bulkBusy ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Unpublish
                        {unpublishEligible.length > 0 ? ` (${unpublishEligible.length})` : ''}
                      </Button>
                    </>
                  );
                }
              : undefined
          }
          toolbar={
            pendingOnly || listTab === 'archived' ? undefined : (
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
            pendingOnly || listTab === 'archived' ? undefined : (
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
      {reasonDialog}
    </>
  );
}

export function SuperAdminCandidatesPage() {
  return <CandidatesTable pendingOnly={false} />;
}

export function SuperAdminPendingCandidatesPage() {
  return <CandidatesTable pendingOnly />;
}
