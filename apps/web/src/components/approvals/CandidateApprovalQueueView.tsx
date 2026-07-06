import {
  Avatar,
  Button,
  Dialog,
  Input,
  PageHeader,
  Select,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle, EyeOff, Globe, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  canApprove,
  canPublish,
  readinessLabel,
} from '../../lib/candidate-approval-gates';
import {
  approveCandidate,
  getApprovalQueueRecords,
  publishCandidate,
  rejectCandidate,
  subscribeApprovalChanges,
  unpublishCandidate,
  type ApprovalQueueRecord,
} from '../../lib/candidate-approval-overrides';
import { useDemoToast } from '../../lib/use-demo-toast';

type QueueFilter = 'all' | 'pending' | 'approved' | 'published' | 'rejected' | 'blocked';

const defaultFilters = {
  queue: 'all' as QueueFilter,
  evaluation: 'all',
  bgv: 'all',
};

type CandidateApprovalQueueViewProps = {
  candidateDetailBasePath?: string;
};

function GateHint({ blockers }: { blockers: readonly string[] }) {
  if (blockers.length === 0) return null;
  return (
    <p className="mt-1 text-[11px] text-amber-700">{blockers.join(' · ')}</p>
  );
}

export function CandidateApprovalQueueView({
  candidateDetailBasePath = '/admin/candidates',
}: CandidateApprovalQueueViewProps) {
  const { message, show } = useDemoToast();
  const [records, setRecords] = useState<ApprovalQueueRecord[]>(() => getApprovalQueueRecords());
  const [filters, setFilters] = useState(defaultFilters);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ApprovalQueueRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const refresh = useCallback(() => {
    setRecords(getApprovalQueueRecords());
  }, []);

  useEffect(() => subscribeApprovalChanges(refresh), [refresh]);

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.queue === 'pending') {
      rows = rows.filter((r) => r.effectiveApprovalStatus === 'PENDING');
    } else if (filters.queue === 'approved') {
      rows = rows.filter(
        (r) => r.effectiveApprovalStatus === 'APPROVED' && r.effectiveVisibility !== 'PUBLISHED',
      );
    } else if (filters.queue === 'published') {
      rows = rows.filter((r) => r.effectiveVisibility === 'PUBLISHED');
    } else if (filters.queue === 'rejected') {
      rows = rows.filter((r) => r.effectiveApprovalStatus === 'REJECTED');
    } else if (filters.queue === 'blocked') {
      rows = rows.filter(
        (r) =>
          r.effectiveApprovalStatus === 'PENDING' &&
          !canApprove({
            evaluationStatus: r.evaluationStatus,
            bgvStatus: r.bgvStatus,
            approvalStatus: r.effectiveApprovalStatus,
            visibility: r.effectiveVisibility,
          }).allowed,
      );
    }

    if (filters.evaluation !== 'all') {
      rows = rows.filter((r) => r.evaluationStatus === filters.evaluation);
    }
    if (filters.bgv !== 'all') {
      rows = rows.filter((r) => r.bgvStatus === filters.bgv);
    }

    rows.sort((a, b) => {
      const priority = (r: ApprovalQueueRecord) => {
        if (r.effectiveApprovalStatus === 'PENDING') return 0;
        if (r.effectiveApprovalStatus === 'APPROVED' && r.effectiveVisibility !== 'PUBLISHED') {
          return 1;
        }
        return 2;
      };
      return priority(a) - priority(b) || a.fullName.localeCompare(b.fullName);
    });

    return rows;
  }, [records, filters]);

  const handleApprove = useCallback(
    (record: ApprovalQueueRecord) => {
      const gate = canApprove({
        evaluationStatus: record.evaluationStatus,
        bgvStatus: record.bgvStatus,
        approvalStatus: record.effectiveApprovalStatus,
        visibility: record.effectiveVisibility,
      });
      if (!gate.allowed) {
        show(`Cannot approve — ${gate.blockers.join(', ')}`);
        return;
      }
      approveCandidate(record.id);
      show(`Approved — ${record.fullName} (demo)`);
      refresh();
    },
    [refresh, show],
  );

  const handlePublish = useCallback(
    (record: ApprovalQueueRecord) => {
      const gate = canPublish({
        evaluationStatus: record.evaluationStatus,
        bgvStatus: record.bgvStatus,
        approvalStatus: record.effectiveApprovalStatus,
        visibility: record.effectiveVisibility,
      });
      if (!gate.allowed) {
        show(`Cannot publish — ${gate.blockers.join(', ')}`);
        return;
      }
      publishCandidate(record.id);
      show(`Published — ${record.fullName} is now visible to clients (demo)`);
      refresh();
    },
    [refresh, show],
  );

  const handleUnpublish = useCallback(
    (record: ApprovalQueueRecord) => {
      unpublishCandidate(record.id);
      show(`Unpublished — ${record.fullName} hidden from client portal (demo)`);
      refresh();
    },
    [refresh, show],
  );

  const openReject = (record: ApprovalQueueRecord) => {
    setRejectTarget(record);
    setRejectReason('');
    setRejectOpen(true);
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    rejectCandidate(rejectTarget.id, rejectReason);
    show(`Rejected — ${rejectTarget.fullName} (demo)`);
    setRejectOpen(false);
    setRejectTarget(null);
    refresh();
  };

  const columns = useMemo<ColumnDef<ApprovalQueueRecord>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Candidate',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.fullName} src={row.original.photoUrl} size="sm" />
            <div>
              <Link
                to={`${candidateDetailBasePath}/${row.original.id}`}
                className="font-medium text-brand hover:underline"
              >
                {row.original.fullName}
              </Link>
              <p className="text-xs text-muted-foreground">{row.original.role}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'evaluationStatus',
        header: 'Evaluation',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        accessorKey: 'bgvStatus',
        header: 'BGV',
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: 'approval',
        header: 'Approval',
        cell: ({ row }) => <StatusBadge status={row.original.effectiveApprovalStatus} />,
      },
      {
        id: 'visibility',
        header: 'Visibility',
        cell: ({ row }) => <StatusBadge status={row.original.effectiveVisibility} />,
      },
      {
        id: 'readiness',
        header: 'Readiness',
        cell: ({ row }) => {
          const r = row.original;
          const label = readinessLabel({
            evaluationStatus: r.evaluationStatus,
            bgvStatus: r.bgvStatus,
            approvalStatus: r.effectiveApprovalStatus,
            visibility: r.effectiveVisibility,
          });
          return <span className="text-sm text-muted-foreground">{label}</span>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const r = row.original;
          const approveGate = canApprove({
            evaluationStatus: r.evaluationStatus,
            bgvStatus: r.bgvStatus,
            approvalStatus: r.effectiveApprovalStatus,
            visibility: r.effectiveVisibility,
          });
          const publishGate = canPublish({
            evaluationStatus: r.evaluationStatus,
            bgvStatus: r.bgvStatus,
            approvalStatus: r.effectiveApprovalStatus,
            visibility: r.effectiveVisibility,
          });

          return (
            <div className="flex min-w-[220px] flex-col gap-1">
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!approveGate.allowed}
                  onClick={() => handleApprove(r)}
                >
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={r.effectiveApprovalStatus !== 'PENDING'}
                  className="text-destructive hover:text-destructive"
                  onClick={() => openReject(r)}
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={!publishGate.allowed}
                  onClick={() => handlePublish(r)}
                >
                  <Globe className="mr-1 h-3.5 w-3.5" />
                  Publish
                </Button>
                {r.effectiveVisibility === 'PUBLISHED' && (
                  <Button size="sm" variant="outline" onClick={() => handleUnpublish(r)}>
                    <EyeOff className="mr-1 h-3.5 w-3.5" />
                    Unpublish
                  </Button>
                )}
              </div>
              {!approveGate.allowed && r.effectiveApprovalStatus === 'PENDING' && (
                <GateHint blockers={approveGate.blockers} />
              )}
              {r.effectiveApprovalStatus === 'APPROVED' && !publishGate.allowed && (
                <GateHint blockers={publishGate.blockers} />
              )}
            </div>
          );
        },
      },
    ],
    [candidateDetailBasePath, handleApprove, handlePublish, handleUnpublish],
  );

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title="Candidate Approvals & Publish"
        description="Review vetted candidates — approve after evaluation & BGV, then publish to the client portal"
      />

      <div className="mx-6 mb-4 rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Workflow:</strong> Evaluation completed → BGV requested
        (not failed) → <strong>Approve</strong> → BGV clear → <strong>Publish</strong> → visible on
        client search.
      </div>

      {message && (
        <div className="mx-6 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="p-4 sm:p-6">
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate name or role…"
          pageSize={10}
          stickyHeader
          filters={
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-background to-muted/20 p-4 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Queue
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <FilterSelect
                  label="Queue"
                  value={filters.queue}
                  onChange={(v) => setFilters((f) => ({ ...f, queue: v as QueueFilter }))}
                  options={[
                    { value: 'all', label: 'All candidates' },
                    { value: 'pending', label: 'Pending approval' },
                    { value: 'approved', label: 'Approved — ready to publish' },
                    { value: 'published', label: 'Published to clients' },
                    { value: 'rejected', label: 'Rejected' },
                    { value: 'blocked', label: 'Blocked (missing eval/BGV)' },
                  ]}
                />
                <FilterSelect
                  label="Evaluation"
                  value={filters.evaluation}
                  onChange={(v) => setFilters((f) => ({ ...f, evaluation: v }))}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'COMPLETED', label: 'Completed' },
                    { value: 'IN_PROGRESS', label: 'In progress' },
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'NOT_STARTED', label: 'Not started' },
                  ]}
                />
                <FilterSelect
                  label="BGV"
                  value={filters.bgv}
                  onChange={(v) => setFilters((f) => ({ ...f, bgv: v }))}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'CLEAR', label: 'Clear' },
                    { value: 'IN_PROGRESS', label: 'In progress' },
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'NOT_STARTED', label: 'Not started' },
                    { value: 'FAILED', label: 'Failed' },
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
            return [r.fullName, r.role, r.community, r.email].some((field) =>
              field.toLowerCase().includes(q),
            );
          }}
        />
      </div>

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject candidate"
        description={
          rejectTarget
            ? `Reject ${rejectTarget.fullName} — they will remain internal only.`
            : undefined
        }
        className="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmReject}>
              Confirm reject
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label htmlFor="reject-reason" className="text-sm font-medium">
            Reason (optional)
          </label>
          <Input
            id="reject-reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Evaluation scores below threshold"
          />
        </div>
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
