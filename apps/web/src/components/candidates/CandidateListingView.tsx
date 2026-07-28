import {
  CANDIDATE_PROFILE_STATUS_LABELS,
  CANDIDATE_VISIBILITY_LABELS,
  CANDIDATE_VISIBILITY_STATUSES,
  type CandidateProfileStatusValue,
} from '@bestal/shared-utils';
import { Avatar, Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, FileSpreadsheet, Plus, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCandidateMutations, useCandidatesList } from '../../hooks/api/useCandidates';
import { usePermissions } from '../../hooks/usePermissions';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { CandidateListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';
import { ToastHost } from '../ui/ToastHost';

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
}: {
  basePath: string;
  row: ApiCandidateRow;
  onSubmit: (row: ApiCandidateRow) => void;
  submitting: boolean;
  enableSubmitForApproval?: boolean;
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
              <Send className="h-3.5 w-3.5" />
              Submit for approval
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
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [filters, setFilters] = useState(defaultFilters);
  const [submitting, setSubmitting] = useState(false);

  const showSubmitActions = enableSubmitForApproval && canWriteCandidates && !readOnly;

  const listParams = useMemo(
    () => ({
      limit: 100,
      sort: '-createdAt',
      status: filters.status === 'all' ? undefined : filters.status,
      visibility: filters.visibility === 'all' ? undefined : filters.visibility,
      approvalStatus: filters.approvalStatus === 'all' ? undefined : filters.approvalStatus,
    }),
    [filters],
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
          const profile = row.original.profileStatus ?? 'SOURCED';
          const approval = row.original.approvalStatus;
          let outcome: string | null = null;
          if (approval === 'REJECTED') outcome = 'Rejected';
          else if (profile === 'ADMIN_APPROVED' || approval === 'APPROVED') outcome = 'Approved';
          else if (profile === 'RECRUITER_SCREENED' && row.original.submittedForApprovalAt == null) {
            // May be sent-back; list DTO has no rejectionReason — keep badge only
            outcome = null;
          }
          return (
            <div className="min-w-[120px]">
              <StatusBadge status={profile} />
              {outcome ? (
                <p className="mt-1 text-[10px] text-muted-foreground">{outcome}</p>
              ) : null}
            </div>
          );
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
            enableSubmitForApproval={showSubmitActions}
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
  }, [basePath, onAddToShortlist, readOnly, showSubmitActions, submitOne, submitting]);

  return (
    <>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <ListingPageShell
        title={title}
        loading={isLoading}
        loadingLabel="Loading candidates…"
        error={isError ? (error instanceof Error ? error.message : 'Failed to load candidates') : null}
        actions={
          addCandidatePath || importPath ? (
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
          ) : undefined
        }
      >
        <TanStackDataTable
          columns={columns}
          data={rows}
          searchPlaceholder="Search by name or email…"
          pageSize={12}
          getRowId={(row) => String(row.id)}
          stickyHeader
          fillHeight
          dense
          filtersInline
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
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      {submitting
                        ? 'Submitting…'
                        : `Submit for approval${eligibleCount > 0 ? ` (${eligibleCount})` : ''}`}
                    </Button>
                  );
                }
              : undefined
          }
          filters={
            readOnly ? undefined : (
              <ListingFiltersRow onClear={() => setFilters(defaultFilters)}>
                <ListingFilterSelect
                  label="STATUS"
                  value={filters.status}
                  onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                  options={[
                    { value: 'all', label: 'All statuses' },
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
            )
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
    </>
  );
}
