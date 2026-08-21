import { StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useClientEnquiries } from '../../hooks/api/useAdmin';
import { useClientEnquiryBasePath } from '../../hooks/useClientEnquiryBasePath';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';

type Row = {
  id: number;
  referenceCode: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  rolesCount: number;
  status: string;
  createdAt: string;
};

export function SuperAdminClientEnquiriesPage() {
  const navigate = useNavigate();
  const basePath = useClientEnquiryBasePath();
  const [status, setStatus] = useState('all');
  const { searchInput, setSearchInput, search, searchParam, clearSearch } = useDebouncedSearch();

  const { data, isLoading, isError, error } = useClientEnquiries({
    limit: 100,
    page: 1,
    ...(status !== 'all' ? { status } : {}),
    ...searchParam,
  });

  const rows = (data?.data ?? []) as Row[];

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: 'referenceCode',
        header: 'Reference',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{getValue() as string}</span>
        ),
      },
      { accessorKey: 'companyName', header: 'Company' },
      { accessorKey: 'contactName', header: 'Contact' },
      { accessorKey: 'contactEmail', header: 'Email' },
      {
        accessorKey: 'rolesCount',
        header: 'Roles',
        cell: ({ getValue }) => getValue() ?? 1,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Submitted',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const items: ActionMenuItem[] = [
            {
              id: 'view',
              label: 'View enquiry',
              onSelect: () => navigate(`${basePath}/${row.original.id}`),
            },
          ];
          return <ActionMenu items={items} label={`Actions for ${row.original.referenceCode}`} />;
        },
      },
    ],
    [navigate, basePath],
  );

  return (
    <ListingPageShell
      title="Client Enquiry"
      error={isError ? (error instanceof Error ? error.message : 'Failed to load enquiries') : null}
      loading={isLoading}
      loadingLabel="Loading client enquiries…"
    >
      <TanStackDataTable
        key={`${status}-${search}`}
        columns={columns}
        data={rows}
        searchPlaceholder="Search reference, company, contact, or email…"
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        serverSideSearch
        pageSize={12}
        stickyHeader
        fillHeight
        dense
        filtersInline
        filters={
          <ListingFiltersRow
            onClear={() => {
              setStatus('all');
              clearSearch();
            }}
          >
            <ListingFilterSelect
              label="STATUS"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'CONTACTED', label: 'Contacted' },
                { value: 'QUALIFIED', label: 'Qualified' },
                { value: 'CONVERTED', label: 'Converted' },
                { value: 'CLOSED', label: 'Closed' },
              ]}
            />
          </ListingFiltersRow>
        }
      />
    </ListingPageShell>
  );
}
