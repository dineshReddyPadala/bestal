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
  CheckCircle,
  ClipboardList,
  EyeOff,
  Globe,
  MoreHorizontal,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCandidateMutations, useCandidatesList } from '../../hooks/api/useCandidates';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
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

type ApprovalAction =
  | 'Approve'
  | 'Reject'
  | 'Publish'
  | 'Unpublish'
  | 'Send back'
  | 'View Evaluation';

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
};

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
      label: 'View Evaluation',
      icon: <ClipboardList className="h-3.5 w-3.5" />,
    },
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
  const navigate = useNavigate();
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const [filters, setFilters] = useState(defaultFilters);
  const { searchInput, setSearchInput, search, searchParam } = useDebouncedSearch();
  const evaluationsBase = candidateDetailBasePath.includes('super-admin')
    ? '/super-admin/evaluations'
    : '/admin/evaluations';
  const listParams = useMemo(() => {
    const base = { limit: 100, sort: '-updatedAt', ...searchParam };
    if (filters.queue === 'pending') {
      return { ...base, pendingApproval: true as const };
    }
    if (filters.queue === 'approved') {
      return { ...base, approvalStatus: 'APPROVED' };
    }
    if (filters.queue === 'published') {
      return { ...base, visibility: 'CLIENT_VISIBLE' };
    }
    if (filters.queue === 'rejected') {
      return { ...base, approvalStatus: 'REJECTED' };
    }
    return base;
  }, [filters.queue, searchParam]);
  const { data, isLoading, isError, error } = useCandidatesList(listParams);
  const mutations = useCandidateMutations();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<ApprovalRow | null>(null);
  const [reason, setReason] = useState('');

  const records = useMemo(() => (data?.data ?? []).map(toApprovalRow), [data]);

  const filteredData = useMemo(() => {
    let rows = [...records];

    // Server already scopes pending/approved/rejected; client only narrows "published".
    if (filters.queue === 'approved') {
      rows = rows.filter((r) => r.visibility !== 'CLIENT_VISIBLE');
    } else if (filters.queue === 'published') {
      rows = rows.filter((r) => r.visibility === 'CLIENT_VISIBLE');
    }

    rows.sort((a, b) => {
      const priority = (r: ApprovalRow) => {
        if (r.approvalStatus === 'PENDING') return 0;
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
        case 'View Evaluation':
          navigate(`${evaluationsBase}?candidateId=${record.id}`);
          break;
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
    [evaluationsBase, handleApprove, handlePublish, handleUnpublish, navigate],
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
        accessorKey: 'profileStatus',
        header: 'Profile status',
        cell: ({ getValue }) => (
          <StatusBadge status={(getValue() as string) || 'SOURCED'} />
        ),
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
          key={search}
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search by candidate name or role…"
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          serverSideSearch
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
