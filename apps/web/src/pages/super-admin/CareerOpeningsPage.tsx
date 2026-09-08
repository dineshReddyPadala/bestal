import { Button, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../../components/layout/ListingPageShell';
import { ActionMenu, type ActionMenuItem } from '../../components/super-admin/ActionMenu';
import { useConfirmAction } from '../../components/super-admin/useConfirmAction';
import { useCareerOpeningMutations, useCareerOpenings } from '../../hooks/api/useCareerOpenings';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import type { CareerOpeningListItem, CareerOpeningStatus } from '../../lib/api/career-openings';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';

const BASE_PATH = '/super-admin/career-openings';

function formatLocation(row: CareerOpeningListItem): string {
  return row.remote ? `${row.location} · Remote` : row.location;
}

export function SuperAdminCareerOpeningsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('all');
  const { searchInput, setSearchInput, search, searchParam, clearSearch } = useDebouncedSearch();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { requestConfirm, confirmDialog } = useConfirmAction();
  const mutations = useCareerOpeningMutations();

  const { data, isLoading, isError, error } = useCareerOpenings({
    limit: 100,
    page: 1,
    ...(status !== 'all' ? { status } : {}),
    ...searchParam,
  });

  const rows = (data?.data ?? []) as CareerOpeningListItem[];

  const columns = useMemo<ColumnDef<CareerOpeningListItem>[]>(
    () => [
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'jobLevel', header: 'Level' },
      {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => formatLocation(row.original),
      },
      { accessorKey: 'skillCommunity', header: 'Skill' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const opening = row.original;
          const items: ActionMenuItem[] = [
            {
              id: 'edit',
              label: 'Edit',
              onSelect: () => navigate(`${BASE_PATH}/${opening.id}`),
            },
          ];

          if (opening.status !== 'PUBLISHED') {
            items.push({
              id: 'publish',
              label: 'Publish',
              onSelect: () =>
                requestConfirm({
                  title: 'Publish opening',
                  description: `Publish “${opening.title}” on the careers page?`,
                  confirmLabel: 'Publish',
                  onConfirm: async () => {
                    await mutations.update.mutateAsync({
                      id: opening.id,
                      body: { status: 'PUBLISHED' },
                    });
                    show('Opening published');
                  },
                  onError: showError,
                }),
            });
          } else {
            items.push({
              id: 'unpublish',
              label: 'Unpublish',
              onSelect: () =>
                requestConfirm({
                  title: 'Unpublish opening',
                  description: `Hide “${opening.title}” from the careers page?`,
                  confirmLabel: 'Unpublish',
                  onConfirm: async () => {
                    await mutations.update.mutateAsync({
                      id: opening.id,
                      body: { status: 'DRAFT' as CareerOpeningStatus },
                    });
                    show('Opening unpublished');
                  },
                  onError: showError,
                }),
            });
          }

          items.push({
            id: 'delete',
            label: 'Delete',
            destructive: true,
            separatorBefore: true,
            onSelect: () =>
              requestConfirm({
                title: 'Delete opening',
                description: `Delete “${opening.title}”? This removes it from the careers page.`,
                confirmLabel: 'Delete',
                destructive: true,
                onConfirm: async () => {
                  await mutations.remove.mutateAsync(opening.id);
                  show('Opening deleted');
                },
                onError: showError,
              }),
          });

          return <ActionMenu items={items} label={`Actions for ${opening.title}`} />;
        },
      },
    ],
    [mutations.remove, mutations.update, navigate, requestConfirm, show, showError],
  );

  return (
    <ListingPageShell
      title="Career Openings"
      actions={
        <Button size="sm" type="button" onClick={() => navigate(`${BASE_PATH}/new`)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Post opening
        </Button>
      }
      error={isError ? getApiErrorMessage(error, 'Failed to load career openings') : null}
      message={message}
      messageVariant={variant}
      onMessageDismiss={dismiss}
      loading={isLoading}
      loadingLabel="Loading career openings…"
    >
      <TanStackDataTable
        key={`${status}-${search}`}
        columns={columns}
        data={rows}
        searchPlaceholder="Search title, skill, or location…"
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
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'CLOSED', label: 'Closed' },
              ]}
            />
          </ListingFiltersRow>
        }
      />
      {confirmDialog}
    </ListingPageShell>
  );
}
