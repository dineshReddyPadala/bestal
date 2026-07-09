import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, Input, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import {
  useEvaluationMutations,
  useEvaluationsList,
} from '../../hooks/api/useEvaluations';
import type { EvaluationListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type EvaluationManagementViewProps = {
  title?: string;
  description?: string;
  candidateDetailPath?: (candidateId: number) => string;
};

const defaultFilters = {
  status: 'all',
  candidate: 'all',
  evaluator: 'all',
  recommendation: 'all',
};

function ScoreCell({ value }: { value: number | null | undefined }) {
  if (value == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span className="font-medium tabular-nums">{value}</span>;
}

export function EvaluationManagementView({
  title = 'Evaluation Management',
}: EvaluationManagementViewProps) {
  const { message, show } = useDemoToast();
  const { data, isLoading, isError, error } = useEvaluationsList({ limit: 100, sort: '-createdAt' });
  const { data: candidatesData } = useCandidatesList({ limit: 100 });
  const mutations = useEvaluationMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorCompany, setEvaluatorCompany] = useState('');
  const [evaluationType, setEvaluationType] = useState('');
  const [summary, setSummary] = useState('');
  const [technicalScore, setTechnicalScore] = useState('');
  const [communicationScore, setCommunicationScore] = useState('');

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

  const candidateNames = useMemo(
    () => [...new Set(records.map((r) => r.candidateName))].sort(),
    [records],
  );

  const evaluatorNames = useMemo(
    () => [...new Set(records.map((r) => r.evaluatorName))].sort(),
    [records],
  );

  const recommendationOptions = useMemo(
    () =>
      [...new Set(records.map((r) => r.recommendation).filter(Boolean) as string[])].sort(),
    [records],
  );

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.status !== 'all') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.candidate !== 'all') {
      rows = rows.filter((r) => r.candidateName === filters.candidate);
    }
    if (filters.evaluator !== 'all') {
      rows = rows.filter((r) => r.evaluatorName === filters.evaluator);
    }
    if (filters.recommendation !== 'all') {
      if (filters.recommendation === 'none') {
        rows = rows.filter((r) => r.recommendation == null);
      } else {
        rows = rows.filter((r) => r.recommendation === filters.recommendation);
      }
    }

    rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return rows;
  }, [records, filters]);

  const handleCreate = useCallback(async () => {
    const candidateId = Number(selectedCandidateId);
    if (!candidateId) {
      show('Select a candidate');
      return;
    }

    try {
      await mutations.create.mutateAsync({
        candidateId,
        evaluatorName: evaluatorName.trim() || undefined,
        evaluatorCompany: evaluatorCompany.trim() || undefined,
        evaluationType: evaluationType || undefined,
        summary: summary.trim() || undefined,
        technicalScore: technicalScore ? Number(technicalScore) : undefined,
        communicationScore: communicationScore ? Number(communicationScore) : undefined,
      });
      const candidate = candidateOptions.find((c) => c.id === candidateId);
      show(`Evaluation created — ${candidate?.name ?? 'candidate'}`);
      setCreateOpen(false);
      setSelectedCandidateId('');
      setEvaluatorName('');
      setEvaluatorCompany('');
      setEvaluationType('');
      setSummary('');
      setTechnicalScore('');
      setCommunicationScore('');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Create failed');
    }
  }, [
    candidateOptions,
    communicationScore,
    evaluationType,
    evaluatorCompany,
    evaluatorName,
    mutations.create,
    selectedCandidateId,
    show,
    summary,
    technicalScore,
  ]);

  const columns = useMemo<ColumnDef<EvaluationListItem>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'evaluatorName',
        header: 'Evaluator',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'recommendation',
        header: 'Recommendation',
        cell: ({ getValue }) => {
          const val = getValue() as string | null | undefined;
          return val ? (
            <StatusBadge status={val} />
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        id: 'score',
        header: 'Score',
        cell: ({ row }) => (
          <ScoreCell value={row.original.overallScore ?? row.original.score} />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{formatDate(getValue() as string)}</span>
        ),
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
      : 'Failed to load evaluations'
    : null;

  return (
    <>
      <ListingPageShell
        title={title}
        message={message}
        error={listError}
        loading={isLoading}
        loadingLabel="Loading evaluations…"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setSelectedCandidateId('');
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add evaluation
          </Button>
        }
      >
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate, evaluator, or status…"
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
                label="CANDIDATE"
                value={filters.candidate}
                onChange={(v) => updateFilter('candidate', v)}
                options={[
                  { value: 'all', label: 'All candidates' },
                  ...candidateNames.map((c) => ({ value: c, label: c })),
                ]}
              />
              <ListingFilterSelect
                label="EVALUATOR"
                value={filters.evaluator}
                onChange={(v) => updateFilter('evaluator', v)}
                options={[
                  { value: 'all', label: 'All evaluators' },
                  ...evaluatorNames.map((e) => ({ value: e, label: e })),
                ]}
              />
              <ListingFilterSelect
                label="RECOMMENDATION"
                value={filters.recommendation}
                onChange={(v) => updateFilter('recommendation', v)}
                className="w-[180px] min-w-[140px]"
                options={[
                  { value: 'all', label: 'All recommendations' },
                  { value: 'none', label: 'None yet' },
                  ...recommendationOptions.map((r) => ({
                    value: r,
                    label: r.replace(/_/g, ' '),
                  })),
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [r.candidateName, r.evaluatorName, r.status, r.recommendation].some((field) =>
              String(field ?? '').toLowerCase().includes(q),
            );
          }}
        />
      </ListingPageShell>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add evaluation"
        className="max-w-lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleCreate()}>
              Create evaluation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="eval-candidate" className="text-sm font-medium">
              Candidate *
            </label>
            <Select
              id="eval-candidate"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="eval-evaluator-name" className="text-sm font-medium">
                Evaluator name
              </label>
              <Input
                id="eval-evaluator-name"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="eval-evaluator-company" className="text-sm font-medium">
                Evaluator company
              </label>
              <Input
                id="eval-evaluator-company"
                value={evaluatorCompany}
                onChange={(e) => setEvaluatorCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="eval-type" className="text-sm font-medium">
              Evaluation type
            </label>
            <Select
              id="eval-type"
              value={evaluationType}
              onChange={(e) => setEvaluationType(e.target.value)}
            >
              <option value="">— Select —</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="ARCHITECTURE">Architecture</option>
              <option value="FULL_STACK">Full stack</option>
              <option value="SECURITY">Security</option>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="eval-technical-score" className="text-sm font-medium">
                Technical score
              </label>
              <Input
                id="eval-technical-score"
                type="number"
                min={0}
                max={100}
                value={technicalScore}
                onChange={(e) => setTechnicalScore(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="eval-communication-score" className="text-sm font-medium">
                Communication score
              </label>
              <Input
                id="eval-communication-score"
                type="number"
                min={0}
                max={100}
                value={communicationScore}
                onChange={(e) => setCommunicationScore(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="eval-summary" className="text-sm font-medium">
              Summary
            </label>
            <textarea
              id="eval-summary"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
