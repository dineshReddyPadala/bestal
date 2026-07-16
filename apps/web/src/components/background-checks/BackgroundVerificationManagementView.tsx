import { cn, formatDate } from '@bestal/shared-utils';
import { Button, Dialog, FileUpload, Input, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Check, Eye, Loader2, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import {
  useBackgroundCheckMutations,
  useBackgroundChecksList,
} from '../../hooks/api/useEvaluations';
import { usePermissions } from '../../hooks/usePermissions';
import { getApiErrorMessage } from '../../lib/api/errors';
import { backgroundChecksApi } from '../../lib/api/evaluations';
import type { BackgroundCheckDto, BackgroundCheckListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';
import { buildBgvAiDummyJson, withBgvAiDummy } from './bgv-ai-dummy';
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
  const { data, isLoading, isError, error } = useBackgroundChecksList({
    limit: 100,
    sort: '-createdAt',
  });
  const { data: candidatesData } = useCandidatesList({ limit: 100 });
  const mutations = useBackgroundCheckMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedType, setSelectedType] = useState<string>('COMPREHENSIVE');
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
        // Seed local placeholder AI JSON when report exists (do not call extract-ai).
        applyDetail(
          next.hasReportDocument &&
            next.status !== 'CONSIDER' &&
            next.status !== 'CLEAR' &&
            next.status !== 'FAILED'
            ? withBgvAiDummy(next)
            : next,
          { resetLocalFields: true },
        );
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
      });
      show(`BGV requested — ${created.candidateName}`);
      setRequestOpen(false);
      setSelectedCandidateId('');
      setSelectedType('COMPREHENSIVE');
      applyDetail(created, { resetLocalFields: true });
    } catch (err) {
      showError(getApiErrorMessage(err, 'Request failed'));
    }
  }, [applyDetail, mutations.create, selectedCandidateId, selectedType, show, showError]);

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
        actions={
          canUploadBgv ? (
            <Button size="sm" onClick={() => setRequestOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Request BGV
            </Button>
          ) : null
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
          <p className="text-sm text-muted-foreground">
            Candidate must be Evaluation Complete. After create: Consent → Docs → Vendor → Start →
            Report → AI (placeholder JSON) → Submit.
          </p>
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
                          const uploaded = await mutations.uploadDocument.mutateAsync({
                            id: detail.id,
                            kind: 'REPORT',
                            file,
                          });
                          // BGV AI API is not ready — do not call extract-ai; use local dummy JSON.
                          return withBgvAiDummy(uploaded);
                        }, 'Report uploaded — AI summary ready for review')
                      }
                    />
                  </>
                )}

                {currentStep === 'ai' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold">6. AI extraction</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        BGV AI API is not ready — showing local placeholder JSON (extract-ai is not
                        called). Review it, then submit for admin review.
                      </p>
                    </div>
                    <pre className="max-h-64 overflow-auto rounded-lg border border-border/70 bg-background p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                      {detail.aiSummary?.trim() || buildBgvAiDummyJson(detail)}
                    </pre>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          // Keep placeholder in local state for the UI; do not call extract-ai.
                          if (!detail.aiSummary?.trim()) {
                            applyDetail(withBgvAiDummy(detail));
                          }
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
                        disabled={busy}
                        onClick={() => {
                          applyDetail(withBgvAiDummy({ ...detail, aiSummary: null }));
                          show('AI summary refreshed (local placeholder)');
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
