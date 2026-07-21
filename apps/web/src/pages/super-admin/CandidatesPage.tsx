import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../../components/layout/ListingPageShell';
import {
  useAdminCandidates,
  useAdminMutations,
  useAdminPendingCandidates,
} from '../../hooks/api/useAdmin';
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
  updatedAt: string;
};

const defaultFilters = {
  profileStatus: 'all',
  visibilityStatus: 'all',
};

function CandidatesTable({ pendingOnly }: { pendingOnly: boolean }) {
  const { message, show, showError } = useDemoToast();
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
        header: '',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.approveCandidate
                  .mutateAsync(row.original.id)
                  .then(() => show('Approved'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const reason = window.prompt('Rejection reason');
                if (!reason) return;
                void mutations.rejectCandidate
                  .mutateAsync({ id: row.original.id, reason })
                  .then(() => show('Rejected'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'));
              }}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.publishCandidate
                  .mutateAsync(row.original.id)
                  .then(() => show('Published'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.hideCandidate
                  .mutateAsync(row.original.id)
                  .then(() => show('Hidden'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Hide
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void mutations.archiveCandidate
                  .mutateAsync(row.original.id)
                  .then(() => show('Archived'))
                  .catch((e) => showError(e instanceof Error ? e.message : 'Failed'))
              }
            >
              Archive
            </Button>
          </div>
        ),
      },
    ],
    [mutations, show, showError],
  );

  return (
    <ListingPageShell
      title={pendingOnly ? 'Pending Approvals' : 'Candidates'}
      message={message}
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
        filters={
          pendingOnly ? undefined : (
            <ListingFiltersRow onClear={() => setFilters(defaultFilters)}>
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
  );
}

export function SuperAdminCandidatesPage() {
  return <CandidatesTable pendingOnly={false} />;
}

export function SuperAdminPendingCandidatesPage() {
  return <CandidatesTable pendingOnly />;
}
