import { cn } from '@bestal/shared-utils';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  useDashboardHeaderLeading,
} from '@bestal/ui';
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  candidatesApi,
  type CandidateImportBatch,
  type CandidateImportErrorItem,
  type CandidateImportHistoryItem,
} from '../../lib/api/candidates';
import { getApiErrorMessage } from '../../lib/api/errors';

type CandidateImportScreenProps = {
  cancelPath: string;
  title?: string;
  description?: string;
  embedded?: boolean;
  onBack?: () => void;
};

type Tab = 'upload' | 'history';

const ACTIVE_STATUSES = new Set(['QUEUED', 'VALIDATING', 'PROCESSING', 'CONFIRMING']);

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

export function CandidateImportScreen({
  cancelPath,
  title = 'Candidate Data Import',
  description = 'Upload the standard BesTal Excel template. Processing runs in the background — check Import History for success or failures.',
  embedded = false,
  onBack,
}: CandidateImportScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('upload');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CandidateImportHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<CandidateImportBatch | null>(null);
  const [failedRows, setFailedRows] = useState<CandidateImportErrorItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const headerLeading = useMemo(
    () =>
      embedded ? null : (
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={cancelPath}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </h1>
          </div>
        </div>
      ),
    [cancelPath, embedded, title],
  );
  useDashboardHeaderLeading(headerLeading);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const result = await candidatesApi.listImportHistory({ page: 1, limit: 30 });
      setHistory(result.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load import history'));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

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
      setError(getApiErrorMessage(err, 'Failed to load import details'));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (selectedBatchId == null) return;
    void loadBatchDetail(selectedBatchId);
  }, [selectedBatchId, loadBatchDetail]);

  useEffect(() => {
    if (!selectedBatch || !ACTIVE_STATUSES.has(selectedBatch.status)) return;
    const timer = window.setInterval(() => {
      void loadBatchDetail(selectedBatch.batchId);
      void loadHistory();
    }, 4000);
    return () => window.clearInterval(timer);
  }, [selectedBatch, loadBatchDetail, loadHistory]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        setError('Please upload a .xlsx workbook using the BesTal standard template.');
        return;
      }
      setBusy(true);
      setError(null);
      setToast(null);
      setFileName(file.name);
      try {
        const data = await candidatesApi.enqueueImport(file);
        setToast('Import started. Track progress in Import History.');
        setSelectedBatchId(data.batchId);
        setTab('history');
        await loadHistory();
        await loadBatchDetail(data.batchId);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to start import'));
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [loadBatchDetail, loadHistory],
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
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to download template'));
    }
  }, []);

  const downloadErrors = useCallback(async (batchId: number) => {
    try {
      await candidatesApi.downloadImportErrorReport(batchId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to download error report'));
    }
  }, []);

  const downloadSourceFile = useCallback(async (batchId: number, fileName?: string) => {
    try {
      await candidatesApi.downloadImportSourceFile(batchId, fileName);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to download uploaded file'));
    }
  }, []);

  return (
    <div className={cn('space-y-6', embedded ? 'p-0' : 'p-6')}>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={cancelPath}
            className="inline-flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to candidates
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void downloadTemplate()}>
              <Download className="mr-2 h-4 w-4" />
              Download template
            </Button>
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2 border-b border-border/60 pb-2">
        <Button
          variant={tab === 'upload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTab('upload')}
        >
          Upload
        </Button>
        <Button
          variant={tab === 'history' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => {
            setTab('history');
            void loadHistory();
          }}
        >
          Import History
        </Button>
      </div>

      {toast && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {tab === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload workbook</CardTitle>
          </CardHeader>
          <CardContent>
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
                {busy ? 'Starting import…' : 'Drop .xlsx here or choose a file'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Up to 10,000 candidates. You can leave after upload — results appear in history.
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
                <Button disabled={busy} onClick={() => inputRef.current?.click()}>
                  Choose file
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'history' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle className="text-base">Previous imports</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void loadHistory()}
                disabled={historyLoading}
              >
                <RefreshCw className={cn('h-4 w-4', historyLoading && 'animate-spin')} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>File</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                    <DataTableHead>Created</DataTableHead>
                    <DataTableHead>Failed</DataTableHead>
                    <DataTableHead>When</DataTableHead>
                    <DataTableHead className="w-[70px]" />
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {history.length === 0 && !historyLoading ? (
                    <DataTableRow>
                      <DataTableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No imports yet.
                      </DataTableCell>
                    </DataTableRow>
                  ) : (
                    history.map((item) => (
                      <DataTableRow
                        key={item.batchId}
                        className={cn(
                          'cursor-pointer',
                          selectedBatchId === item.batchId && 'bg-muted/40',
                        )}
                        onClick={() => setSelectedBatchId(item.batchId)}
                      >
                        <DataTableCell className="max-w-[180px] truncate font-medium">
                          {item.fileName}
                        </DataTableCell>
                        <DataTableCell>
                          <Badge variant={statusTone(item.status) === 'error' ? 'destructive' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </DataTableCell>
                        <DataTableCell className="tabular-nums">{item.created}</DataTableCell>
                        <DataTableCell className="tabular-nums">{item.failed}</DataTableCell>
                        <DataTableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatWhen(item.createdAt)}
                        </DataTableCell>
                        <DataTableCell>
                          {item.hasSourceFile ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Download uploaded file"
                              onClick={(event) => {
                                event.stopPropagation();
                                void downloadSourceFile(item.batchId, item.fileName);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </DataTableCell>
                      </DataTableRow>
                    ))
                  )}
                </DataTableBody>
              </DataTable>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Batch details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedBatchId && (
                <p className="text-sm text-muted-foreground">
                  Select an import from the history list to view details and failed records.
                </p>
              )}
              {detailLoading && !selectedBatch && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </div>
              )}
              {selectedBatch && (
                <>
                  <div className="space-y-1">
                    <p className="truncate text-sm font-medium">{selectedBatch.fileName}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={statusTone(selectedBatch.status) === 'error' ? 'destructive' : 'secondary'}>
                        {selectedBatch.status}
                      </Badge>
                      <span>By {selectedBatch.uploadedBy ?? '—'}</span>
                      <span>{formatWhen(selectedBatch.createdAt)}</span>
                    </div>
                    {selectedBatch.errorSummary && (
                      <p className="text-sm text-amber-700">{selectedBatch.errorSummary}</p>
                    )}
                  </div>

                  {ACTIVE_STATUSES.has(selectedBatch.status) && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Processing…</span>
                        <span>
                          {selectedBatch.processed} / {selectedBatch.total || '—'}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${
                              selectedBatch.total > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (selectedBatch.processed / selectedBatch.total) * 100,
                                    ),
                                  )
                                : 10
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <SummaryStat label="Created" value={selectedBatch.created} tone="success" />
                    <SummaryStat label="Updated" value={selectedBatch.updated} />
                    <SummaryStat label="Skipped" value={selectedBatch.skipped} tone="warn" />
                    <SummaryStat label="Failed" value={selectedBatch.failed} tone="error" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedBatch.hasSourceFile ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          void downloadSourceFile(selectedBatch.batchId, selectedBatch.fileName)
                        }
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download uploaded file
                      </Button>
                    ) : null}
                    {(selectedBatch.hasErrorReport || selectedBatch.failed > 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void downloadErrors(selectedBatch.batchId)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download error report
                      </Button>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Failed records</p>
                    {failedRows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {ACTIVE_STATUSES.has(selectedBatch.status)
                          ? 'No failures recorded yet.'
                          : 'No failed records for this import.'}
                      </p>
                    ) : (
                      <div className="max-h-72 overflow-auto rounded-lg border border-border/60">
                        <DataTable>
                          <DataTableHeader>
                            <DataTableRow>
                              <DataTableHead>Sheet</DataTableHead>
                              <DataTableHead>Row</DataTableHead>
                              <DataTableHead>Candidate</DataTableHead>
                              <DataTableHead>Message</DataTableHead>
                            </DataTableRow>
                          </DataTableHeader>
                          <DataTableBody>
                            {failedRows.map((row) => (
                              <DataTableRow key={row.id}>
                                <DataTableCell className="text-xs">{row.sheetName}</DataTableCell>
                                <DataTableCell className="tabular-nums text-xs">
                                  {row.rowNumber ?? '—'}
                                </DataTableCell>
                                <DataTableCell className="text-xs">
                                  {row.sourceCandidateId ?? '—'}
                                </DataTableCell>
                                <DataTableCell className="max-w-[220px] text-xs">
                                  {row.message}
                                </DataTableCell>
                              </DataTableRow>
                            ))}
                          </DataTableBody>
                        </DataTable>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
