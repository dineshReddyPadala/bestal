import {
  Avatar,
  Button,
  Dialog,
  Input,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Check,
  CheckCircle,
  EyeOff,
  Globe,
  MoreHorizontal,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidateMutations, useCandidatesList } from '../../hooks/api/useCandidates';
import type { CandidateListItem } from '../../lib/api/types';
import { canApprove, canPublish } from '../../lib/candidate-approval-gates';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';
import { getApiErrorMessage } from '../../lib/api/errors';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../ui/ToastHost';

type QueueFilter = 'pending' | 'all' | 'approved' | 'published' | 'rejected';

const defaultFilters = {
  queue: 'pending' as QueueFilter,
};

type CandidateApprovalQueueViewProps = {
  candidateDetailBasePath?: string;
};

type ApprovalAction = 'Approve' | 'Reject' | 'Publish' | 'Unpublish' | 'Send back';

type ApprovalRow = {
  id: number;
  fullName: string;
  email: string;
  role: string | null;
  profileStatus: string | null;
  approvalStatus: string;
  visibility: string;
  evaluationStatus: string | null;
  bgvStatus: string | null;
  submittedForApprovalAt: string | null;
  hasResume: boolean;
  hasAiSummary: boolean;
  hasSkills: boolean;
  hasAvailability: boolean;
  hasCommercials: boolean;
};

function ChecklistCell({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${ok ? 'text-emerald-700' : 'text-muted-foreground'}`}
      title={label}
    >
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span className="hidden lg:inline">{label}</span>
    </span>
  );
}

function toApprovalRow(candidate: CandidateListItem): ApprovalRow {
  return {
    id: candidate.id,
    fullName: `${candidate.firstName} ${candidate.lastName}`.trim(),
    email: candidate.email,
    role: candidate.headline,
    profileStatus: candidate.profileStatus,
    approvalStatus: candidate.approvalStatus,
    visibility: candidate.visibility,
    evaluationStatus: candidate.evaluationStatus,
    bgvStatus: candidate.bgvStatus,
    submittedForApprovalAt: candidate.submittedForApprovalAt,
    hasResume: Boolean(candidate.hasResume),
    hasAiSummary: Boolean(candidate.hasAiSummary),
    hasSkills: Boolean(candidate.hasSkills),
    hasAvailability: Boolean(candidate.hasAvailability),
    hasCommercials: Boolean(candidate.hasCommercials),
  };
}

function ApprovalRowActions({
  record,
  onAction,
}: {
  record: ApprovalRow;
  onAction: (action: ApprovalAction) => void;
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

  const gateInput = {
    profileStatus: record.profileStatus,
    evaluationStatus: record.evaluationStatus,
    bgvStatus: record.bgvStatus,
    approvalStatus: record.approvalStatus,
    visibility: record.visibility,
    submittedForApprovalAt: record.submittedForApprovalAt,
  };
  const approveGate = canApprove(gateInput);
  const publishGate = canPublish(gateInput);

  const actions: {
    label: ApprovalAction;
    icon: React.ReactNode;
    disabled?: boolean;
    title?: string;
    variant?: 'danger';
  }[] = [
    {
      label: 'Approve',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      disabled: !approveGate.allowed,
      title: approveGate.blockers.join('; '),
    },
    {
      label: 'Send back',
      icon: <RotateCcw className="h-3.5 w-3.5" />,
      disabled: record.approvalStatus !== 'PENDING' || !record.submittedForApprovalAt,
    },
    {
      label: 'Reject',
      icon: <XCircle className="h-3.5 w-3.5" />,
      disabled: record.approvalStatus !== 'PENDING' || !record.submittedForApprovalAt,
      variant: 'danger',
    },
    {
      label: 'Publish',
      icon: <Globe className="h-3.5 w-3.5" />,
      disabled: !publishGate.allowed,
      title: publishGate.blockers.join('; '),
    },
    {
      label: 'Unpublish',
      icon: <EyeOff className="h-3.5 w-3.5" />,
      disabled: record.visibility !== 'CLIENT_VISIBLE',
    },
  ];

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-label="Approval actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-elevated">
          {actions.map(({ label, icon, disabled, variant, title }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
              title={title}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 ${
                variant === 'danger' ? 'text-destructive' : 'text-foreground'
              }`}
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

export function CandidateApprovalQueueView({
  candidateDetailBasePath = '/admin/candidates',
}: CandidateApprovalQueueViewProps) {
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [filters, setFilters] = useState(defaultFilters);
  const listParams = useMemo(
    () =>
      filters.queue === 'pending'
        ? { limit: 100, sort: '-createdAt', pendingApproval: true }
        : { limit: 100, sort: '-createdAt' },
    [filters.queue],
  );
  const { data, isLoading, isError, error } = useCandidatesList(listParams);
  const mutations = useCandidateMutations();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<ApprovalRow | null>(null);
  const [reason, setReason] = useState('');

  const records = useMemo(() => (data?.data ?? []).map(toApprovalRow), [data]);

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.queue === 'approved') {
      rows = rows.filter(
        (r) => r.approvalStatus === 'APPROVED' && r.visibility !== 'CLIENT_VISIBLE',
      );
    } else if (filters.queue === 'published') {
      rows = rows.filter((r) => r.visibility === 'CLIENT_VISIBLE');
    } else if (filters.queue === 'rejected') {
      rows = rows.filter((r) => r.approvalStatus === 'REJECTED');
    } else if (filters.queue === 'all') {
      // keep all
    }

    rows.sort((a, b) => {
      const priority = (r: ApprovalRow) => {
        if (r.approvalStatus === 'PENDING' && r.submittedForApprovalAt) return 0;
        if (r.approvalStatus === 'APPROVED' && r.visibility !== 'CLIENT_VISIBLE') return 1;
        return 2;
      };
      return priority(a) - priority(b) || a.fullName.localeCompare(b.fullName);
    });

    return rows;
  }, [records, filters]);

  const handleApprove = useCallback(
    async (record: ApprovalRow) => {
      try {
        await mutations.approve.mutateAsync(record.id);
        show(`Approved — ${record.fullName}`);
      } catch (err) {
        showError(getApiErrorMessage(err, 'Approve failed'));
      }
    },
    [mutations.approve, show, showError],
  );

  const handlePublish = useCallback(
    async (record: ApprovalRow) => {
      try {
        await mutations.publish.mutateAsync(record.id);
        show(`Published — ${record.fullName} is now visible to clients`);
      } catch (err) {
        showError(getApiErrorMessage(err, 'Publish failed'));
      }
    },
    [mutations.publish, show, showError],
  );

  const handleUnpublish = useCallback(
    async (record: ApprovalRow) => {
      try {
        await mutations.hide.mutateAsync(record.id);
        show(`Unpublished — ${record.fullName} hidden from client portal`);
      } catch (err) {
        showError(getApiErrorMessage(err, 'Unpublish failed'));
      }
    },
    [mutations.hide, show, showError],
  );

  const openReject = (record: ApprovalRow) => {
    setActionTarget(record);
    setReason('');
    setRejectOpen(true);
  };

  const openSendBack = (record: ApprovalRow) => {
    setActionTarget(record);
    setReason('');
    setSendBackOpen(true);
  };

  const confirmReject = async () => {
    if (!actionTarget) return;
    if (reason.trim().length < 3) {
      showError('Rejection reason must be at least 3 characters');
      return;
    }
    try {
      await mutations.reject.mutateAsync({
        id: actionTarget.id,
        reason: reason.trim(),
      });
      show(`Rejected — ${actionTarget.fullName}`);
      setRejectOpen(false);
      setActionTarget(null);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Reject failed'));
    }
  };

  const confirmSendBack = async () => {
    if (!actionTarget) return;
    try {
      await mutations.sendBack.mutateAsync({
        id: actionTarget.id,
        reason: reason.trim() || undefined,
      });
      show(`Sent back to recruiter — ${actionTarget.fullName}`);
      setSendBackOpen(false);
      setActionTarget(null);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Send back failed'));
    }
  };

  const handleRowAction = useCallback(
    (record: ApprovalRow, action: ApprovalAction) => {
      switch (action) {
        case 'Approve':
          void handleApprove(record);
          break;
        case 'Reject':
          openReject(record);
          break;
        case 'Send back':
          openSendBack(record);
          break;
        case 'Publish':
          void handlePublish(record);
          break;
        case 'Unpublish':
          void handleUnpublish(record);
          break;
      }
    },
    [handleApprove, handlePublish, handleUnpublish],
  );

  const columns = useMemo<ColumnDef<ApprovalRow>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Candidate',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.fullName} size="sm" />
            <div>
              <Link
                to={`${candidateDetailBasePath}/${row.original.id}`}
                className="font-medium text-brand hover:underline"
              >
                {row.original.fullName}
              </Link>
              <p className="text-xs text-muted-foreground">{row.original.role ?? '—'}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'checklist',
        header: 'Review',
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <ChecklistCell ok={r.hasResume} label="Resume" />
              <ChecklistCell ok={r.hasAiSummary} label="AI" />
              <ChecklistCell ok={r.hasSkills} label="Skills" />
              <ChecklistCell ok={r.evaluationStatus === 'COMPLETED'} label="Eval" />
              <ChecklistCell
                ok={Boolean(r.bgvStatus) && r.bgvStatus !== 'NOT_STARTED' && r.bgvStatus !== 'FAILED'}
                label="BGV"
              />
              <ChecklistCell ok={r.hasAvailability} label="Avail" />
              <ChecklistCell ok={r.hasCommercials} label="Rate" />
            </div>
          );
        },
      },
      {
        accessorKey: 'evaluationStatus',
        header: 'Evaluation',
        cell: ({ getValue }) => <StatusBadge status={(getValue() as string) || 'NOT_STARTED'} />,
      },
      {
        accessorKey: 'bgvStatus',
        header: 'BGV',
        cell: ({ getValue }) => <StatusBadge status={(getValue() as string) || 'NOT_STARTED'} />,
      },
      {
        id: 'approval',
        header: 'Approval',
        cell: ({ row }) => <StatusBadge status={row.original.approvalStatus} />,
      },
      {
        id: 'visibility',
        header: 'Visibility',
        cell: ({ row }) => <StatusBadge status={row.original.visibility} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ApprovalRowActions
            record={row.original}
            onAction={(action) => handleRowAction(row.original, action)}
          />
        ),
      },
    ],
    [candidateDetailBasePath, handleRowAction],
  );

  const listError = isError
    ? error instanceof Error
      ? error.message
      : 'Failed to load candidates'
    : null;

  return (
    <>
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />
      <ListingPageShell
        title="Approvals"
        message={message}
        messageVariant={variant}
        error={listError}
        loading={isLoading}
        loadingLabel="Loading approval queue…"
      >
        <TanStackDataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate name or role…"
          pageSize={12}
          stickyHeader
          fillHeight
          dense
          filtersInline
          filters={
            <ListingFiltersRow onClear={() => setFilters(defaultFilters)}>
              <ListingFilterSelect
                label="QUEUE"
                value={filters.queue}
                onChange={(v) => setFilters((f) => ({ ...f, queue: v as QueueFilter }))}
                className="w-[200px] min-w-[160px]"
                options={[
                  { value: 'pending', label: 'Pending approval' },
                  { value: 'all', label: 'All candidates' },
                  { value: 'approved', label: 'Approved — ready to publish' },
                  { value: 'published', label: 'Published to clients' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />
            </ListingFiltersRow>
          }
          globalFilterFn={(row, _columnId, filterValue) => {
            const q = String(filterValue).toLowerCase().trim();
            if (!q) return true;
            const r = row.original;
            return [r.fullName, r.role, r.email].some((field) =>
              String(field ?? '').toLowerCase().includes(q),
            );
          }}
        />
      </ListingPageShell>

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject candidate"
        className="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void confirmReject()}>
              Confirm reject
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label htmlFor="reject-reason" className="text-sm font-medium">
            Reason (required, min 3 characters)
          </label>
          <Input
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Evaluation scores below threshold"
          />
        </div>
      </Dialog>

      <Dialog
        open={sendBackOpen}
        onClose={() => setSendBackOpen(false)}
        title="Send back to recruiter"
        className="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setSendBackOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void confirmSendBack()}>
              Send back
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label htmlFor="sendback-reason" className="text-sm font-medium">
            Notes for recruiter (optional)
          </label>
          <Input
            id="sendback-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Please complete BGV report upload"
          />
        </div>
      </Dialog>
    </>
  );
}
