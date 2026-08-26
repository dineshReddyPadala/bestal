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
import { useContactMessages } from '../../hooks/api/useAdmin';
import { CONTACT_TOPIC_LABELS, CONTACT_TOPICS } from '../../lib/marketing-copy';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import type { ContactTopicValue } from '../../lib/marketing-copy';

type Row = {
  id: number;
  referenceCode: string;
  fullName: string;
  email: string;
  topic: ContactTopicValue;
  status: string;
  createdAt: string;
};

const BASE_PATH = '/super-admin/contact-messages';

export function SuperAdminContactMessagesPage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('all');
  const [topic, setTopic] = useState('all');
  const { searchInput, setSearchInput, search, searchParam, clearSearch } = useDebouncedSearch();

  const { data, isLoading, isError, error } = useContactMessages({
    limit: 100,
    page: 1,
    ...(status !== 'all' ? { status } : {}),
    ...(topic !== 'all' ? { topic } : {}),
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
      { accessorKey: 'fullName', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'topic',
        header: 'Topic',
        cell: ({ getValue }) => CONTACT_TOPIC_LABELS[getValue() as ContactTopicValue] ?? getValue(),
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
              label: 'View message',
              onSelect: () => navigate(`${BASE_PATH}/${row.original.id}`),
            },
          ];
          return <ActionMenu items={items} label={`Actions for ${row.original.referenceCode}`} />;
        },
      },
    ],
    [navigate],
  );

  const table = (
    <TanStackDataTable
      key={`${status}-${topic}-${search}`}
      columns={columns}
      data={rows}
      searchPlaceholder="Search reference, name, email, or message…"
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
            setTopic('all');
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
              { value: 'READ', label: 'Read' },
              { value: 'REPLIED', label: 'Replied' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
          />
          <ListingFilterSelect
            label="TOPIC"
            value={topic}
            onChange={setTopic}
            options={[
              { value: 'all', label: 'All' },
              ...CONTACT_TOPICS.map((item) => ({ value: item.value, label: item.label })),
            ]}
          />
        </ListingFiltersRow>
      }
    />
  );

  if (embedded) {
    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
          Loading contact messages…
        </div>
      );
    }
    if (isError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load messages'}
        </div>
      );
    }
    return <div className="flex min-h-0 flex-1 flex-col">{table}</div>;
  }

  return (
    <ListingPageShell
      title="Contact Us"
      error={isError ? (error instanceof Error ? error.message : 'Failed to load messages') : null}
      loading={isLoading}
      loadingLabel="Loading contact messages…"
    >
      {table}
    </ListingPageShell>
  );
}
