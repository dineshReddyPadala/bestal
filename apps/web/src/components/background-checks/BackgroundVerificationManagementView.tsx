import {
  backgroundVerificationRecords,
  bgvCandidates,
  bgvOverallStatuses,
  bgvVendors,
  candidates,
  type BackgroundVerificationRecord,
  type BgvCheckStatus,
} from '@bestal/mock-data';
import { formatDate } from '@bestal/shared-utils';
import { Button, Dialog, PageHeader, Select, StatusBadge, TanStackDataTable } from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BgvRequestForm } from '../forms/BgvRequestForm';
import { DocumentUploadForm } from '../forms/DocumentUploadForm';
import {
  buildBgvPayload,
  buildDocumentPayload,
  type BgvRequestFormValues,
} from '../../lib/entity-field-metadata';
import { useDemoToast } from '../../lib/use-demo-toast';

type BgvAction = 'Upload' | 'View' | 'AI Summary' | 'Download' | 'Reprocess';

type BackgroundVerificationManagementViewProps = {
  title?: string;
  description?: string;
};

const defaultFilters = {
  status: 'all',
  vendor: 'all',
  candidate: 'all',
  completed: 'all',
  criminal: 'all',
};

function candidateIdByName(name: string): number {
  const match = candidates.find((c) => `${c.firstName} ${c.lastName}` === name);
  return match?.id ?? 0;
}

function CheckStatusBadge({ status }: { status: BgvCheckStatus }) {
  return <StatusBadge status={status} className="text-[11px]" />;
}

function BgvRowActions({
  record,
  onAction,
}: {
  record: BackgroundVerificationRecord;
  onAction: (action: BgvAction) => void;
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
    label: BgvAction;
    icon: React.ReactNode;
    disabled?: boolean;
  }[] = [
    { label: 'Upload', icon: <Upload className="h-3.5 w-3.5" /> },
    { label: 'View', icon: <Eye className="h-3.5 w-3.5" /> },
    { label: 'AI Summary', icon: <Sparkles className="h-3.5 w-3.5" /> },
    {
      label: 'Download',
      icon: <Download className="h-3.5 w-3.5" />,
      disabled: !record.hasReport,
    },
    {
      label: 'Reprocess',
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      disabled: record.status === 'NOT_STARTED',
    },
  ];

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-sm font-medium text-foreground hover:bg-muted"
        onClick={() => setOpen((v) => !v)}
        aria-label="Background verification actions"
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

export function BackgroundVerificationManagementView({
  title = 'Background Verification Management',
  description = 'Track vendor checks — employment, education, references, and criminal screening',
}: BackgroundVerificationManagementViewProps) {
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<BackgroundVerificationRecord[]>(() => [
    ...backgroundVerificationRecords,
  ]);
  const [filters, setFilters] = useState(defaultFilters);
  const [requestOpen, setRequestOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadRecord, setUploadRecord] = useState<BackgroundVerificationRecord | null>(null);

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.status !== 'all') {
      rows = rows.filter((r) => r.status === filters.status);
    }
    if (filters.vendor !== 'all') {
      rows = rows.filter((r) => r.vendor === filters.vendor);
    }
    if (filters.candidate !== 'all') {
      rows = rows.filter((r) => r.candidateName === filters.candidate);
    }
    if (filters.completed === 'yes') {
      rows = rows.filter((r) => r.completedAt != null);
    } else if (filters.completed === 'no') {
      rows = rows.filter((r) => r.completedAt == null);
    }
    if (filters.criminal !== 'all') {
      rows = rows.filter((r) => r.criminal === filters.criminal);
    }

    rows.sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return bTime - aTime;
    });

    return rows;
  }, [records, filters]);

  const handleAction = useCallback(
    (record: BackgroundVerificationRecord, action: BgvAction) => {
      if (action === 'Upload') {
        setUploadRecord(record);
        setUploadOpen(true);
        return;
      }
      if (action === 'Reprocess') {
        setRecords((prev) =>
          prev.map((row) =>
            row.id === record.id
              ? {
                  ...row,
                  status: 'IN_PROGRESS',
                  employment: row.employment === 'VERIFIED' ? 'VERIFIED' : 'IN_PROGRESS',
                  education: row.education === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
                  criminal: row.criminal === 'CLEAR' ? 'CLEAR' : 'PENDING',
                  completedAt: null,
                  hasReport: false,
                }
              : row,
          ),
        );
      }
      show(`${action} — ${record.candidateName} (${record.vendor}) (demo)`);
    },
    [show],
  );

  const handleRequestSubmit = useCallback(
    (values: BgvRequestFormValues) => {
      const candidateId = candidateIdByName(values.candidateName);
      const nextId = Math.max(0, ...records.map((r) => r.id)) + 1;
      const payload = buildBgvPayload(values, candidateId);

      if (values.consentFileName) {
        buildDocumentPayload(
          { fileName: values.consentFileName, kind: 'BGV_FORM' },
          'background_check',
          nextId,
        );
      }

      setRecords((prev) => [
        ...prev,
        {
          id: nextId,
          candidateId: payload.candidateId,
          candidateName: values.candidateName,
          vendor: values.vendor,
          status: payload.status,
          employment: payload.employment as BgvCheckStatus,
          education: payload.education as BgvCheckStatus,
          reference: payload.reference as BgvCheckStatus,
          address: payload.address as BgvCheckStatus,
          criminal: payload.criminal as BgvCheckStatus,
          completedAt: null,
          hasReport: false,
        },
      ]);

      show(`BGV requested — ${values.candidateName} via ${values.vendor} (demo)`);
      setRequestOpen(false);
    },
    [records, show],
  );

  const columns = useMemo<ColumnDef<BackgroundVerificationRecord>[]>(
    () => [
      {
        accessorKey: 'candidateName',
        header: 'Candidate',
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'vendor',
        header: 'Vendor',
        cell: ({ getValue }) => <span>{getValue() as string}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'employment',
        header: 'Employment',
        cell: ({ getValue }) => <CheckStatusBadge status={getValue() as BgvCheckStatus} />,
      },
      {
        accessorKey: 'education',
        header: 'Education',
        cell: ({ getValue }) => <CheckStatusBadge status={getValue() as BgvCheckStatus} />,
      },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ getValue }) => <CheckStatusBadge status={getValue() as BgvCheckStatus} />,
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: ({ getValue }) => <CheckStatusBadge status={getValue() as BgvCheckStatus} />,
      },
      {
        accessorKey: 'criminal',
        header: 'Criminal',
        cell: ({ getValue }) => <CheckStatusBadge status={getValue() as BgvCheckStatus} />,
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
        header: 'Actions',
        cell: ({ row }) => (
          <BgvRowActions
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
          <Button onClick={() => setRequestOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Request BGV
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
          searchPlaceholder="Search by candidate or vendor…"
          pageSize={10}
          stickyHeader
          filters={
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Filters
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  onChange={(v) => updateFilter('status', v)}
                  options={[
                    { value: 'all', label: 'All statuses' },
                    ...bgvOverallStatuses.map((s) => ({
                      value: s,
                      label: s.replace(/_/g, ' '),
                    })),
                  ]}
                />
                <FilterSelect
                  label="Vendor"
                  value={filters.vendor}
                  onChange={(v) => updateFilter('vendor', v)}
                  options={[
                    { value: 'all', label: 'All vendors' },
                    ...bgvVendors.map((v) => ({ value: v, label: v })),
                  ]}
                />
                <FilterSelect
                  label="Candidate"
                  value={filters.candidate}
                  onChange={(v) => updateFilter('candidate', v)}
                  options={[
                    { value: 'all', label: 'All candidates' },
                    ...bgvCandidates.map((c) => ({ value: c, label: c })),
                  ]}
                />
                <FilterSelect
                  label="Completed"
                  value={filters.completed}
                  onChange={(v) => updateFilter('completed', v)}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'yes', label: 'Completed' },
                    { value: 'no', label: 'In progress' },
                  ]}
                />
                <FilterSelect
                  label="Criminal"
                  value={filters.criminal}
                  onChange={(v) => updateFilter('criminal', v)}
                  options={[
                    { value: 'all', label: 'All criminal' },
                    { value: 'CLEAR', label: 'Clear' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'CONSIDER', label: 'Consider' },
                    { value: 'FAILED', label: 'Failed' },
                    { value: 'NOT_STARTED', label: 'Not started' },
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
            return [r.candidateName, r.vendor, r.status].some((field) =>
              String(field).toLowerCase().includes(q),
            );
          }}
        />
      </div>

      <Dialog
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setUploadRecord(null);
        }}
        title="Upload BGV document"
        description={`Upload report or consent form for ${uploadRecord?.candidateName ?? 'candidate'}`}
        className="max-w-lg"
      >
        <DocumentUploadForm
          kind="BGV_FORM"
          accept=".pdf,.doc,.docx"
          hint="PDF or Word — upload file, not a URL"
          submitLabel="Upload document"
          onSubmit={(values) => {
            buildDocumentPayload(values, 'background_check', uploadRecord?.id ?? 0);
            if (uploadRecord) {
              setRecords((prev) =>
                prev.map((row) =>
                  row.id === uploadRecord.id ? { ...row, hasReport: true } : row,
                ),
              );
            }
            show(`Document uploaded — ${uploadRecord?.candidateName} (demo)`);
            setUploadOpen(false);
            setUploadRecord(null);
          }}
          onCancel={() => {
            setUploadOpen(false);
            setUploadRecord(null);
          }}
        />
      </Dialog>

      <Dialog
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Request background verification"
        description="Select candidate, vendor, and check type. Status and check results are updated automatically."
        className="max-w-2xl"
      >
        <BgvRequestForm
          onSubmit={handleRequestSubmit}
          onCancel={() => setRequestOpen(false)}
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
