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
  StatusBadge,
  useDashboardHeaderLeading,
} from '@bestal/ui';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  Terminal,
  Upload,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  downloadTemplateCsv,
  simulateImport,
  validateCandidateCsv,
  type CsvImportRow,
  type CsvImportSummary,
  type CsvValidationResult,
} from '../../lib/candidate-csv-import';

type LogLevel = 'info' | 'warn' | 'error' | 'success';

type ImportLogEntry = {
  id: string;
  at: Date;
  level: LogLevel;
  message: string;
};

type CsvImportScreenProps = {
  cancelPath: string;
  title?: string;
  description?: string;
  /** When true, renders without page chrome — for use inside Add Candidate flow. */
  embedded?: boolean;
  onBack?: () => void;
};

function logLevelClass(level: LogLevel): string {
  switch (level) {
    case 'success':
      return 'text-emerald-700';
    case 'warn':
      return 'text-amber-700';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
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

export function CsvImportScreen({
  cancelPath,
  title = 'CSV Import',
  description = 'Bulk import candidates — upload, validate, review duplicates, and import',
  embedded = false,
  onBack,
}: CsvImportScreenProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);
  const [validation, setValidation] = useState<CsvValidationResult | null>(null);
  const [summary, setSummary] = useState<CsvImportSummary | null>(null);
  const [logs, setLogs] = useState<ImportLogEntry[]>([]);
  const [importing, setImporting] = useState(false);

  const appendLog = useCallback((level: LogLevel, message: string) => {
    setLogs((prev) => [
      {
        id: `${Date.now()}-${prev.length}`,
        at: new Date(),
        level,
        message,
      },
      ...prev,
    ]);
  }, []);

  const resetState = useCallback(() => {
    setValidation(null);
    setSummary(null);
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        appendLog('error', `Rejected file "${file.name}" — only .csv files are supported`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        setFileName(file.name);
        setFileText(text);
        resetState();
        appendLog('info', `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      };
      reader.onerror = () => {
        appendLog('error', `Failed to read ${file.name}`);
      };
      reader.readAsText(file);
    },
    [appendLog, resetState],
  );

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files[0];
    if (file) handleFile(file);
  };

  const handleValidate = () => {
    if (!fileText) {
      appendLog('warn', 'Upload a CSV file before validating');
      return;
    }
    const result = validateCandidateCsv(fileText);
    setValidation(result);
    setSummary(null);

    if (result.totalRows === 0) {
      appendLog('error', 'CSV is empty or could not be parsed');
      return;
    }

    if (!result.headerValid) {
      appendLog('warn', 'CSV header does not match template — column mapping may be incorrect');
    }

    appendLog('info', `Validated ${result.totalRows} row(s)`);
    if (result.duplicateCount > 0) {
      appendLog('warn', `Found ${result.duplicateCount} duplicate(s) by email`);
    }
    if (result.errorCount > 0) {
      appendLog('error', `${result.errorCount} row(s) have validation errors`);
    }
    if (result.readyCount > 0 && result.errorCount === 0 && result.duplicateCount === 0) {
      appendLog('success', `All ${result.readyCount} row(s) passed validation`);
    } else if (result.readyCount > 0) {
      appendLog('info', `${result.readyCount} row(s) ready to import (excluding errors/duplicates)`);
    }
  };

  const handleImport = async () => {
    if (!validation) {
      appendLog('warn', 'Run validation before importing');
      return;
    }
    const importable = validation.rows.filter((r) => r.errors.length === 0);
    if (importable.length === 0) {
      appendLog('error', 'No importable rows — fix errors or remove duplicates');
      return;
    }

    setImporting(true);
    appendLog('info', `Starting import of ${importable.length} candidate(s)…`);

    await new Promise((r) => setTimeout(r, 900));

    const importSummary = simulateImport(validation);
    setSummary(importSummary);
    setImporting(false);

    appendLog('success', `Imported ${importSummary.imported} candidate(s) successfully`);
    if (importSummary.skippedDuplicates > 0) {
      appendLog('warn', `Skipped ${importSummary.skippedDuplicates} duplicate(s)`);
    }
    if (importSummary.failed > 0) {
      appendLog('error', `${importSummary.failed} row(s) failed`);
    }

    // After a successful demo import, return to the candidates list.
    if (importSummary.imported > 0) {
      setTimeout(() => navigate(cancelPath), 800);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplateCsv();
    appendLog('info', 'Downloaded candidate import template');
  };

  const previewRows = validation?.rows ?? [];

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(cancelPath);
  };

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

  const content = (
    <div className={embedded ? 'space-y-6' : 'space-y-6 p-4 sm:p-6'}>
      {embedded && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
            Back
          </Button>
        </div>
      )}

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-brand" />
              Drag & drop upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                'flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors',
                dragOver
                  ? 'border-brand bg-brand/5'
                  : 'border-border bg-gradient-to-br from-background to-muted/20 hover:border-brand/40',
              )}
            >
              <FileSpreadsheet className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Drop your CSV here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the BesTal candidate template — .csv only
              </p>
              {fileName && (
                <Badge variant="secondary" className="mt-4 gap-1.5">
                  <FileSpreadsheet className="h-3 w-3" />
                  {fileName}
                </Badge>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </CardContent>
        </Card>

        {/* Validation summary */}
        {validation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {validation.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                CSV validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryStat label="Total rows" value={validation.totalRows} />
                <SummaryStat label="Ready" value={validation.readyCount} tone="success" />
                <SummaryStat label="Duplicates" value={validation.duplicateCount} tone="warn" />
                <SummaryStat label="Errors" value={validation.errorCount} tone="error" />
              </div>
              {!validation.isValid && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Resolve validation errors and duplicates before importing, or import will skip
                  invalid rows.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Duplicate detection */}
        {validation && validation.duplicateCount > 0 && (
          <Card className="border-amber-200/80 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-amber-900">
                <Copy className="h-4 w-4" />
                Duplicate detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {validation.rows
                  .filter((r) => r.isDuplicate)
                  .map((r) => (
                    <li
                      key={r.rowNumber}
                      className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-white/80 px-3 py-2"
                    >
                      <Copy className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>
                        Row {r.rowNumber}: <strong>{r.email}</strong> —{' '}
                        {r.errors.find((e) => e.startsWith('Duplicate')) ?? 'Duplicate email'}
                      </span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {previewRows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0 pb-2">
              <DataTable>
                <DataTableHeader>
                  <DataTableRow>
                    <DataTableHead>Row</DataTableHead>
                    <DataTableHead>Name</DataTableHead>
                    <DataTableHead>Email</DataTableHead>
                    <DataTableHead>Skill</DataTableHead>
                    <DataTableHead>Rate</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody>
                  {previewRows.map((row) => (
                    <PreviewRow key={row.rowNumber} row={row} />
                  ))}
                </DataTableBody>
              </DataTable>
            </CardContent>
          </Card>
        )}

        {/* Import summary */}
        {summary && (
          <Card className="border-emerald-200/80 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-900">
                <CheckCircle2 className="h-4 w-4" />
                Import summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryStat label="Imported" value={summary.imported} tone="success" />
                <SummaryStat label="Skipped duplicates" value={summary.skippedDuplicates} tone="warn" />
                <SummaryStat label="Failed" value={summary.failed} tone="error" />
              </div>
              <p className="mt-4 text-sm text-emerald-800">
                Processed {summary.totalProcessed} row(s). New candidates are available in the
                talent pool (demo — no API call).
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button variant="outline" onClick={handleValidate} disabled={!fileText}>
            Validate
          </Button>
          <Button
            onClick={handleImport}
            disabled={!validation || importing || validation.readyCount === 0}
          >
            {importing ? 'Importing…' : 'Import'}
          </Button>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              Import logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Logs will appear here as you upload, validate, and import.
              </p>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-xs">
                {logs.map((entry) => (
                  <div key={entry.id} className="flex gap-2">
                    <span className="shrink-0 text-muted-foreground">
                      {entry.at.toLocaleTimeString()}
                    </span>
                    <span className={logLevelClass(entry.level)}>{entry.message}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );

  if (embedded) {
    return content;
  }

  return <div className="min-h-full bg-background">{content}</div>;
}

function PreviewRow({ row }: { row: CsvImportRow }) {
  const hasErrors = row.errors.length > 0;
  const status = hasErrors ? (row.isDuplicate ? 'CONSIDER' : 'FAILED') : 'CLEAR';

  return (
    <DataTableRow className={row.isDuplicate ? 'bg-amber-50/50' : undefined}>
      <DataTableCell className="tabular-nums text-muted-foreground">{row.rowNumber}</DataTableCell>
      <DataTableCell className="font-medium">
        {row.firstName} {row.lastName}
      </DataTableCell>
      <DataTableCell>{row.email || '—'}</DataTableCell>
      <DataTableCell className="max-w-[140px] truncate text-muted-foreground">
        {row.primarySkill || '—'}
      </DataTableCell>
      <DataTableCell className="tabular-nums">
        {row.expectedRate ? `${row.currency || 'USD'} ${row.expectedRate}` : '—'}
      </DataTableCell>
      <DataTableCell>
        <div className="space-y-1">
          <StatusBadge status={status} />
          {hasErrors && (
            <p className="max-w-xs text-[11px] text-red-600">{row.errors.join('; ')}</p>
          )}
        </div>
      </DataTableCell>
    </DataTableRow>
  );
}
