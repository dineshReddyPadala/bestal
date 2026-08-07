import { formatDate } from '@bestal/shared-utils';
import {
  Avatar,
  Button,
  EmptyState,
  Input,
  Select,
  StatusBadge,
  TanStackDataTable,
  useDashboardHeaderLeading,
} from '@bestal/ui';
import { type ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Eye,
  FlaskConical,
  Monitor,
  Plus,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClientPortalStatCard } from '../../components/client/ClientPortalStatCard';
import { ClientSegmentTabs } from '../../components/client/ClientSegmentTabs';
import { PickCandidateDialog } from '../../components/client/PickCandidateDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useTrialMutations, useTrialsList, toTrialRow } from '../../hooks/api/useTrials';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import { getApiErrorMessage } from '../../lib/api/errors';
import type { TrialManagementRow } from '../../hooks/api/useTrials';
import { useAuth } from '../../contexts/AuthContext';
import { useDemoToast } from '../../lib/use-demo-toast';
import { ToastHost } from '../../components/ui/ToastHost';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

const ACTIVE_STATUSES = new Set(['REQUESTED', 'APPROVED', 'IN_PROGRESS']);
const HISTORY_STATUSES = new Set(['COMPLETED', 'CANCELLED', 'FAILED']);

export function TrialRequestsPage() {
  const { message, variant, show, showError, dismiss } = useDemoToast();
  const { user } = useAuth();
  const clientId = user?.clientId ?? undefined;
  const { data, isLoading } = useTrialsList({ clientId, limit: 100, sort: '-createdAt' });
  const { addRequest } = useClientTrialRequests();
  const { submitFeedback } = useTrialMutations();
  const [segment, setSegment] = useState<'active' | 'history'>('history');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);
  const [feedbackTrialId, setFeedbackTrialId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState('5');
  const [decision, setDecision] = useState<'CONTINUE' | 'DO_NOT_CONTINUE'>('CONTINUE');

  useDashboardHeaderLeading(
    useMemo(
      () => (
        <span className="text-base font-semibold tracking-tight text-foreground">
          Trial Requests
        </span>
      ),
      [],
    ),
  );

  const trialRows: TrialManagementRow[] = useMemo(
    () => (data?.data ?? []).map((item) => toTrialRow(item)),
    [data],
  );

  const active = useMemo(
    () => trialRows.filter((t) => ACTIVE_STATUSES.has(t.status)),
    [trialRows],
  );
  const history = useMemo(
    () => trialRows.filter((t) => HISTORY_STATUSES.has(t.status)),
    [trialRows],
  );

  const segmentRows = segment === 'active' ? active : history;

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return segmentRows;
    return segmentRows.filter((row) => row.status === statusFilter);
  }, [segmentRows, statusFilter]);

  const stats = useMemo(
    () => ({
      total: trialRows.length,
      active: active.length,
      highRating: history.filter((t) => (t.clientRating ?? 0) >= 4.5).length,
      rejected: trialRows.filter((t) => ['CANCELLED', 'FAILED'].includes(t.status)).length,
    }),
    [trialRows, active, history],
  );

  const feedbackTrial = trialRows.find((t) => t.id === feedbackTrialId);

  const columns = useMemo<ColumnDef<TrialManagementRow>[]>(
    () => [
      {
        id: 'trialId',
        header: 'Trial ID',
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{pad2(row.original.id)}</span>
        ),
      },
      {
        accessorKey: 'candidateName',
        header: 'Candidate Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar name={row.original.candidateName} size="sm" />
            <span className="font-medium">{row.original.candidateName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'roleTitle',
        header: 'Designation',
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{(getValue() as string) || '—'}</span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Trial Start Date',
        cell: ({ getValue }) => {
          const value = getValue() as string | null;
          return value ? formatDate(value) : '—';
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) =>
          row.original.status === 'COMPLETED' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : (
            <StatusBadge status={row.original.status} />
          ),
      },
      {
        accessorKey: 'clientRating',
        header: 'Rating',
        cell: ({ row }) =>
          row.original.clientRating != null ? (
            <span className="tabular-nums">{row.original.clientRating}/5</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Link
              to={`/client/candidates/${row.original.candidateId}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={`View ${row.original.candidateName}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
            {row.original.status === 'COMPLETED' &&
            !row.original.feedback?.trim() ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setFeedbackTrialId(row.original.id)}
              >
                Feedback
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [],
  );

  async function handleSubmitFeedback() {
    if (!feedbackTrialId || feedbackText.trim().length < 3) {
      showError('Please enter feedback (min 3 characters)');
      return;
    }
    try {
      await submitFeedback.mutateAsync({
        id: feedbackTrialId,
        body: {
          feedback: feedbackText.trim(),
          clientRating: Number(rating),
          decision,
        },
      });
      show(
        decision === 'CONTINUE'
          ? 'Feedback submitted — continue with deployment'
          : 'Feedback submitted — do not continue',
      );
      setFeedbackTrialId(null);
      setFeedbackText('');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Feedback failed'));
    }
  }

  return (
    <div className="flex h-[calc(100svh-var(--shell-header-h))] min-h-0 flex-col overflow-hidden">
      <ToastHost message={message} variant={variant} onDismiss={dismiss} />

      <div className="shrink-0 grid grid-cols-2 gap-3 px-4 pt-4 sm:px-6 xl:grid-cols-4">
        <ClientPortalStatCard
          label="Total Trials"
          value={pad2(stats.total)}
          icon={<Monitor className="h-4 w-4" />}
          accent="orange"
        />
        <ClientPortalStatCard
          label="Active Trials"
          value={pad2(stats.active)}
          icon={<Monitor className="h-4 w-4" />}
          accent="green"
        />
        <ClientPortalStatCard
          label="Feedback above 4.5"
          value={pad2(stats.highRating)}
          icon={<ThumbsUp className="h-4 w-4" />}
          accent="amber"
        />
        <ClientPortalStatCard
          label="Rejected"
          value={pad2(stats.rejected)}
          icon={<XCircle className="h-4 w-4" />}
          accent="rose"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
            <ClientSegmentTabs
              tabs={[
                { id: 'active', label: 'Active' },
                { id: 'history', label: 'History' },
              ]}
              activeId={segment}
              onChange={(id) => {
                setSegment(id as 'active' | 'history');
                setStatusFilter('all');
              }}
            />
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 w-[8.5rem] text-xs"
              >
                <option value="all">Filter By</option>
                {segment === 'active' ? (
                  <>
                    <option value="REQUESTED">Requested</option>
                    <option value="APPROVED">Approved</option>
                    <option value="IN_PROGRESS">In progress</option>
                  </>
                ) : (
                  <>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="FAILED">Failed</option>
                  </>
                )}
              </Select>
              <Button size="sm" className="h-8" onClick={() => setPickerOpen(true)}>
                <Plus className="mr-1 h-3.5 w-3.5" />
                Request trial
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 p-3 sm:p-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading trials…</p>
            ) : filteredRows.length === 0 ? (
              <EmptyState
                icon={<FlaskConical className="h-8 w-8" />}
                title={segment === 'active' ? 'No active trials' : 'No trial history'}
                action={{ label: 'Request trial', onClick: () => setPickerOpen(true) }}
              />
            ) : (
              <TanStackDataTable
                columns={columns}
                data={filteredRows}
                pageSize={6}
                dense
                fillHeight
                hideSearch
                emptyTitle="No trials"
              />
            )}
          </div>
        </div>
      </div>

      <PickCandidateDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Select candidate for trial"
        trialEligibleOnly
        onSelect={(candidate) => {
          setSelected({ id: candidate.id, name: candidate.fullName });
        }}
      />

      {selected ? (
        <RequestTrialDialog
          open
          onClose={() => setSelected(null)}
          candidateName={selected.name}
          onSubmit={async (values) => {
            await addRequest(selected.id, selected.name, values);
            show(`Trial requested — ${selected.name}`);
          }}
        />
      ) : null}

      {feedbackTrial ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-elevated">
            <h3 className="text-lg font-semibold">Trial feedback</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {feedbackTrial.candidateName} — rate the pilot and choose next step
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Rating</label>
                <Select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="mt-1"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} / 5
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Feedback</label>
                <Input
                  className="mt-1"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="How did the pilot go?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Decision</label>
                <Select
                  value={decision}
                  onChange={(e) =>
                    setDecision(e.target.value as 'CONTINUE' | 'DO_NOT_CONTINUE')
                  }
                  className="mt-1"
                >
                  <option value="CONTINUE">Continue with deployment</option>
                  <option value="DO_NOT_CONTINUE">Do not continue</option>
                </Select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFeedbackTrialId(null)}>
                Cancel
              </Button>
              <Button onClick={() => void handleSubmitFeedback()}>Submit</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
