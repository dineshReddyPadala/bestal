import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, FileUpload, Input, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Plus } from 'lucide-react';
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

  const applyDetail = useCallback((data: BackgroundCheckDto, options?: { resetLocalFields?: boolean }) => {
    setDetail(data);
    // Only seed inputs when first opening — avoid wiping vendor name mid-edit after uploads.
    if (options?.resetLocalFields) {
      setVendorName(data.provider ?? '');
      setReviewNotes(data.reviewNotes ?? '');
    } else if (data.provider) {
      setVendorName((current) => current.trim() || data.provider || '');
    }
  }, []);

  const openDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const data = await backgroundChecksApi.get(id);
      applyDetail(data, { resetLocalFields: true });
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to load verification'));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [applyDetail, showError]);

  const run = useCallback(
    async (action: () => Promise<BackgroundCheckDto | unknown>, success: string) => {
      setBusy(true);
      try {
        const result = await action();
        show(success);
        // Prefer mutation response — no loading flash / dialog remount.
        if (result && typeof result === 'object' && 'id' in result && 'status' in result) {
          applyDetail(result as BackgroundCheckDto);
        } else if (detail) {
          const data = await backgroundChecksApi.get(detail.id);
          applyDetail(data);
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
      await mutations.create.mutateAsync({
        candidateId,
        type: selectedType,
      });
      const candidate = candidateOptions.find((c) => c.id === candidateId);
      show(`BGV requested — ${candidate?.name ?? 'candidate'} (${selectedType})`);
      setRequestOpen(false);
      setSelectedCandidateId('');
      setSelectedType('COMPREHENSIVE');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Request failed'));
    }
  }, [candidateOptions, mutations.create, selectedCandidateId, selectedType, show, showError]);

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
          <p className="text-sm text-muted-foreground">
            Candidates must be in Evaluation Complete before BGV can start.
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
        onClose={() => setDetail(null)}
        title={detail ? `BGV — ${detail.candidateName}` : 'Background verification'}
        className="max-w-2xl"
      >
        {detailLoading || !detail ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              {detail.type ? <StatusBadge status={detail.type} /> : null}
              {detail.provider ? (
                <span className="text-sm text-muted-foreground">Vendor: {detail.provider}</span>
              ) : null}
            </div>

            <section className="space-y-2 rounded-lg border border-border/70 p-3">
              <h3 className="text-sm font-semibold">Progress</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Consent: {detail.consentConfirmedAt ? `Confirmed ${formatDate(detail.consentConfirmedAt)}` : 'Pending'}</li>
                <li>Vendor: {detail.provider || 'Not assigned'}</li>
                <li>Supporting docs: {detail.supportingDocumentCount ?? 0}</li>
                <li>Report: {detail.hasReportDocument ? 'Uploaded' : 'Missing'}</li>
                <li>Completed: {detail.completedAt ? formatDate(detail.completedAt) : '—'}</li>
              </ul>
            </section>

            {detail.aiSummary ? (
              <section className="space-y-2 rounded-lg border border-border/70 p-3">
                <h3 className="text-sm font-semibold">AI summary</h3>
                <p className="text-sm text-muted-foreground">{detail.aiSummary}</p>
              </section>
            ) : null}

            {detail.reviewNotes ? (
              <section className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <h3 className="text-sm font-semibold text-amber-900">Admin notes</h3>
                <p className="text-sm text-amber-900">{detail.reviewNotes}</p>
              </section>
            ) : null}

            {canUploadBgv ? (
              <section className="space-y-3 rounded-lg border border-border/70 p-3">
                <h3 className="text-sm font-semibold">Recruiter actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || Boolean(detail.consentConfirmedAt)}
                    onClick={() =>
                      void run(
                        () => mutations.confirmConsent.mutateAsync(detail.id),
                        'Consent confirmed',
                      )
                    }
                  >
                    Confirm consent
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || !detail.consentConfirmedAt || !vendorName.trim()}
                    onClick={() =>
                      void run(
                        () =>
                          mutations.assignVendor.mutateAsync({
                            id: detail.id,
                            provider: vendorName.trim(),
                          }),
                        'Vendor assigned',
                      )
                    }
                  >
                    Assign vendor
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || !detail.provider || detail.status === 'IN_PROGRESS'}
                    onClick={() =>
                      void run(
                        () => mutations.startVerification.mutateAsync(detail.id),
                        'Verification started',
                      )
                    }
                  >
                    Start verification
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || !detail.hasReportDocument}
                    onClick={() =>
                      void run(
                        () => mutations.extractAi.mutateAsync(detail.id),
                        'AI extraction complete',
                      )
                    }
                  >
                    Run AI extraction
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy || !detail.aiSummary}
                    onClick={() =>
                      void run(
                        () => mutations.submitForReview.mutateAsync(detail.id),
                        'Submitted for admin review',
                      )
                    }
                  >
                    Submit for review
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vendor name</label>
                    <Input
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      placeholder="e.g. Checkr"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <FileUpload
                    label="Consent form"
                    accept=".pdf,.doc,.docx"
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
                  <FileUpload
                    label="Supporting doc"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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
                  <FileUpload
                    label="Final report"
                    accept=".pdf,.doc,.docx"
                    onFileSelect={(file) =>
                      void run(
                        () =>
                          mutations.uploadDocument.mutateAsync({
                            id: detail.id,
                            kind: 'REPORT',
                            file,
                          }),
                        'Final report uploaded',
                      )
                    }
                  />
                </div>
              </section>
            ) : null}

            {canApproveBgv ? (
              <section className="space-y-3 rounded-lg border border-border/70 p-3">
                <h3 className="text-sm font-semibold">Admin review</h3>
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
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => mutations.approve.mutateAsync(detail.id),
                        'Verification approved — candidate marked Background Verified',
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
                </div>
              </section>
            ) : null}

            {!canUploadBgv && !canApproveBgv ? (
              <p className="text-sm text-muted-foreground">
                Sales view: status, vendor, completion date, and AI summary only.
              </p>
            ) : null}
          </div>
        )}
      </Dialog>
    </>
  );
}
