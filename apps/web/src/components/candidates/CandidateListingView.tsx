import { Avatar, Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import type { CandidateListItem } from '../../lib/api/types';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type CandidateListingViewProps = {
  basePath: string;
  addCandidatePath: string;
  title?: string;
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
  if (value === 'PUBLISHED') return <StatusBadge status="PUBLISHED" />;
  if (value === 'HIDDEN') return <StatusBadge status="HIDDEN" />;
  return <StatusBadge status="DRAFT" />;
}

export function CandidateListingView({
  basePath,
  addCandidatePath,
  title = 'Candidates',
}: CandidateListingViewProps) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(defaultFilters);

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

  const columns = useMemo<ColumnDef<ApiCandidateRow>[]>(
    () => [
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
      {
        accessorKey: 'visibility',
        header: 'Visibility',
        cell: ({ getValue }) => <VisibilityBadge value={String(getValue())} />,
      },
    ],
    [],
  );

  return (
    <ListingPageShell
      title={title}
      loading={isLoading}
      loadingLabel="Loading candidates…"
      error={isError ? (error instanceof Error ? error.message : 'Failed to load candidates') : null}
      actions={
        <>
          <Button variant="outline" size="sm" to={`${basePath}/import`}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import CSV
          </Button>
          <Button size="sm" to={addCandidatePath}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Candidate
          </Button>
        </>
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
        emptyTitle="No candidates yet"
        emptyDescription="Add a candidate or adjust filters to see live records."
        onRowClick={(row) => navigate(`${basePath}/${row.id}`)}
        filters={
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
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'DRAFT', label: 'Unpublished' },
                { value: 'HIDDEN', label: 'Hidden' },
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
          return [r.fullName, r.email, r.headline ?? '', r.location ?? '', r.primarySkillCommunityName ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q);
        }}
      />
    </ListingPageShell>
  );
}
