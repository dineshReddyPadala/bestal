import { formatDate, EVALUATION_RECOMMENDATIONS, EVALUATION_TYPES } from '@bestal/shared-utils';
import { Button, Dialog, FileUpload, Input, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { AlertCircle, Loader2, Plus, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import {
  useEvaluationMutations,
  useEvaluationsList,
} from '../../hooks/api/useEvaluations';
import { mapEvaluationExtractionToForm } from '../../lib/api/ai/evaluation-extraction.mapper';
import { extractEvaluationFromFile } from '../../lib/api/ai/evaluation-extraction.stub';
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
  candidate: 'all',
  evaluator: 'all',
  evaluationType: 'all',
  recommendation: 'all',
};

function ScoreCell({ value }: { value: number | null | undefined }) {
  if (value == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span className="font-medium tabular-nums">{value}</span>;
}

function parseOptionalScore(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
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
  const [evaluationDate, setEvaluationDate] = useState('');
  const [technicalScore, setTechnicalScore] = useState('');
  const [communicationScore, setCommunicationScore] = useState('');
  const [problemSolvingScore, setProblemSolvingScore] = useState('');
  const [architectureScore, setArchitectureScore] = useState('');
  const [clientReadinessScore, setClientReadinessScore] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [evaluatorComments, setEvaluatorComments] = useState('');
  const [aiEvaluationSummary, setAiEvaluationSummary] = useState('');
  const [evaluationFileUrl, setEvaluationFileUrl] = useState('');
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [extractHint, setExtractHint] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  const records = useMemo(() => data?.data ?? [], [data]);

  const candidateOptions = useMemo(
    () =>
      (candidatesData?.data ?? []).map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
      })),
    [candidatesData],
  );

  const candidateNames = useMemo(
    () => [...new Set(records.map((r) => r.candidateName))].sort(),
    [records],
  );

  const evaluatorNames = useMemo(
    () => [...new Set(records.map((r) => r.evaluatorName))].sort(),
    [records],
  );

  const evaluationTypeOptions = useMemo(
    () =>
      [...new Set(records.map((r) => r.evaluationType).filter(Boolean) as string[])].sort(),
    [records],
  );

  const recommendationOptions = useMemo(
    () =>
      [...new Set(records.map((r) => r.recommendation).filter(Boolean) as string[])].sort(),
    [records],
  );

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.candidate !== 'all') {
      rows = rows.filter((r) => r.candidateName === filters.candidate);
    }
    if (filters.evaluator !== 'all') {
      rows = rows.filter((r) => r.evaluatorName === filters.evaluator);
    }
    if (filters.evaluationType !== 'all') {
      rows = rows.filter((r) => r.evaluationType === filters.evaluationType);
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

  const resetCreateForm = useCallback(() => {
    setSelectedCandidateId('');
    setEvaluatorName('');
    setEvaluatorCompany('');
    setEvaluationType('');
    setEvaluationDate('');
    setTechnicalScore('');
    setCommunicationScore('');
    setProblemSolvingScore('');
    setArchitectureScore('');
    setClientReadinessScore('');
    setRecommendation('');
    setEvaluatorComments('');
    setAiEvaluationSummary('');
    setEvaluationFileUrl('');
    setExtractHint(null);
    setExtractError(null);
  }, []);

  const applyExtractedFields = useCallback(
    (patch: ReturnType<typeof mapEvaluationExtractionToForm>, message: string) => {
      if (patch.evaluatorName) setEvaluatorName(patch.evaluatorName);
      if (patch.evaluatorCompany) setEvaluatorCompany(patch.evaluatorCompany);
      if (patch.evaluationType) setEvaluationType(patch.evaluationType);
      if (patch.evaluationDate) setEvaluationDate(patch.evaluationDate);
      if (patch.technicalScore != null) setTechnicalScore(String(patch.technicalScore));
      if (patch.communicationScore != null) {
        setCommunicationScore(String(patch.communicationScore));
      }
      if (patch.problemSolvingScore != null) {
        setProblemSolvingScore(String(patch.problemSolvingScore));
      }
      if (patch.architectureScore != null) setArchitectureScore(String(patch.architectureScore));
      if (patch.clientReadinessScore != null) {
        setClientReadinessScore(String(patch.clientReadinessScore));
      }
      if (patch.recommendation) setRecommendation(patch.recommendation);
      if (patch.evaluatorComments) setEvaluatorComments(patch.evaluatorComments);
      if (patch.aiEvaluationSummary) setAiEvaluationSummary(patch.aiEvaluationSummary);
      if (patch.evaluationFileUrl) setEvaluationFileUrl(patch.evaluationFileUrl);
      setExtractHint(message);
      setExtractError(null);
    },
    [],
  );

  const handlePdfUpload = useCallback(
    async (file: File) => {
      const candidateId = Number(selectedCandidateId);
      if (!candidateId) {
        setExtractError('Select a candidate before uploading the evaluation PDF.');
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['pdf', 'doc', 'docx'].includes(ext)) {
        setExtractError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
        return;
      }

      setExtractingPdf(true);
      setExtractError(null);
      setExtractHint(null);

      try {
        const extraction = await extractEvaluationFromFile(file, candidateId);
        const patch = mapEvaluationExtractionToForm(extraction, file.name);
        if (!patch.aiEvaluationSummary) {
          throw new Error('AI did not return an evaluation summary for this document.');
        }

        const confidence = Math.round(extraction.confidence * 100);
        const warningNote =
          extraction.warnings.length > 0 ? ` ${extraction.warnings[0]}` : '';

        applyExtractedFields(
          patch,
          `Evaluation extracted (${confidence}% confidence). Review fields, then save to update BesTal score and notify your team.${warningNote}`,
        );
      } catch (err) {
        setExtractError(err instanceof Error ? err.message : 'Evaluation extraction failed');
      } finally {
        setExtractingPdf(false);
      }
    },
    [applyExtractedFields, selectedCandidateId],
  );

  const handleCreate = useCallback(async () => {
    const candidateId = Number(selectedCandidateId);
    const name = evaluatorName.trim();
    if (!candidateId) {
      show('Select a candidate');
      return;
    }
    if (!name) {
      show('Enter evaluator name');
      return;
    }

    try {
      await mutations.create.mutateAsync({
        candidateId,
        evaluatorName: name,
        evaluatorCompany: evaluatorCompany.trim() || undefined,
        evaluationType: evaluationType || undefined,
        evaluationDate: evaluationDate || undefined,
        technicalScore: parseOptionalScore(technicalScore),
        communicationScore: parseOptionalScore(communicationScore),
        problemSolvingScore: parseOptionalScore(problemSolvingScore),
        architectureScore: parseOptionalScore(architectureScore),
        clientReadinessScore: parseOptionalScore(clientReadinessScore),
        recommendation: recommendation.trim() || undefined,
        evaluatorComments: evaluatorComments.trim() || undefined,
        aiEvaluationSummary: aiEvaluationSummary.trim() || undefined,
        evaluationFileUrl: evaluationFileUrl.trim() || undefined,
      });
      const candidate = candidateOptions.find((c) => c.id === candidateId);
      const suffix = aiEvaluationSummary.trim()
        ? ' BesTal score recalculated and team notified.'
        : '';
      show(`Evaluation created — ${candidate?.name ?? 'candidate'}.${suffix}`);
      setCreateOpen(false);
      resetCreateForm();
    } catch (err) {
      show(err instanceof Error ? err.message : 'Create failed');
    }
  }, [
    aiEvaluationSummary,
    evaluationFileUrl,
    architectureScore,
    candidateOptions,
    clientReadinessScore,
    communicationScore,
    evaluationDate,
    evaluationType,
    evaluatorComments,
    evaluatorCompany,
    evaluatorName,
    mutations.create,
    problemSolvingScore,
    recommendation,
    resetCreateForm,
    selectedCandidateId,
    show,
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
        accessorKey: 'evaluationType',
        header: 'Type',
        cell: ({ getValue }) => {
          const val = getValue() as string | null | undefined;
          return val ? (
            <span>{val}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'evaluationDate',
        header: 'Date',
        cell: ({ getValue }) => {
          const val = getValue() as string | null | undefined;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
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
        accessorKey: 'technicalScore',
        header: 'Technical',
        cell: ({ getValue }) => <ScoreCell value={getValue() as number | null} />,
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
              resetCreateForm();
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
          searchPlaceholder="Search by candidate, evaluator, or type…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
          filters={
            <ListingFiltersRow onClear={() => setFilters(defaultFilters)}>
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
                label="TYPE"
                value={filters.evaluationType}
                onChange={(v) => updateFilter('evaluationType', v)}
                options={[
                  { value: 'all', label: 'All types' },
                  ...evaluationTypeOptions.map((t) => ({
                    value: t,
                    label: t,
                  })),
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
                    label: r,
                  })),
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [
              r.candidateName,
              r.evaluatorName,
              r.evaluationType,
              r.recommendation,
            ].some((field) => String(field ?? '').toLowerCase().includes(q));
          }}
        />
      </ListingPageShell>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add evaluation"
        description="Upload a PDF to auto-fill scores, or enter details manually."
        scrollable
        className="max-w-2xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleCreate()} disabled={extractingPdf}>
              Create evaluation
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p>
                {import.meta.env.VITE_AI_EVALUATION_URL
                  ? 'Connected to the AI evaluation service. Upload a PDF to extract scores and summary.'
                  : 'Demo extraction is active. Set VITE_AI_EVALUATION_URL for live AI processing.'}
              </p>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Candidate & document</h3>
            <div className="space-y-2">
              <label htmlFor="eval-candidate" className="text-sm font-medium">
                Candidate *
              </label>
              <Select
                id="eval-candidate"
                className="h-10"
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

            <FileUpload
              label="Upload evaluation PDF"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint={
                extractingPdf
                  ? 'Extracting text and generating AI summary…'
                  : 'PDF or Word · select candidate first'
              }
              onFileSelect={(file) => {
                if (!extractingPdf) void handlePdfUpload(file);
              }}
            />
            {extractingPdf && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                Processing evaluation document…
              </div>
            )}
            {extractHint && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {extractHint}
              </div>
            )}
            {extractError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{extractError}</span>
              </div>
            )}
          </section>

          <section className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground">Evaluator details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="eval-evaluator-name" className="text-sm font-medium">
                  Evaluator name *
                </label>
                <Input
                  id="eval-evaluator-name"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  placeholder="External evaluator name"
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
              <div className="space-y-2">
                <label htmlFor="eval-type" className="text-sm font-medium">
                  Evaluation type
                </label>
                <Select
                  id="eval-type"
                  className="h-10"
                  value={evaluationType}
                  onChange={(e) => setEvaluationType(e.target.value)}
                >
                  <option value="">— Select —</option>
                  {EVALUATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="eval-date" className="text-sm font-medium">
                  Evaluation date
                </label>
                <Input
                  id="eval-date"
                  type="date"
                  value={evaluationDate}
                  onChange={(e) => setEvaluationDate(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="eval-recommendation" className="text-sm font-medium">
                  Recommendation
                </label>
                <Select
                  id="eval-recommendation"
                  className="h-10"
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                >
                  <option value="">— Select —</option>
                  {EVALUATION_RECOMMENDATIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground">Scores</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['eval-technical-score', 'Technical score', technicalScore, setTechnicalScore],
                  ['eval-communication-score', 'Communication score', communicationScore, setCommunicationScore],
                  ['eval-problem-solving-score', 'Problem solving score', problemSolvingScore, setProblemSolvingScore],
                  ['eval-architecture-score', 'Architecture score', architectureScore, setArchitectureScore],
                  ['eval-client-readiness-score', 'Client readiness score', clientReadinessScore, setClientReadinessScore],
                ] as const
              ).map(([id, label, value, setter]) => (
                <div key={id} className="space-y-2">
                  <label htmlFor={id} className="text-sm font-medium">
                    {label}
                  </label>
                  <Input
                    id={id}
                    type="number"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground">Comments & summary</h3>
            <div className="space-y-2">
              <label htmlFor="eval-comments" className="text-sm font-medium">
                Evaluator comments
              </label>
              <textarea
                id="eval-comments"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={evaluatorComments}
                onChange={(e) => setEvaluatorComments(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="eval-ai-summary" className="text-sm font-medium">
                AI evaluation summary
              </label>
              <textarea
                id="eval-ai-summary"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={aiEvaluationSummary}
                onChange={(e) => setAiEvaluationSummary(e.target.value)}
              />
            </div>
          </section>
        </div>
      </Dialog>
    </>
  );
}
