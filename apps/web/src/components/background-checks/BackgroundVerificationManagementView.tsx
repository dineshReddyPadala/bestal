import { cn, formatDate } from '@bestal/shared-utils';
import { Button, Dialog, FileUpload, Input, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { AlertCircle, Check, Eye, Loader2, Plus, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import {
  useBackgroundCheckMutations,
  useBackgroundChecksList,
} from '../../hooks/api/useEvaluations';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { usePermissions } from '../../hooks/usePermissions';
import { mapBgvExtractionToForm } from '../../lib/api/ai/bgv-extraction.mapper';
import { getApiErrorMessage } from '../../lib/api/errors';
import { backgroundChecksApi } from '../../lib/api/evaluations';
import type { BackgroundCheckDto, BackgroundCheckListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';
import {
  BGV_RECRUITER_STEPS,
  bgvStepIndex,
  getBgvRecruiterStep,
  isBgvStepComplete,
  type BgvRecruiterStepId,
} from './bgv-workflow-steps';

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

function StepRail({
  detail,
  currentStep,
}: {
  detail: BackgroundCheckDto;
  currentStep: BgvRecruiterStepId;
}) {
  const currentIdx = bgvStepIndex(currentStep);
  return (
    <ol className="flex flex-wrap gap-1.5">
      {BGV_RECRUITER_STEPS.map((step, idx) => {
        const done = isBgvStepComplete(detail, step.id);
        const active = step.id === currentStep;
        return (
          <li
            key={step.id}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
              done && !active && 'border-emerald-200 bg-emerald-50 text-emerald-800',
              active && 'border-brand/40 bg-brand/10 text-foreground',
              !done && !active && 'border-border bg-muted/40 text-muted-foreground',
              idx > currentIdx && !done && 'opacity-70',
            )}
          >
            {done && !active ? <Check className="h-3 w-3" /> : <span>{idx + 1}.</span>}
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

export function BackgroundVerificationManagementView({
  title = 'Background Verification Management',
}: BackgroundVerificationManagementViewProps) {
  const { message, show, showError } = useDemoToast();
  const { canUploadBgv, canApproveBgv } = usePermissions();
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const { data, isLoading, isError, error } = useBackgroundChecksList({
    limit: 100,
    sort: '-createdAt',
    ...searchParam,
  });
  const { data: candidatesData } = useCandidatesList({ limit: 100 });
  const mutations = useBackgroundCheckMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedType, setSelectedType] = useState<string>('COMPREHENSIVE');
  const [requestVendorName, setRequestVendorName] = useState('');
  const [aiBgvSummary, setAiBgvSummary] = useState('');
  const [concernNotes, setConcernNotes] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [extractHint, setExtractHint] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pendingReportFile, setPendingReportFile] = useState<File | null>(null);
  const [detail, setDetail] = useState<BackgroundCheckDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const records = useMemo(() => data?.data ?? [], [data]);

  const candidateOptions = useMemo(
    () =>
      (candidatesData?.data ?? [])
        .filter((c) => c.profileStatus === 'EVALUATION_COMPLETE')
        .map((c) => ({
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
    if (filters.status !== 'all') rows = rows.filter((r) => r.status === filters.status);
    if (filters.type !== 'all') rows = rows.filter((r) => r.type === filters.type);
    rows.sort((a, b) => {
      const aTime = new Date(a.initiatedAt ?? a.requestedAt ?? a.createdAt).getTime() || 0;
      const bTime = new Date(b.initiatedAt ?? b.requestedAt ?? b.createdAt).getTime() || 0;
      return bTime - aTime;
    });
    return rows;
  }, [records, filters]);

  const currentStep = detail ? getBgvRecruiterStep(detail) : 'consent';
  const awaitingAdmin = Boolean(
    detail &&
      (detail.status === 'CONSIDER' || detail.status === 'CLEAR' || detail.status === 'FAILED'),
  );
  const applyDetail = useCallback(
    (next: BackgroundCheckDto, options?: { resetLocalFields?: boolean }) => {
      setDetail(next);
      if (options?.resetLocalFields) {
        setVendorName(next.provider ?? '');
        setReviewNotes(next.reviewNotes ?? '');
      } else if (next.provider) {
        setVendorName((current) => current.trim() || next.provider || '');
      }
    },
    [],
  );

  const openDetail = useCallback(
    async (id: number) => {
      setDetailLoading(true);
      try {
        const next = await backgroundChecksApi.get(id);
        applyDetail(next, { resetLocalFields: true });
      } catch (err) {
        showError(getApiErrorMessage(err, 'Failed to load verification'));
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [applyDetail, showError],
  );

  const run = useCallback(
    async (action: () => Promise<BackgroundCheckDto | unknown>, success: string) => {
      setBusy(true);
      try {
        const result = await action();
        show(success);
        if (result && typeof result === 'object' && 'id' in result && 'status' in result) {
          applyDetail(result as BackgroundCheckDto);
        } else if (detail) {
          applyDetail(await backgroundChecksApi.get(detail.id));
        }
      } catch (err) {
        showError(getApiErrorMessage(err, 'Action failed'));
      } finally {
        setBusy(false);
      }
    },
    [applyDetail, detail, show, showError],
  );

  const resetRequestForm = useCallback(() => {
    setSelectedCandidateId('');
    setSelectedType('COMPREHENSIVE');
    setRequestVendorName('');
    setAiBgvSummary('');
    setConcernNotes('');
    setResultSummary('');
    setExtractHint(null);
    setExtractError(null);
    setPendingReportFile(null);
  }, []);

  const handleBgvPdfUpload = useCallback(
    async (file: File) => {
      const candidateId = Number(selectedCandidateId);
      if (!candidateId) {
        setExtractError('Select a candidate before uploading the BGV report.');
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
      setPendingReportFile(file);

      try {
        const { extraction, liveAi } = await backgroundChecksApi.extractBgv(file, candidateId);
        const patch = mapBgvExtractionToForm(extraction);
        if (!patch.aiBgvSummary) {
          throw new Error('AI did not return a background verification summary.');
        }

        if (patch.vendorName) setRequestVendorName(patch.vendorName);
        if (patch.checkType) setSelectedType(patch.checkType);
        if (patch.aiBgvSummary) setAiBgvSummary(patch.aiBgvSummary);
        if (patch.concernNotes) setConcernNotes(patch.concernNotes);
        if (patch.resultSummary) setResultSummary(patch.resultSummary);

        const confidence = Math.round(extraction.confidence * 100);
        const warningNote =
          extraction.warnings.length > 0 ? ` ${extraction.warnings[0]}` : '';
        const modeNote = liveAi ? '' : ' (demo/static AI — set AI_BGV_URL on the API)';

        setExtractHint(
          `BGV extracted (${confidence}% confidence)${modeNote}. Review fields, then Request BGV.${warningNote}`,
        );
      } catch (err) {
        setExtractError(getApiErrorMessage(err, 'BGV extraction failed'));
        setPendingReportFile(null);
      } finally {
        setExtractingPdf(false);
      }
    },
    [selectedCandidateId],
  );

  const handleRequest = useCallback(async () => {
    const candidateId = Number(selectedCandidateId);
    if (!candidateId) {
      show('Select a candidate');
      return;
    }
    try {
      const created = await mutations.create.mutateAsync({
        candidateId,
        type: selectedType,
        ...(requestVendorName.trim() ? { provider: requestVendorName.trim() } : {}),
        ...(resultSummary.trim() ? { resultSummary: resultSummary.trim() } : {}),
        ...(aiBgvSummary.trim() ? { aiSummary: aiBgvSummary.trim() } : {}),
        ...(concernNotes.trim() ? { reviewNotes: concernNotes.trim() } : {}),
      });

      if (pendingReportFile) {
        try {
          await backgroundChecksApi.uploadDocument(created.id, 'REPORT', pendingReportFile);
        } catch {
          // Report upload is optional after create; workflow can upload later.
        }
      }

      show(`BGV requested — ${created.candidateName}`);
      setRequestOpen(false);
      resetRequestForm();
      applyDetail(await backgroundChecksApi.get(created.id), { resetLocalFields: true });
    } catch (err) {
      showError(getApiErrorMessage(err, 'Request failed'));
    }
  }, [
    aiBgvSummary,
    applyDetail,
    concernNotes,
    mutations.create,
    pendingReportFile,
    requestVendorName,
    resetRequestForm,
    resultSummary,
    selectedCandidateId,
    selectedType,
    show,
    showError,
  ]);

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
        cell: ({ row }) => <span>{row.original.provider ?? row.original.vendor ?? '—'}</span>,
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
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void openDetail(row.original.id)}
          >
            <Eye className="mr-1 h-3.5 w-3.5" />
            Open
          </Button>
        ),
      },
    ],
    [openDetail],
  );

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
      >
        <TanStackDataTable
          key={search}
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate or provider…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
          toolbar={
            canUploadBgv ? (
              <Button size="sm" onClick={() => setRequestOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Request BGV
              </Button>
            ) : undefined
          }
          filters={
            <ListingFiltersRow>
              <ListingFilterSelect
                label="STATUS"
                value={filters.status}
                onChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                options={[
                  { value: 'all', label: 'All statuses' },
                  ...statusOptions.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })),
                ]}
              />
              <ListingFilterSelect
                label="TYPE"
                value={filters.type}
                onChange={(v) => setFilters((prev) => ({ ...prev, type: v }))}
                options={[
                  { value: 'all', label: 'All types' },
                  ...typeOptions.map((t) => ({ value: t, label: t.replace(/_/g, ' ') })),
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [r.candidateName, r.provider ?? r.vendor, r.status, r.type].some((field) =>
              String(field ?? '').toLowerCase().includes(q),
            );
          }}
        />
      </ListingPageShell>

      <Dialog
        open={requestOpen}
        onClose={() => {
          if (extractingPdf) return;
          setRequestOpen(false);
        }}
        title="Request background verification"
        description="Upload a BGV PDF to auto-fill vendor and summary, or enter details manually."
        scrollable
        className="max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequestOpen(false)}
              disabled={extractingPdf}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleRequest()} disabled={extractingPdf}>
              Request BGV
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p>
                Upload a PDF/Word BGV report. The BesTal API calls Python{' '}
                <code className="rounded bg-white/80 px-1">ai-service</code> when{' '}
                <code className="rounded bg-white/80 px-1">AI_BGV_URL</code> is configured;
                otherwise a demo extraction is returned.
              </p>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Candidate & document</h3>
            <div className="space-y-2">
              <label htmlFor="bgv-candidate" className="text-sm font-medium">
                Candidate *
              </label>
              <Select
                id="bgv-candidate"
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
              label="Upload BGV report PDF"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              hint={
                extractingPdf
                  ? 'Extracting BGV fields via AI…'
                  : 'PDF or Word · select candidate first'
              }
              onFileSelect={(file) => {
                if (!extractingPdf) void handleBgvPdfUpload(file);
              }}
            />
            {extractingPdf && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-brand" />
                Processing background verification document…
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
            <h3 className="text-sm font-semibold text-foreground">BGV details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="bgv-type" className="text-sm font-medium">
                  Check type *
                </label>
                <Select
                  id="bgv-type"
                  className="h-10"
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
              <div className="space-y-2">
                <label htmlFor="bgv-vendor" className="text-sm font-medium">
                  Vendor name
                </label>
                <Input
                  id="bgv-vendor"
                  value={requestVendorName}
                  onChange={(e) => setRequestVendorName(e.target.value)}
                  placeholder="e.g. VerifyCorp Screening"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="bgv-result-summary" className="text-sm font-medium">
                Check statuses summary
              </label>
              <textarea
                id="bgv-result-summary"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                placeholder="Per-check statuses from AI extraction"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bgv-ai-summary" className="text-sm font-medium">
                AI BGV summary
              </label>
              <textarea
                id="bgv-ai-summary"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={aiBgvSummary}
                onChange={(e) => setAiBgvSummary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="bgv-concerns" className="text-sm font-medium">
                Concern notes
              </label>
              <textarea
                id="bgv-concerns"
                rows={2}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={concernNotes}
                onChange={(e) => setConcernNotes(e.target.value)}
              />
            </div>
          </section>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(detail) || detailLoading}
        onClose={() => {
          if (busy) return;
          setDetail(null);
        }}
        title={detail ? `BGV — ${detail.candidateName}` : 'Background verification'}
        className="max-w-2xl"
      >
        {detailLoading || !detail ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              {detail.type ? <StatusBadge status={detail.type} /> : null}
            </div>

            {(canUploadBgv || canApproveBgv) && (
              <StepRail detail={detail} currentStep={currentStep} />
            )}

            {canUploadBgv && !awaitingAdmin ? (
              <section className="space-y-4 rounded-xl border border-border/80 bg-muted/10 p-4">
                {currentStep === 'consent' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">1. Confirm candidate consent</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Confirm consent first. Optionally upload a signed consent form.
                      </p>
                    </div>
                    <FileUpload
                      key="consent-upload"
                      label="Consent form (optional)"
                      accept=".pdf,.doc,.docx"
                      hint="PDF or Word"
                      onFileSelect={(file) =>
                        void run(
                          () =>
                            mutations.uploadDocument.mutateAsync({
                              id: detail.id,
                              kind: 'CONSENT',
                              file,
                            }),
                          'Consent document uploaded',
                        )
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => mutations.confirmConsent.mutateAsync(detail.id),
                          'Consent confirmed — continue to Docs',
                        )
                      }
                    >
                      {busy ? 'Working…' : 'Confirm consent'}
                    </Button>
                  </>
                )}

                {currentStep === 'docs' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">2. Upload supporting documents</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Upload at least one supporting document to unlock Vendor.
                        {' '}Currently: {detail.supportingDocumentCount ?? 0}
                      </p>
                    </div>
                    <FileUpload
                      key="supporting-upload"
                      label="Supporting document"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      hint="PDF, Word, or image"
                      onFileSelect={(file) =>
                        void run(
                          () =>
                            mutations.uploadDocument.mutateAsync({
                              id: detail.id,
                              kind: 'SUPPORTING',
                              file,
                            }),
                          'Supporting document uploaded',
                        )
                      }
                    />
                  </>
                )}

                {currentStep === 'vendor' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">3. Assign verification vendor</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Choose the vendor that will run the background check.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="bgv-vendor">
                        Vendor name *
                      </label>
                      <Input
                        id="bgv-vendor"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="e.g. Checkr, Sterling"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy || !vendorName.trim()}
                      onClick={() =>
                        void run(
                          () =>
                            mutations.assignVendor.mutateAsync({
                              id: detail.id,
                              provider: vendorName.trim(),
                            }),
                          'Vendor assigned — continue to Start',
                        )
                      }
                    >
                      {busy ? 'Working…' : 'Assign vendor'}
                    </Button>
                  </>
                )}

                {currentStep === 'start' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">4. Start verification</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Vendor <strong>{detail.provider}</strong> is assigned. Mark verification in
                        progress.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => mutations.startVerification.mutateAsync(detail.id),
                          'Verification started — upload the final report next',
                        )
                      }
                    >
                      {busy ? 'Working…' : 'Start verification'}
                    </Button>
                  </>
                )}

                {currentStep === 'report' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">5. Upload final BGV report</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Upload the vendor’s final report after verification completes.
                      </p>
                    </div>
                    <FileUpload
                      key="report-upload"
                      label="Final BGV report"
                      accept=".pdf,.doc,.docx"
                      hint="PDF or Word"
                      onFileSelect={(file) =>
                        void run(async () => {
                          return mutations.uploadDocument.mutateAsync({
                            id: detail.id,
                            kind: 'REPORT',
                            file,
                          });
                        }, 'Report uploaded — AI extraction started')
                      }
                    />
                  </>
                )}

                {currentStep === 'ai' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">6. AI extraction</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Review the AI summary from the final BGV report, then submit for admin
                        review. Use refresh to re-run extraction if needed.
                      </p>
                    </div>
                    <pre className="max-h-64 overflow-auto rounded-lg border border-border/70 bg-background p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                      {detail.aiSummary?.trim() ||
                        'No AI summary yet. Upload a report or click Refresh AI summary.'}
                    </pre>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy || !detail.aiSummary?.trim()}
                        onClick={() => {
                          void run(
                            () => mutations.submitForReview.mutateAsync(detail.id),
                            'Submitted for admin review',
                          );
                        }}
                      >
                        {busy ? 'Working…' : 'Submit for review'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy || !detail.hasReportDocument}
                        onClick={() => {
                          void run(
                            () => mutations.extractAi.mutateAsync(detail.id),
                            'AI summary refreshed',
                          );
                        }}
                      >
                        Refresh AI summary
                      </Button>
                    </div>
                  </>
                )}
              </section>
            ) : null}

            {awaitingAdmin && detail.status === 'CONSIDER' && canUploadBgv && !canApproveBgv ? (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Submitted for admin review. Waiting for approve / reject / clarification.
                {detail.aiSummary ? <p className="mt-2 text-amber-800">{detail.aiSummary}</p> : null}
              </section>
            ) : null}

            {detail.reviewNotes ? (
              <section className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <h3 className="text-sm font-semibold text-amber-900">Admin notes</h3>
                <p className="text-sm text-amber-900">{detail.reviewNotes}</p>
              </section>
            ) : null}

            {canApproveBgv &&
            (detail.status === 'CONSIDER' ||
              detail.status === 'IN_PROGRESS' ||
              detail.status === 'SUSPENDED' ||
              detail.status === 'CLEAR' ||
              detail.status === 'FAILED') ? (
              <section className="space-y-3 rounded-xl border border-border/80 p-4">
                <h3 className="text-sm font-semibold">Admin review</h3>
                {detail.status === 'CLEAR' ? (
                  <p className="text-sm text-emerald-700">
                    Approved — Background Verified
                    {detail.completedAt ? ` on ${formatDate(detail.completedAt)}` : ''}.
                  </p>
                ) : null}
                {detail.status === 'FAILED' ? (
                  <p className="text-sm text-destructive">Verification rejected.</p>
                ) : null}
                {detail.aiSummary ? (
                  <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                    {detail.aiSummary}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Rejection or clarification notes"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(detail.status === 'CONSIDER' || detail.status === 'IN_PROGRESS') && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () => mutations.approve.mutateAsync(detail.id),
                            'Verification approved',
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          void run(
                            () =>
                              mutations.reject.mutateAsync({
                                id: detail.id,
                                notes: reviewNotes || undefined,
                              }),
                            'Verification rejected',
                          )
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy || !reviewNotes.trim()}
                        onClick={() =>
                          void run(
                            () =>
                              mutations.requestClarification.mutateAsync({
                                id: detail.id,
                                notes: reviewNotes.trim(),
                              }),
                            'Clarification requested',
                          )
                        }
                      >
                        Request clarification
                      </Button>
                    </>
                  )}
                  {(detail.status === 'FAILED' ||
                    detail.status === 'SUSPENDED' ||
                    detail.status === 'CLEAR') && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => mutations.reopen.mutateAsync(detail.id),
                          'Verification reopened',
                        )
                      }
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </section>
            ) : null}

            {!canUploadBgv && !canApproveBgv ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Status: <StatusBadge status={detail.status} />
                </p>
                <p>Vendor: {detail.provider || '—'}</p>
                <p>Completed: {detail.completedAt ? formatDate(detail.completedAt) : '—'}</p>
                {detail.aiSummary ? <p>AI summary: {detail.aiSummary}</p> : null}
              </div>
            ) : null}
          </div>
        )}
      </Dialog>
    </>
  );
}
