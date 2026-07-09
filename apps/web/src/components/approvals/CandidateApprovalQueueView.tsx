import {
  Avatar,
  Button,
  Dialog,
  Input,
  StatusBadge,
  TanStackDataTable,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle, EyeOff, Globe, MoreHorizontal, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCandidateMutations, useCandidatesList } from '../../hooks/api/useCandidates';
import type { CandidateListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';
import {
  ListingFilterSelect,
  ListingFiltersRow,
  ListingPageShell,
} from '../layout/ListingPageShell';

type QueueFilter = 'all' | 'pending' | 'approved' | 'published' | 'rejected';

const defaultFilters = {
  queue: 'all' as QueueFilter,
};

type CandidateApprovalQueueViewProps = {
  candidateDetailBasePath?: string;
};

type ApprovalAction = 'Approve' | 'Reject' | 'Publish' | 'Unpublish';

type ApprovalRow = {
  id: number;
  fullName: string;
  email: string;
  role: string | null;
  approvalStatus: string;
  visibility: string;
  evaluationStatus: 'NOT_STARTED';
  bgvStatus: 'NOT_STARTED';
};

function toApprovalRow(candidate: CandidateListItem): ApprovalRow {
  return {
    id: candidate.id,
    fullName: `${candidate.firstName} ${candidate.lastName}`.trim(),
    email: candidate.email,
    role: candidate.headline,
    approvalStatus: candidate.approvalStatus,
    visibility: candidate.visibility,
    evaluationStatus: 'NOT_STARTED',
    bgvStatus: 'NOT_STARTED',
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

  const actions: {
    label: ApprovalAction;
    icon: React.ReactNode;
    disabled?: boolean;
    variant?: 'danger';
  }[] = [
    {
      label: 'Approve',
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      disabled: record.approvalStatus !== 'PENDING',
    },
    {
      label: 'Reject',
      icon: <XCircle className="h-3.5 w-3.5" />,
      disabled: record.approvalStatus !== 'PENDING',
      variant: 'danger',
    },
    {
      label: 'Publish',
      icon: <Globe className="h-3.5 w-3.5" />,
      disabled: record.approvalStatus !== 'APPROVED' || record.visibility === 'PUBLISHED',
    },
    {
      label: 'Unpublish',
      icon: <EyeOff className="h-3.5 w-3.5" />,
      disabled: record.visibility !== 'PUBLISHED',
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
          {actions.map(({ label, icon, disabled, variant }) => (
            <button
              key={label}
              type="button"
              disabled={disabled}
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
  const { message, show } = useDemoToast();
  const { data, isLoading, isError, error } = useCandidatesList({ limit: 100, sort: '-createdAt' });
  const mutations = useCandidateMutations();
  const [filters, setFilters] = useState(defaultFilters);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ApprovalRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const records = useMemo(() => (data?.data ?? []).map(toApprovalRow), [data]);

  const filteredData = useMemo(() => {
    let rows = [...records];

    if (filters.queue === 'pending') {
      rows = rows.filter((r) => r.approvalStatus === 'PENDING');
    } else if (filters.queue === 'approved') {
      rows = rows.filter(
        (r) => r.approvalStatus === 'APPROVED' && r.visibility !== 'PUBLISHED',
      );
    } else if (filters.queue === 'published') {
      rows = rows.filter((r) => r.visibility === 'PUBLISHED');
    } else if (filters.queue === 'rejected') {
      rows = rows.filter((r) => r.approvalStatus === 'REJECTED');
    }

    rows.sort((a, b) => {
      const priority = (r: ApprovalRow) => {
        if (r.approvalStatus === 'PENDING') return 0;
        if (r.approvalStatus === 'APPROVED' && r.visibility !== 'PUBLISHED') return 1;
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
        show(err instanceof Error ? err.message : 'Approve failed');
      }
    },
    [mutations.approve, show],
  );

  const handlePublish = useCallback(
    async (record: ApprovalRow) => {
      try {
        await mutations.publish.mutateAsync(record.id);
        show(`Published — ${record.fullName} is now visible to clients`);
      } catch (err) {
        show(err instanceof Error ? err.message : 'Publish failed');
      }
    },
    [mutations.publish, show],
  );

  const handleUnpublish = useCallback(
    async (record: ApprovalRow) => {
      try {
        await mutations.hide.mutateAsync(record.id);
        show(`Unpublished — ${record.fullName} hidden from client portal`);
      } catch (err) {
        show(err instanceof Error ? err.message : 'Unpublish failed');
      }
    },
    [mutations.hide, show],
  );

  const openReject = (record: ApprovalRow) => {
    setRejectTarget(record);
    setRejectReason('');
    setRejectOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    try {
      await mutations.reject.mutateAsync({
        id: rejectTarget.id,
        reason: rejectReason || undefined,
      });
      show(`Rejected — ${rejectTarget.fullName}`);
      setRejectOpen(false);
      setRejectTarget(null);
    } catch (err) {
      show(err instanceof Error ? err.message : 'Reject failed');
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

  const listError = isError ? (error instanceof Error ? error.message : 'Failed to load candidates') : null;

  return (
    <>
      <ListingPageShell
        title="Approvals"
        message={message}
        error={listError}
        loading={isLoading}
        loadingLabel="Loading candidates…"
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
                  { value: 'all', label: 'All candidates' },
                  { value: 'pending', label: 'Pending approval' },
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
    </>
  );
}
