import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import {
  useBackgroundCheckMutations,
  useBackgroundChecksList,
} from '../../hooks/api/useEvaluations';
import type { BackgroundCheckListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

const BGV_TYPES = [
  'CRIMINAL',
  'EMPLOYMENT',
  'EDUCATION',
  'REFERENCE',
  'IDENTITY',
  'CREDIT',
  'COMPREHENSIVE',
] as const;

type BackgroundVerificationManagementViewProps = {
  title?: string;
  description?: string;
};

const defaultFilters = {
  status: 'all',
  type: 'all',
};

export function BackgroundVerificationManagementView({
  title = 'Background Verification Management',
}: BackgroundVerificationManagementViewProps) {
  const { message, show } = useDemoToast();
  const { data, isLoading, isError, error } = useBackgroundChecksList({
    limit: 100,
    sort: '-createdAt',
  });
  const { data: candidatesData } = useCandidatesList({ limit: 100 });
  const mutations = useBackgroundCheckMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedType, setSelectedType] = useState<string>('CRIMINAL');

  const records = useMemo(() => data?.data ?? [], [data]);

  const candidateOptions = useMemo(
    () =>
      (candidatesData?.data ?? []).map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
      })),
    [candidatesData],
  );

  const statusOptions = useMemo(
    () => [...new Set(records.map((r) => r.status))].sort(),
    [records],
  );

  const typeOptions = useMemo(
    () => [...new Set(records.map((r) => r.type).filter(Boolean) as string[])].sort(),
    [records],
  );

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.status !== 'all') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.type !== 'all') {
      rows = rows.filter((r) => r.type === filters.type);
    }

    rows.sort((a, b) => {
      const aTime = (a.initiatedAt ?? a.requestedAt ?? a.createdAt)
        ? new Date(a.initiatedAt ?? a.requestedAt ?? a.createdAt).getTime()
        : 0;
      const bTime = (b.initiatedAt ?? b.requestedAt ?? b.createdAt)
        ? new Date(b.initiatedAt ?? b.requestedAt ?? b.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    return rows;
  }, [records, filters]);

  const handleRequest = useCallback(async () => {
    const candidateId = Number(selectedCandidateId);
    if (!candidateId) {
      show('Select a candidate');
      return;
    }

    try {
      await mutations.create.mutateAsync({
        candidateId,
        type: selectedType,
      });
      const candidate = candidateOptions.find((c) => c.id === candidateId);
      show(`BGV requested — ${candidate?.name ?? 'candidate'} (${selectedType})`);
      setRequestOpen(false);
      setSelectedCandidateId('');
      setSelectedType('CRIMINAL');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Request failed');
    }
  }, [candidateOptions, mutations.create, selectedCandidateId, selectedType, show]);

  const columns = useMemo<ColumnDef<BackgroundCheckListItem>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'provider',
        header: 'Provider',
        cell: ({ row }) => (
          <span>{row.original.provider ?? row.original.vendor ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const val = getValue() as string | undefined;
          return val ? <StatusBadge status={val} /> : <span className="text-muted-foreground">—</span>;
        },
      },
      {
        id: 'initiated',
        header: 'Initiated',
        cell: ({ row }) => {
          const val = row.original.initiatedAt ?? row.original.requestedAt;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'completedAt',
        header: 'Completed',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
    ],
    [],
  );

  const updateFilter = (key: keyof typeof defaultFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const listError = isError
    ? error instanceof Error
      ? error.message
      : 'Failed to load background checks'
    : null;

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        error={listError}
        loading={isLoading}
        loadingLabel="Loading background checks…"
        actions={
          <Button size="sm" onClick={() => setRequestOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Request BGV
          </Button>
        }
      >
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate or provider…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
          filters={
            <ListingFiltersRow onClear={() => setFilters(defaultFilters)}>
              <ListingFilterSelect
                label="STATUS"
                value={filters.status}
                onChange={(v) => updateFilter('status', v)}
                options={[
                  { value: 'all', label: 'All statuses' },
                  ...statusOptions.map((s) => ({
                    value: s,
                    label: s.replace(/_/g, ' '),
                  })),
                ]}
              />
              <ListingFilterSelect
                label="TYPE"
                value={filters.type}
                onChange={(v) => updateFilter('type', v)}
                options={[
                  { value: 'all', label: 'All types' },
                  ...typeOptions.map((t) => ({
                    value: t,
                    label: t.replace(/_/g, ' '),
                  })),
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            const provider = r.provider ?? r.vendor ?? '';
            return [r.candidateName, provider, r.status, r.type].some((field) =>
              String(field ?? '').toLowerCase().includes(q),
            );
          }}
        />
      </ListingPageShell>

      <Dialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Request background verification"
        className="max-w-md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setRequestOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleRequest()}>
              Request BGV
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="bgv-candidate" className="text-sm font-medium">
              Candidate *
            </label>
            <Select
              id="bgv-candidate"
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
            >
              <option value="">— Select —</option>
              {candidateOptions.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="bgv-type" className="text-sm font-medium">
              Check type *
            </label>
            <Select
              id="bgv-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {BGV_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Dialog>
    </>
  );
}
