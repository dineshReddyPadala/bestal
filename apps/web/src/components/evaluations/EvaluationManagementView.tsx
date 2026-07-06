import {
  candidates,
  evaluationCandidates,
  evaluationEvaluators,
  evaluationManagementRecords,
  evaluationRecommendations,
  evaluationStatuses,
  evaluationTypes,
  type EvaluationManagementRecord,
} from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EvaluationForm } from '../forms/EvaluationForm';
import { buildDocumentPayload, buildEvaluationPayload, type EvaluationFormValues } from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

type EvaluationAction =
  | 'Upload'
  | 'Edit'
  | 'AI Summary'
  | 'View Recording'
  | 'Download PDF';

type EvaluationManagementViewProps = {
  title?: string;
  description?: string;
  candidateDetailPath?: (candidateId: number) => string;
};

const defaultFilters = {
  status: 'all',
  type: 'all',
  candidate: 'all',
  evaluator: 'all',
  recommendation: 'all',
  date: 'all',
};

const TODAY = new Date('2026-06-30');

function candidateIdByName(name: string): number {
  const match = candidates.find((c) => `${c.firstName} ${c.lastName}` === name);
  return match?.id ?? 0;
}

function ScoreCell({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return <span className="tabular-nums font-medium">{value}</span>;
}

function EvaluationRowActions({
  record,
  onAction,
}: {
  record: EvaluationManagementRecord;
  onAction: (action: EvaluationAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const actions: {
    label: EvaluationAction;
    icon: React.ReactNode;
    disabled?: boolean;
  }[] = [
    { label: 'Upload', icon: <Upload className="h-3.5 w-3.5" /> },
    { label: 'Edit', icon: <Edit className="h-3.5 w-3.5" /> },
    { label: 'AI Summary', icon: <Sparkles className="h-3.5 w-3.5" /> },
    {
      label: 'View Recording',
      icon: <Video className="h-3.5 w-3.5" />,
      disabled: !record.hasRecording,
    },
    {
      label: 'Download PDF',
      icon: <Download className="h-3.5 w-3.5" />,
      disabled: !record.hasPdf,
    },
  ];

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-medium text-foreground hover:bg-muted"
        onClick={() => setOpen((v) => !v)}
        aria-label="Evaluation actions"
      >
        Actions
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          {actions.map(({ label, icon, disabled }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                if (!disabled) onAction(label);
                setOpen(false);
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvaluationManagementView({
  title = 'Evaluation Management',
  description = 'Technical and behavioral assessments — scores, recordings, and recommendations',
}: EvaluationManagementViewProps) {
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<EvaluationManagementRecord[]>(() => [
    ...evaluationManagementRecords,
  ]);
  const [filters, setFilters] = useState(defaultFilters);
  const [formOpen, setFormOpen] = useState<'add' | 'upload' | 'edit' | null>(null);
  const [activeRecord, setActiveRecord] = useState<EvaluationManagementRecord | null>(null);

  const filteredData = useMemo(() => {
    let rows: EvaluationManagementRecord[] = [...records];

    if (filters.status !== 'all') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.type !== 'all') {
      rows = rows.filter((r) => r.evaluationType === filters.type);
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
    if (filters.date !== 'all') {
      if (filters.date === 'completed') {
        rows = rows.filter((r) => r.evaluatedDate && new Date(r.evaluatedDate) <= TODAY);
      } else if (filters.date === 'upcoming') {
        rows = rows.filter((r) => r.evaluatedDate && new Date(r.evaluatedDate) > TODAY);
      } else if (filters.date === 'unscheduled') {
        rows = rows.filter((r) => !r.evaluatedDate);
      }
    }

    rows.sort((a, b) => {
      const aTime = a.evaluatedDate ? new Date(a.evaluatedDate).getTime() : 0;
      const bTime = b.evaluatedDate ? new Date(b.evaluatedDate).getTime() : 0;
      return bTime - aTime;
    });

    return rows;
  }, [records, filters]);

  const handleAction = useCallback(
    (record: EvaluationManagementRecord, action: EvaluationAction) => {
      if (action === 'Upload') {
        setActiveRecord(record);
        setFormOpen('upload');
        return;
      }
      if (action === 'Edit') {
        setActiveRecord(record);
        setFormOpen('edit');
        return;
      }
      show(`${action} — ${record.candidateName} (${record.evaluatorName}) (demo)`);
    },
    [show],
  );

  const handleFormSubmit = useCallback(
    (values: EvaluationFormValues) => {
      buildEvaluationPayload(
        values,
        activeRecord
          ? {
              id: activeRecord.id,
              candidateId: activeRecord.candidateId,
              status: activeRecord.status,
              hasRecording: activeRecord.hasRecording,
              hasPdf: activeRecord.hasPdf,
            }
          : undefined,
      );

      if (values.pdfFileName) {
        buildDocumentPayload(
          { fileName: values.pdfFileName, kind: 'EVALUATION_FORM' },
          'evaluation',
          activeRecord?.id ?? 0,
        );
      }
      if (values.recordingFileName) {
        buildDocumentPayload(
          { fileName: values.recordingFileName, kind: 'RECORDING' },
          'evaluation',
          activeRecord?.id ?? 0,
        );
      }

      if (formOpen === 'add') {
        const nextId = Math.max(0, ...records.map((r) => r.id)) + 1;
        const evaluatedDateIso = values.evaluatedDate
          ? new Date(`${values.evaluatedDate}T12:00:00`).toISOString()
          : null;
        setRecords((prev) => [
          ...prev,
          {
            id: nextId,
            candidateId: candidateIdByName(values.candidateName),
            candidateName: values.candidateName,
            evaluatorName: values.evaluatorName,
            evaluatedDate: evaluatedDateIso,
            evaluationType: values.evaluationType,
            technicalScore: values.technicalScore ?? null,
            communicationScore: values.communicationScore ?? null,
            architectureScore: values.architectureScore ?? null,
            problemSolvingScore: values.problemSolvingScore ?? null,
            recommendation: values.recommendation ?? null,
            status: 'DRAFT',
            hasRecording: !!values.recordingFileName,
            hasPdf: !!values.pdfFileName,
          },
        ]);
        show(`Evaluation created — ${values.candidateName} (demo)`);
      } else if (formOpen === 'edit' && activeRecord) {
        const evaluatedDateIso = values.evaluatedDate
          ? new Date(`${values.evaluatedDate}T12:00:00`).toISOString()
          : activeRecord.evaluatedDate;
        setRecords((prev) =>
          prev.map((row) =>
            row.id === activeRecord.id
              ? {
                  ...row,
                  candidateName: values.candidateName,
                  evaluatorName: values.evaluatorName,
                  evaluationType: values.evaluationType,
                  evaluatedDate: evaluatedDateIso,
                  technicalScore: values.technicalScore ?? null,
                  communicationScore: values.communicationScore ?? null,
                  architectureScore: values.architectureScore ?? null,
                  problemSolvingScore: values.problemSolvingScore ?? null,
                  recommendation: values.recommendation ?? null,
                  hasRecording: row.hasRecording || !!values.recordingFileName,
                  hasPdf: row.hasPdf || !!values.pdfFileName,
                }
              : row,
          ),
        );
        show(`Evaluation updated — ${values.candidateName} (demo)`);
      } else {
        show(`Documents uploaded — ${values.candidateName || activeRecord?.candidateName} (demo)`);
      }

      setFormOpen(null);
      setActiveRecord(null);
    },
    [activeRecord, formOpen, records, show],
  );

  const columns = useMemo<ColumnDef<EvaluationManagementRecord>[]>(
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
        accessorKey: 'evaluatedDate',
        header: 'Date',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? (
            <span className="text-muted-foreground">{formatDate(val)}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: 'evaluationType',
        header: 'Type',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'technicalScore',
        header: 'Technical',
        cell: ({ getValue }) => <ScoreCell value={getValue() as number | null} />,
      },
      {
        accessorKey: 'communicationScore',
        header: 'Communication',
        cell: ({ getValue }) => <ScoreCell value={getValue() as number | null} />,
      },
      {
        accessorKey: 'architectureScore',
        header: 'Architecture',
        cell: ({ getValue }) => <ScoreCell value={getValue() as number | null} />,
      },
      {
        accessorKey: 'problemSolvingScore',
        header: 'Problem Solving',
        cell: ({ getValue }) => <ScoreCell value={getValue() as number | null} />,
      },
      {
        accessorKey: 'recommendation',
        header: 'Recommendation',
        cell: ({ getValue }) => {
          const val = getValue() as string | null;
          return val ? <StatusBadge status={val} /> : <span className="text-muted-foreground">—</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <EvaluationRowActions
            record={row.original}
            onAction={(action) => handleAction(row.original, action)}
          />
        ),
      },
    ],
    [handleAction],
  );

  const updateFilter = (key: keyof typeof defaultFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button
            onClick={() => {
              setActiveRecord(null);
              setFormOpen('add');
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add evaluation
          </Button>
        }
      />

      {message && (
        <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate, evaluator, or type…"
          pageSize={10}
          stickyHeader
          filters={
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Filters
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  onChange={(v) => updateFilter('status', v)}
                  options={[
                    { value: 'all', label: 'All statuses' },
                    ...evaluationStatuses.map((s) => ({
                      value: s,
                      label: s.replace(/_/g, ' '),
                    })),
                  ]}
                />
                <FilterSelect
                  label="Type"
                  value={filters.type}
                  onChange={(v) => updateFilter('type', v)}
                  options={[
                    { value: 'all', label: 'All types' },
                    ...evaluationTypes.map((t) => ({
                      value: t,
                      label: t.replace(/_/g, ' '),
                    })),
                  ]}
                />
                <FilterSelect
                  label="Date"
                  value={filters.date}
                  onChange={(v) => updateFilter('date', v)}
                  options={[
                    { value: 'all', label: 'All dates' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'unscheduled', label: 'Unscheduled' },
                  ]}
                />
                <FilterSelect
                  label="Candidate"
                  value={filters.candidate}
                  onChange={(v) => updateFilter('candidate', v)}
                  options={[
                    { value: 'all', label: 'All candidates' },
                    ...evaluationCandidates.map((c) => ({ value: c, label: c })),
                  ]}
                />
                <FilterSelect
                  label="Evaluator"
                  value={filters.evaluator}
                  onChange={(v) => updateFilter('evaluator', v)}
                  options={[
                    { value: 'all', label: 'All evaluators' },
                    ...evaluationEvaluators.map((e) => ({ value: e, label: e })),
                  ]}
                />
                <FilterSelect
                  label="Recommendation"
                  value={filters.recommendation}
                  onChange={(v) => updateFilter('recommendation', v)}
                  options={[
                    { value: 'all', label: 'All recommendations' },
                    { value: 'none', label: 'None yet' },
                    ...evaluationRecommendations.map((r) => ({
                      value: r,
                      label: r.replace(/_/g, ' '),
                    })),
                  ]}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)}>
                  Clear filters
                </Button>
              </div>
            </div>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [r.candidateName, r.evaluatorName, r.evaluationType, r.status].some((field) =>
              String(field).toLowerCase().includes(q),
            );
          }}
        />
      </div>

      <Dialog
        open={formOpen !== null}
        onClose={() => {
          setFormOpen(null);
          setActiveRecord(null);
        }}
        title={
          formOpen === 'add'
            ? 'Add evaluation'
            : formOpen === 'upload'
              ? 'Upload documents'
              : 'Edit evaluation'
        }
        scrollable
        className="max-w-3xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormOpen(null);
                setActiveRecord(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="evaluation-mgmt-form"
            >
              {formOpen === 'add'
                ? 'Create evaluation'
                : formOpen === 'upload'
                  ? 'Upload documents'
                  : 'Save evaluation'}
            </Button>
          </>
        }
      >
        <EvaluationForm
          key={activeRecord?.id ?? formOpen ?? 'new'}
          formId="evaluation-mgmt-form"
          showActions={false}
          uploadOnly={formOpen === 'upload'}
          submitLabel={
            formOpen === 'add'
              ? 'Create evaluation'
              : formOpen === 'upload'
                ? 'Upload documents'
                : 'Save evaluation'
          }
          defaultValues={
            activeRecord
              ? {
                  candidateName: activeRecord.candidateName,
                  evaluatorName: activeRecord.evaluatorName,
                  evaluationType: activeRecord.evaluationType,
                  evaluatedDate: activeRecord.evaluatedDate?.slice(0, 10) ?? '',
                  technicalScore: activeRecord.technicalScore ?? undefined,
                  communicationScore: activeRecord.communicationScore ?? undefined,
                  architectureScore: activeRecord.architectureScore ?? undefined,
                  problemSolvingScore: activeRecord.problemSolvingScore ?? undefined,
                  recommendation: activeRecord.recommendation ?? undefined,
                }
              : undefined
          }
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormOpen(null);
            setActiveRecord(null);
          }}
        />
      </Dialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
