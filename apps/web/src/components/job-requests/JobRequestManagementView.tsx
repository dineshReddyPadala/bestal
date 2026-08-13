import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  toJobRequestRow,
  useJobRequest,
  useJobRequestMutations,
  useJobRequestsList,
  type JobRequestManagementRow,
} from '../../hooks/api/useJobRequests';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type JobRequestStatus = 'SUBMITTED' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'CLOSED';

const jobRequestStatuses: JobRequestStatus[] = [
  'SUBMITTED',
  'CONTACTED',
  'QUALIFIED',
  'CONVERTED',
  'CLOSED',
];

type JobRequestManagementViewProps = {
  title?: string;
};

const defaultFilters = {
  status: 'all',
  date: 'all',
};

function usePortalBasePath() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/super-admin')) return '/super-admin';
  if (pathname.startsWith('/admin')) return '/admin';
  if (pathname.startsWith('/sales')) return '/sales';
  return '/admin';
}

export function JobRequestManagementView({
  title = 'Job Requests',
}: JobRequestManagementViewProps) {
  const portalBase = usePortalBasePath();
  const navigate = useNavigate();
  const { message, show } = useDemoToast();
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusDraft, setStatusDraft] = useState<JobRequestStatus>('SUBMITTED');
  const [notesDraft, setNotesDraft] = useState('');
  const { searchInput, setSearchInput, search } = useDebouncedSearch();
  const mutations = useJobRequestMutations();

  const listParams = useMemo(
    () => ({
      limit: 100,
      sort: '-createdAt',
      search: search || undefined,
      status: filters.status === 'all' ? undefined : filters.status,
    }),
    [filters.status, search],
  );

  const { data, isLoading, isError, error } = useJobRequestsList(listParams);
  const { data: detail, isLoading: detailLoading } = useJobRequest(selectedId ?? 0);

  const filteredData = useMemo(() => {
    let rows = (data?.data ?? []).map(toJobRequestRow);
    if (filters.date !== 'all') {
      const now = new Date();
      rows = rows.filter((row) => {
        const created = new Date(row.createdAt);
        if (filters.date === '7d') {
          const cutoff = new Date(now);
          cutoff.setDate(cutoff.getDate() - 7);
          return created >= cutoff;
        }
        if (filters.date === '30d') {
          const cutoff = new Date(now);
          cutoff.setDate(cutoff.getDate() - 30);
          return created >= cutoff;
        }
        return true;
      });
    }
    return rows;
  }, [data, filters.date]);

  const openDetail = useCallback((record: JobRequestManagementRow) => {
    setSelectedId(record.id);
    setStatusDraft(record.status as JobRequestStatus);
    setNotesDraft('');
  }, []);

  useEffect(() => {
    if (detail) {
      setStatusDraft(detail.status as JobRequestStatus);
      setNotesDraft(detail.internalNotes ?? '');
    }
  }, [detail]);

  const handleSave = useCallback(() => {
    if (!selectedId || !detail) return;
    void (async () => {
      try {
        await mutations.update.mutateAsync({
          id: selectedId,
          body: {
            status: statusDraft,
            internalNotes: notesDraft.trim() || null,
          },
        });
        show('Job request updated');
      } catch (err) {
        show(err instanceof Error ? err.message : 'Failed to update job request');
      }
    })();
  }, [detail, mutations.update, notesDraft, selectedId, show, statusDraft]);

  const handleConvert = useCallback(() => {
    if (!detail) return;
    navigate(`${portalBase}/clients`, {
      state: {
        openCreate: true,
        prefilled: {
          company: detail.companyName,
          website: detail.website,
          primaryContact: detail.contactName,
          email: detail.contactEmail,
          phone: detail.contactPhone,
        },
      },
    });
    setSelectedId(null);
  }, [detail, navigate, portalBase]);

  const columns = useMemo<ColumnDef<JobRequestManagementRow>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Submitted',
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-sm">{formatDate(getValue() as string)}</span>
        ),
      },
      {
        accessorKey: 'companyName',
        header: 'Company',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'jobTitle',
        header: 'Job title',
      },
      {
        accessorKey: 'contactName',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{row.original.contactName}</div>
            <a href={`mailto:${row.original.contactEmail}`} className="text-brand hover:underline">
              {row.original.contactEmail}
            </a>
          </div>
        ),
      },
      {
        accessorKey: 'experienceRequired',
        header: 'Experience',
      },
      {
        accessorKey: 'numberOfResources',
        header: 'Headcount',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
    ],
    [],
  );

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        loading={isLoading}
        loadingLabel="Loading job requests…"
        error={isError ? (error instanceof Error ? error.message : 'Failed to load job requests') : null}
      >
        <TanStackDataTable
          key={search}
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by company, job title, or contact…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          onRowClick={(row) => openDetail(row)}
          filtersInline
          filters={
            <ListingFiltersRow onClear={() => setFilters(defaultFilters)}>
              <ListingFilterSelect
                label="STATUS"
                value={filters.status}
                onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                options={[
                  { value: 'all', label: 'All statuses' },
                  ...jobRequestStatuses.map((s) => ({
                    value: s,
                    label: s.replace(/_/g, ' '),
                  })),
                ]}
              />
              <ListingFilterSelect
                label="DATE"
                value={filters.date}
                onChange={(v) => setFilters((prev) => ({ ...prev, date: v }))}
                options={[
                  { value: 'all', label: 'All dates' },
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                ]}
              />
            </ListingFiltersRow>
          }
        />
      </ListingPageShell>

      <Dialog
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail ? detail.jobTitle : 'Job request'}
        description={detail ? `${detail.companyName} · submitted ${formatDate(detail.createdAt)}` : undefined}
        scrollable
        className="max-w-2xl"
        footer={
          detail ? (
            <>
              <Button variant="outline" onClick={() => setSelectedId(null)}>
                Close
              </Button>
              {detail.status !== 'CONVERTED' && (
                <Button variant="secondary" onClick={handleConvert}>
                  Convert to client
                </Button>
              )}
              <Button onClick={handleSave} disabled={mutations.update.isPending}>
                Save changes
              </Button>
            </>
          ) : undefined
        }
      >
        {detailLoading || !detail ? (
          <p className="py-6 text-sm text-muted-foreground">Loading details…</p>
        ) : (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Job details</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm">{detail.jobDescription}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {detail.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {detail.experienceRequired} · {detail.numberOfResources} resource
                {detail.numberOfResources === '1' ? '' : 's'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</div>
                <div className="mt-1 text-sm">{detail.companyName}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Website</div>
                <a href={detail.website} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-brand hover:underline">
                  {detail.website}
                </a>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact</div>
                <div className="mt-1 text-sm">{detail.contactName}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email / phone</div>
                <div className="mt-1 text-sm">
                  <a href={`mailto:${detail.contactEmail}`} className="text-brand hover:underline">
                    {detail.contactEmail}
                  </a>
                  <div>{detail.contactPhone}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as JobRequestStatus)}
              >
                {jobRequestStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Internal notes
              </label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder={detail.internalNotes ?? 'Add follow-up notes for your team…'}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
