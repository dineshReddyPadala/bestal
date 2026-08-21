import { cn } from '@bestal/shared-utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  Dialog,
  useDashboardHeaderLeading,
} from '@bestal/ui';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import {
  candidatesApi,
  type CandidateImportBatch,
  type CandidateImportErrorItem,
  type CandidateImportHistoryItem,
} from '../../lib/api/candidates';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { PaginationMeta } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../ui/ToastHost';

type CandidateImportScreenProps = {
  cancelPath?: string;
  title?: string;
  embedded?: boolean;
  onBack?: () => void;
};

type Tab = 'upload' | 'history';

const ACTIVE_STATUSES = new Set(['QUEUED', 'VALIDATING', 'PROCESSING', 'CONFIRMING']);
const HISTORY_PAGE_SIZE = 8;

function statusBadgeVariant(status: string): 'secondary' | 'destructive' | 'success' | 'warning' {
  const tone = statusTone(status);
  if (tone === 'error') return 'destructive';
  if (tone === 'success') return 'success';
  if (tone === 'warn') return 'warning';
  return 'secondary';
}

function statusTone(status: string): 'default' | 'success' | 'warn' | 'error' {
  if (status === 'COMPLETED') return 'success';
  if (status === 'FAILED' || status === 'EXPIRED') return 'error';
  if (ACTIVE_STATUSES.has(status)) return 'warn';
  return 'default';
}

function SummaryStat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'success' | 'warn' | 'error';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600'
      : tone === 'warn'
        ? 'text-amber-600'
        : tone === 'error'
          ? 'text-red-600'
          : 'text-foreground';

  return (
    <div className="rounded-xl border border-border/60 bg-white px-4 py-3 text-center shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums', toneClass)}>{value}</p>
    </div>
  );
}

function formatWhen(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function HistoryPagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta | null;
  onPageChange: (page: number) => void;
}) {
  const total = meta?.total ?? 0;
  const page = meta?.page ?? 1;
  const limit = meta?.limit ?? HISTORY_PAGE_SIZE;
  const totalPages = Math.max(meta?.totalPages ?? 1, 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="flex shrink-0 items-center justify-between border-t border-border bg-white px-3 py-1.5 text-xs text-muted-foreground">
      <span className="tabular-nums">
        {total === 0
          ? '0 of 0'
          : rangeStart === rangeEnd
            ? `${rangeStart} of ${total}`
            : `${rangeStart}–${rangeEnd} of ${total}`}
      </span>
      <div className="-mr-1 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 px-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 px-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function BatchDetailContent({
  batch,
  failedRows,
  onDownloadSource,
  onDownloadErrors,
}: {
  batch: CandidateImportBatch;
  failedRows: CandidateImportErrorItem[];
  onDownloadSource: () => void;
  onDownloadErrors: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="truncate text-sm font-medium">{batch.fileName}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={statusBadgeVariant(batch.status)}>{batch.status}</Badge>
          <span>By {batch.uploadedBy ?? '—'}</span>
          <span>{formatWhen(batch.createdAt)}</span>
        </div>
        {batch.errorSummary ? (
          <p className="text-sm text-amber-700">{batch.errorSummary}</p>
        ) : null}
      </div>

      {ACTIVE_STATUSES.has(batch.status) ? (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Processing…</span>
            <span>
              {batch.processed} / {batch.total || '—'}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${
                  batch.total > 0
                    ? Math.min(100, Math.round((batch.processed / batch.total) * 100))
                    : 10
                }%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryStat label="Created" value={batch.created} tone="success" />
        <SummaryStat label="Updated" value={batch.updated} />
        <SummaryStat label="Skipped" value={batch.skipped} tone="warn" />
        <SummaryStat label="Failed" value={batch.failed} tone="error" />
      </div>

      <div className="flex flex-wrap gap-2">
        {batch.hasSourceFile ? (
          <Button variant="outline" size="sm" onClick={onDownloadSource}>
            <Download className="mr-2 h-4 w-4" />
            Download uploaded file
          </Button>
        ) : null}
        {batch.hasErrorReport || batch.failed > 0 ? (
          <Button variant="outline" size="sm" onClick={onDownloadErrors}>
            <Download className="mr-2 h-4 w-4" />
            Download error report
          </Button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Failed records</p>
        {failedRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {ACTIVE_STATUSES.has(batch.status)
              ? 'No failures recorded yet.'
              : 'No failed records for this import.'}
          </p>
        ) : (
          <div className="scrollbar-thin max-h-72 min-w-0 overflow-auto rounded-lg border border-border/60">
            <table className="w-full min-w-[520px] caption-bottom text-sm">
              <DataTableHeader>
                <DataTableRow>
                  <DataTableHead className="w-[18%]">Sheet</DataTableHead>
                  <DataTableHead className="w-[10%]">Row</DataTableHead>
                  <DataTableHead className="w-[18%]">Candidate</DataTableHead>
                  <DataTableHead className="w-[54%]">Message</DataTableHead>
                </DataTableRow>
              </DataTableHeader>
              <DataTableBody>
                {failedRows.map((row) => (
                  <DataTableRow key={row.id}>
                    <DataTableCell className="text-xs">{row.sheetName}</DataTableCell>
                    <DataTableCell className="tabular-nums text-xs">
                      {row.rowNumber ?? '—'}
                    </DataTableCell>
                    <DataTableCell className="truncate text-xs">
                      {row.sourceCandidateId ?? '—'}
                    </DataTableCell>
                    <DataTableCell className="text-xs">{row.message}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function CandidateImportScreen({
  title = 'Candidate Data Import',
  embedded = false,
  onBack,
}: CandidateImportScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('upload');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [history, setHistory] = useState<CandidateImportHistoryItem[]>([]);
  const [historyMeta, setHistoryMeta] = useState<PaginationMeta | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<CandidateImportBatch | null>(null);
  const [failedRows, setFailedRows] = useState<CandidateImportErrorItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{ processed: number; total: number } | null>(
    null,
  );

  async function waitForImportCompletion(batchId: number) {
    const pollIntervalMs = 2000;
    const maxAttempts = 300;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const batch = await candidatesApi.getImportBatch(batchId);
      setImportProgress({ processed: batch.processed, total: batch.total });
      if (!ACTIVE_STATUSES.has(batch.status)) {
        return batch;
      }
      await new Promise((resolve) => window.setTimeout(resolve, pollIntervalMs));
    }
    throw new Error('Import timed out while processing. Check Import History for status.');
  }

  const headerLeading = useMemo(
    () =>
      embedded ? null : (
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
      ),
    [embedded, title],
  );
  useDashboardHeaderLeading(headerLeading);

  const loadHistory = useCallback(async (page = historyPage) => {
    setHistoryLoading(true);
    try {
      const result = await candidatesApi.listImportHistory({
        page,
        limit: HISTORY_PAGE_SIZE,
      });
      setHistory(result.data);
      setHistoryMeta(result.meta);
      setHistoryPage(result.meta.page);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to load import history'));
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, showError]);

  const loadBatchDetail = useCallback(async (batchId: number) => {
    setDetailLoading(true);
    try {
      const [batch, errors] = await Promise.all([
        candidatesApi.getImportBatch(batchId),
        candidatesApi.listImportErrors(batchId, { page: 1, limit: 100 }),
      ]);
      setSelectedBatch(batch);
      setFailedRows(errors.data);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to load import details'));
    } finally {
      setDetailLoading(false);
    }
  }, [showError]);

  const openBatchDetail = useCallback((batchId: number) => {
    setSelectedBatchId(batchId);
    setDetailOpen(true);
  }, []);

  const closeBatchDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedBatchId(null);
    setSelectedBatch(null);
    setFailedRows([]);
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (selectedBatchId == null || !detailOpen) return;
    void loadBatchDetail(selectedBatchId);
  }, [selectedBatchId, detailOpen, loadBatchDetail]);

  useEffect(() => {
    if (!detailOpen || !selectedBatch || !ACTIVE_STATUSES.has(selectedBatch.status)) return;
    const timer = window.setInterval(() => {
      void loadBatchDetail(selectedBatch.batchId);
      void loadHistory(historyPage);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [detailOpen, selectedBatch, loadBatchDetail, loadHistory, historyPage]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        showError('Please upload a .xlsx workbook using the BesTal standard template.');
        return;
      }
      setBusy(true);
      setImporting(true);
      setImportProgress(null);
      setImportSuccess(null);
      setFileName(file.name);
      try {
        const data = await candidatesApi.enqueueImport(file);
        const batch = await waitForImportCompletion(data.batchId);
        await loadHistory(1);
        if (batch.status === 'COMPLETED') {
          const summary = `Import completed — ${batch.created} created, ${batch.updated} updated, ${batch.failed} failed.`;
          setImportSuccess(summary);
          show(summary, batch.failed > 0 ? 'error' : 'success');
        } else {
          showError(
            batch.errorSummary ??
              `Import finished with status ${batch.status}. Review Import History for details.`,
          );
        }
      } catch (err) {
        showError(getApiErrorMessage(err, 'Import failed'));
      } finally {
        setBusy(false);
        setImporting(false);
        setImportProgress(null);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [loadBatchDetail, loadHistory, openBatchDetail, show, showError],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const downloadTemplate = useCallback(async () => {
    try {
      await candidatesApi.downloadImportTemplate();
      show(
        'BesTal import template downloaded. Fill in candidate rows, save as .xlsx, then upload it on the Upload tab.',
      );
    } catch (err) {
      showError(getApiErrorMessage(err, 'Could not download the import template. Please try again.'));
    }
  }, [show, showError]);

  const downloadErrors = useCallback(async (batchId: number) => {
    try {
      await candidatesApi.downloadImportErrorReport(batchId);
      show('Error report downloaded.');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to download error report'));
    }
  }, [show, showError]);

  const downloadSourceFile = useCallback(async (batchId: number, sourceName?: string) => {
    try {
      await candidatesApi.downloadImportSourceFile(batchId, sourceName);
      show('Uploaded file downloaded.');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to download uploaded file'));
    }
  }, [show, showError]);

  return (
    <>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />

      <div className={cn('flex min-w-0 flex-col gap-6', embedded ? 'p-0' : 'p-6')}>
      {embedded && onBack ? (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onBack}>
            Cancel
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-2">
        <Button
          variant={tab === 'upload' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setTab('upload')}
        >
          Upload
        </Button>
        <Button
          variant={tab === 'history' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => {
            setTab('history');
            void loadHistory(historyPage);
          }}
        >
          Import History
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void downloadTemplate()}
        >
          <Download className="mr-2 h-4 w-4" />
          Download template
        </Button>
      </div>

      {tab === 'upload' && (
        <Card className="relative">
          {importing ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium">Import in progress…</p>
              {importProgress ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Processed {importProgress.processed}
                  {importProgress.total > 0 ? ` of ${importProgress.total}` : ''} records
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Uploading and validating file…</p>
              )}
            </div>
          ) : null}
          <CardHeader>
            <CardTitle className="text-base">Upload workbook</CardTitle>
          </CardHeader>
          <CardContent>
            {importSuccess ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <p className="font-medium">Import successful</p>
                <p className="mt-1">{importSuccess}</p>
              </div>
            ) : null}
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                dragging ? 'border-primary bg-primary/5' : 'border-border/70 bg-muted/20',
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {busy ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="mt-3 text-sm font-medium text-foreground">
                {busy || importing ? 'Import in progress…' : 'Drop .xlsx here or choose a file'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to 10,000 candidates. Stay on this tab until import completes.
              </p>
              {fileName && (
                <p className="mt-2 text-xs text-muted-foreground">Selected: {fileName}</p>
              )}
              <div className="mt-4">
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
                <Button disabled={busy || importing} onClick={() => inputRef.current?.click()}>
                  Choose file
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'history' && (
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b border-border/60 pb-4">
              <CardTitle className="text-base">Previous imports</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void loadHistory(historyPage)}
                disabled={historyLoading}
                aria-label="Refresh import history"
              >
                <RefreshCw className={cn('h-4 w-4', historyLoading && 'animate-spin')} />
              </Button>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-col p-0">
              <div className="scrollbar-thin min-w-0 overflow-x-auto">
                <table className="w-full min-w-[640px] caption-bottom text-sm">
                  <DataTableHeader>
                    <DataTableRow>
                      <DataTableHead className="w-[34%]">File</DataTableHead>
                      <DataTableHead className="w-[14%]">Status</DataTableHead>
                      <DataTableHead className="w-[10%] text-right">Created</DataTableHead>
                      <DataTableHead className="w-[10%] text-right">Failed</DataTableHead>
                      <DataTableHead className="w-[22%]">Uploaded</DataTableHead>
                      <DataTableHead className="w-[10%] text-right">Actions</DataTableHead>
                    </DataTableRow>
                  </DataTableHeader>
                  <DataTableBody>
                    {historyLoading && history.length === 0 ? (
                      <DataTableRow>
                        <DataTableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                          Loading import history…
                        </DataTableCell>
                      </DataTableRow>
                    ) : history.length === 0 ? (
                      <DataTableRow>
                        <DataTableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                          No imports yet.
                        </DataTableCell>
                      </DataTableRow>
                    ) : (
                      history.map((item) => (
                        <DataTableRow
                          key={item.batchId}
                          className={cn(
                            'cursor-pointer',
                            selectedBatchId === item.batchId && 'bg-muted/50',
                          )}
                          onClick={() => openBatchDetail(item.batchId)}
                        >
                          <DataTableCell className="max-w-0 truncate font-medium" title={item.fileName}>
                            {item.fileName}
                          </DataTableCell>
                          <DataTableCell>
                            <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                          </DataTableCell>
                          <DataTableCell className="text-right tabular-nums">{item.created}</DataTableCell>
                          <DataTableCell className="text-right tabular-nums">{item.failed}</DataTableCell>
                          <DataTableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            <span className="block truncate">{formatWhen(item.createdAt)}</span>
                            <span className="block truncate text-[11px]">{item.uploadedBy || '—'}</span>
                          </DataTableCell>
                          <DataTableCell className="text-right">
                            {item.hasSourceFile ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 px-0"
                                title="Download uploaded file"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void downloadSourceFile(item.batchId, item.fileName);
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="inline-block w-8" aria-hidden />
                            )}
                          </DataTableCell>
                        </DataTableRow>
                      ))
                    )}
                  </DataTableBody>
                </table>
              </div>
              <HistoryPagination
                meta={historyMeta}
                onPageChange={(page) => {
                  void loadHistory(page);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
      </div>

      <Dialog
        open={detailOpen}
        onClose={closeBatchDetail}
        title="Import batch details"
        scrollable
        className="max-w-3xl"
      >
        {detailLoading && !selectedBatch ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading batch details…
          </div>
        ) : selectedBatch ? (
          <BatchDetailContent
            batch={selectedBatch}
            failedRows={failedRows}
            onDownloadSource={() =>
              void downloadSourceFile(selectedBatch.batchId, selectedBatch.fileName)
            }
            onDownloadErrors={() => void downloadErrors(selectedBatch.batchId)}
          />
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            Select an import from the history list to view details.
          </p>
        )}
      </Dialog>
    </>
  );
}
