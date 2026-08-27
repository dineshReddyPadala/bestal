import {
  CANDIDATE_PROFILE_STATUS_LABELS,
  CANDIDATE_VISIBILITY_LABELS,
  CANDIDATE_VISIBILITY_STATUSES,
  type CandidateProfileStatusValue,
} from '@bestal/shared-utils';
import { Avatar, Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, FileSpreadsheet, Loader2, Plus, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCandidateMutations, useCandidatesList } from '../../hooks/api/useCandidates';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { usePermissions } from '../../hooks/usePermissions';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { CandidateListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import { useConfirmAction } from '../super-admin/useConfirmAction';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type CandidateListingViewProps = {
  basePath: string;
  addCandidatePath?: string;
  /** When set, shows Import Candidates beside Add Candidate */
  importPath?: string;
  title?: string;
  readOnly?: boolean;
  /** Recruiter listing: row + multi-select Submit for approval */
  enableSubmitForApproval?: boolean;
  /** Sales listing: add candidate to a client shortlist */
  onAddToShortlist?: (candidate: CandidateListItem) => void;
};

type ListFilters = {
  status: string;
  visibility: string;
  approvalStatus: string;
};

const defaultFilters: ListFilters = {
  status: 'all',
  visibility: 'all',
  approvalStatus: 'all',
};

type ApiCandidateRow = CandidateListItem & {
  fullName: string;
};

function toRow(item: CandidateListItem): ApiCandidateRow {
  return {
    ...item,
    fullName: `${item.firstName} ${item.lastName}`.trim(),
  };
}

function VisibilityBadge({ value }: { value: string }) {
  if (value === 'CLIENT_VISIBLE') return <StatusBadge status="CLIENT_VISIBLE" />;
  if (value === 'HIDDEN') return <StatusBadge status="HIDDEN" />;
  return <StatusBadge status="INTERNAL_ONLY" />;
}

function canSubmitCandidate(row: ApiCandidateRow): boolean {
  return (
    row.profileStatus === 'PROFILE_DRAFT' &&
    !row.submittedForApprovalAt &&
    row.evaluationStatus === 'COMPLETED' &&
    Boolean(row.bgvStatus) &&
    row.bgvStatus !== 'NOT_STARTED' &&
    row.bgvStatus !== 'FAILED'
  );
}

function profileStatusLabel(status: string | null): string {
  if (!status) return '—';
  return (
    CANDIDATE_PROFILE_STATUS_LABELS[status as CandidateProfileStatusValue] ?? status
  );
}

function CandidateRowActionsMenu({
  basePath,
  row,
  onSubmit,
  submitting,
  enableSubmitForApproval,
  archivedTab,
  onArchive,
  onUnarchive,
}: {
  basePath: string;
  row: ApiCandidateRow;
  onSubmit: (row: ApiCandidateRow) => void;
  submitting: boolean;
  enableSubmitForApproval?: boolean;
  archivedTab?: boolean;
  onArchive?: (row: ApiCandidateRow) => void;
  onUnarchive?: (row: ApiCandidateRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const eligible = canSubmitCandidate(row);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Candidate actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          <Link
            to={`${basePath}/${row.id}`}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            View Candidate
          </Link>
          <Link
            to={`${basePath}/${row.id}/edit`}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Edit Candidate
          </Link>
          {enableSubmitForApproval ? (
            <button
              type="button"
              disabled={!eligible || submitting}
              title={
                eligible
                  ? undefined
                  : row.submittedForApprovalAt
                    ? 'Already submitted for approval'
                    : 'Requires profile status PROFILE_DRAFT'
              }
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                if (!eligible || submitting) return;
                onSubmit(row);
                setOpen(false);
              }}
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {submitting ? 'Submitting…' : 'Submit for approval'}
            </button>
          ) : null}
          {archivedTab ? (
            onUnarchive ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  onUnarchive(row);
                  setOpen(false);
                }}
              >
                Unarchive
              </button>
            ) : null
          ) : onArchive ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                onArchive(row);
                setOpen(false);
              }}
            >
              Archive
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function CandidateListingView({
  basePath,
  addCandidatePath,
  importPath,
  title = 'Candidates',
  readOnly = false,
  enableSubmitForApproval = false,
  onAddToShortlist,
}: CandidateListingViewProps) {
  const navigate = useNavigate();
  const { canWriteCandidates } = usePermissions();
  const mutations = useCandidateMutations();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [filters, setFilters] = useState(defaultFilters);
  const [listTab, setListTab] = useState<'active' | 'archived'>('active');
  const [submitting, setSubmitting] = useState(false);
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();

  const showSubmitActions = enableSubmitForApproval && canWriteCandidates && !readOnly;

  const listParams = useMemo(
    () => ({
      limit: 100,
      sort: '-updatedAt',
      ...searchParam,
      archived: listTab === 'archived',
      status: filters.status === 'all' ? undefined : filters.status,
      visibility: filters.visibility === 'all' ? undefined : filters.visibility,
      approvalStatus: filters.approvalStatus === 'all' ? undefined : filters.approvalStatus,
    }),
    [filters, listTab, searchParam],
  );

  const { data, isLoading, isError, error } = useCandidatesList(listParams);
  const rows = useMemo(() => (data?.data ?? []).map(toRow), [data]);

  const submitOne = useCallback(
    async (row: ApiCandidateRow) => {
      if (!canSubmitCandidate(row)) {
        showError('Candidate is not ready to submit for approval');
        return;
      }
      setSubmitting(true);
      try {
        await mutations.submitForApproval.mutateAsync(row.id);
        show(`Submitted ${row.fullName} for approval`);
      } catch (err) {
        showError(getApiErrorMessage(err, 'Submit for approval failed'));
      } finally {
        setSubmitting(false);
      }
    },
    [mutations.submitForApproval, show, showError],
  );

  const submitMany = useCallback(
    async (selected: ApiCandidateRow[]) => {
      const eligible = selected.filter(canSubmitCandidate);
      if (eligible.length === 0) {
        showError('None of the selected candidates are ready to submit (need PROFILE_DRAFT)');
        return;
      }

      setSubmitting(true);
      let success = 0;
      const failures: string[] = [];

      for (const row of eligible) {
        try {
          await mutations.submitForApproval.mutateAsync(row.id);
          success += 1;
        } catch (err) {
          failures.push(`${row.fullName}: ${getApiErrorMessage(err, 'failed')}`);
        }
      }

      setSubmitting(false);

      const skipped = selected.length - eligible.length;
      if (failures.length === 0) {
        show(
          `Submitted ${success} candidate${success === 1 ? '' : 's'} for approval${
            skipped > 0 ? ` (${skipped} skipped)` : ''
          }`,
        );
      } else {
        showError(
          `Submitted ${success}, failed ${failures.length}${
            skipped > 0 ? `, skipped ${skipped}` : ''
          }. ${failures[0]}`,
        );
      }
    },
    [mutations.submitForApproval, show, showError],
  );

  const archiveOne = useCallback(
    (row: ApiCandidateRow) => {
      requestConfirm({
        title: 'Archive Candidate?',
        description: `${row.fullName} will be archived and removed from active listings.`,
        confirmLabel: 'Archive',
        destructive: true,
        onConfirm: async () => {
          await mutations.archive.mutateAsync(row.id);
          show('Candidate archived');
        },
        onError: showError,
      });
    },
    [mutations.archive, requestConfirm, show, showError],
  );

  const unarchiveOne = useCallback(
    (row: ApiCandidateRow) => {
      requestConfirm({
        title: 'Unarchive Candidate?',
        description: `${row.fullName} will be restored to active candidates.`,
        confirmLabel: 'Unarchive',
        onConfirm: async () => {
          await mutations.unarchive.mutateAsync(row.id);
          show('Candidate unarchived');
        },
        onError: showError,
      });
    },
    [mutations.unarchive, requestConfirm, show, showError],
  );

  const columns = useMemo<ColumnDef<ApiCandidateRow>[]>(() => {
    const cols: ColumnDef<ApiCandidateRow>[] = [];

    if (showSubmitActions) {
      cols.push({
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
      });
    }

    cols.push(
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex min-w-[220px] items-center gap-3">
            <Avatar name={row.original.fullName} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium leading-tight text-foreground">
                {row.original.fullName}
              </p>
              <p className="truncate text-xs leading-tight text-muted-foreground">
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'headline',
        header: 'Headline',
        cell: ({ getValue }) => (
          <span className="block max-w-[240px] truncate text-muted-foreground">
            {(getValue() as string | null) || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'primarySkillCommunityName',
        header: 'Community',
        cell: ({ getValue }) => (getValue() as string | null) || '—',
      },
      {
        accessorKey: 'yearsExperience',
        header: 'Experience',
        cell: ({ getValue }) => {
          const years = getValue() as number | null;
          return years == null ? '—' : `${years} yrs`;
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ getValue }) => (getValue() as string | null) || '—',
      },
      {
        accessorKey: 'profileStatus',
        header: 'Pipeline',
        cell: ({ row }) => {
          const approval = row.original.approvalStatus;
          const status =
            approval === 'REJECTED'
              ? 'REJECTED'
              : (row.original.profileStatus ?? 'SOURCED');
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
      {
        accessorKey: 'visibility',
        header: 'Visibility',
        cell: ({ getValue }) => <VisibilityBadge value={String(getValue())} />,
      },
    );

    if (!readOnly) {
      cols.push({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <CandidateRowActionsMenu
            basePath={basePath}
            row={row.original}
            onSubmit={submitOne}
            submitting={submitting}
            enableSubmitForApproval={showSubmitActions && listTab === 'active'}
            archivedTab={listTab === 'archived'}
            onArchive={canWriteCandidates && listTab === 'active' ? archiveOne : undefined}
            onUnarchive={canWriteCandidates && listTab === 'archived' ? unarchiveOne : undefined}
          />
        ),
        enableSorting: false,
      });
    } else if (onAddToShortlist) {
      cols.push({
        id: 'shortlist',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAddToShortlist(row.original);
            }}
          >
            Shortlist
          </Button>
        ),
        enableSorting: false,
      });
    }

    return cols;
  }, [archiveOne, basePath, canWriteCandidates, listTab, onAddToShortlist, readOnly, showSubmitActions, submitOne, submitting, unarchiveOne]);

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        messageVariant={variant}
        onMessageDismiss={dismiss}
        loading={isLoading}
        loadingLabel="Loading candidates…"
        error={isError ? (error instanceof Error ? error.message : 'Failed to load candidates') : null}
      >
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
        <TanStackDataTable
          key={`${listTab}-${search}`}
          columns={columns}
          data={rows}
          searchPlaceholder="Search by name or email…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          getRowId={(row) => String(row.id)}
          stickyHeader
          fillHeight
          dense
          filtersInline
          toolbar={
            addCandidatePath || importPath ? (
              <>
                {importPath ? (
                  <Button size="sm" to={importPath}>
                    <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                    Import Candidates
                  </Button>
                ) : null}
                {addCandidatePath ? (
                  <Button size="sm" to={addCandidatePath}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Candidate
                  </Button>
                ) : null}
              </>
            ) : undefined
          }
          enableRowSelection={showSubmitActions}
          emptyTitle={readOnly ? 'No matching candidates' : 'No candidates yet'}
          emptyDescription={
            readOnly
              ? 'Adjust your search or filters to find talent.'
              : 'Add a candidate or adjust filters to see live records.'
          }
          onRowClick={readOnly ? undefined : (row) => navigate(`${basePath}/${row.id}`)}
          bulkActions={
            showSubmitActions
              ? (selected) => {
                  const eligibleCount = selected.filter(canSubmitCandidate).length;
                  return (
                    <Button
                      size="sm"
                      disabled={submitting || eligibleCount === 0}
                      title={
                        eligibleCount === 0
                          ? 'Select candidates in PROFILE_DRAFT that are not yet submitted'
                          : `Submit ${eligibleCount} ready candidate(s)`
                      }
                      onClick={() => void submitMany(selected)}
                    >
                      {submitting ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {submitting
                        ? 'Submitting…'
                        : `Submit for approval${eligibleCount > 0 ? ` (${eligibleCount})` : ''}`}
                    </Button>
                  );
                }
              : undefined
          }
          filters={
            <ListingFiltersRow>
              <ListingFilterSelect
                label="STATUS"
                value={filters.status}
                onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                options={[
                  { value: 'all', label: 'All status' },
                  { value: 'NEW', label: 'New' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                  { value: 'PLACED', label: 'Placed' },
                  { value: 'DO_NOT_CONTACT', label: 'Do not contact' },
                ]}
              />
              <ListingFilterSelect
                label="VISIBILITY"
                value={filters.visibility}
                onChange={(v) => setFilters((prev) => ({ ...prev, visibility: v }))}
                options={[
                  { value: 'all', label: 'All visibility' },
                  ...CANDIDATE_VISIBILITY_STATUSES.map((value) => ({
                    value,
                    label: CANDIDATE_VISIBILITY_LABELS[value],
                  })),
                ]}
              />
              <ListingFilterSelect
                label="APPROVAL"
                value={filters.approvalStatus}
                onChange={(v) => setFilters((prev) => ({ ...prev, approvalStatus: v }))}
                options={[
                  { value: 'all', label: 'All approvals' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'REJECTED', label: 'Rejected' },
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [
              r.fullName,
              r.email,
              r.headline ?? '',
              r.location ?? '',
              r.primarySkillCommunityName ?? '',
              profileStatusLabel(r.profileStatus),
            ]
              .join(' ')
              .toLowerCase()
              .includes(q);
          }}
        />
      </ListingPageShell>
      {confirmDialog}
    </>
  );
}
