import { formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@bestal/ui';
import { ClipboardCheck, FlaskConical, UserCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useTrialsList } from '../../hooks/api/useTrials';

export function DashboardPage() {
  const candidates = useCandidatesList({ limit: 100, sort: '-updatedAt' });
  const trials = useTrialsList({ limit: 100, sort: '-updatedAt' });

  const candidateRows = candidates.data?.data ?? [];
  const trialRows = trials.data?.data ?? [];

  const activeCandidates = candidateRows.filter((c) => c.status === 'ACTIVE').length;
  const pendingApprovals = candidateRows.filter(
    (c) =>
      c.approvalStatus === 'PENDING' &&
      Boolean(c.submittedForApprovalAt) &&
      c.profileStatus === 'PENDING_APPROVAL',
  ).length;
  const openTrials = trialRows.filter((t) =>
    ['REQUESTED', 'APPROVED', 'IN_PROGRESS'].includes(t.status),
  );
  const trialsRequested = trialRows.filter((t) => t.status === 'REQUESTED').length;
  const trialsApproved = trialRows.filter((t) => t.status === 'APPROVED').length;
  const trialsInProgress = trialRows.filter((t) => t.status === 'IN_PROGRESS').length;
  const trialsCompleted = trialRows.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        actions={
          <Link
            to="/recruiter/candidates"
            className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Browse talent
          </Link>
        }
      />

      <div className="space-y-8 p-6">
        {candidates.isLoading || trials.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading live metrics…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active candidates"
              value={activeCandidates}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <StatCard
              label="Pending approvals"
              value={pendingApprovals}
              icon={<ClipboardCheck className="h-5 w-5" />}
            />
            <StatCard
              label="Open trials"
              value={openTrials.length}
              icon={<FlaskConical className="h-5 w-5" />}
            />
            <StatCard
              label="Total pipeline"
              value={candidateRows.length}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard label="Requested" value={trialsRequested} />
            <StatCard label="Approved" value={trialsApproved} />
            <StatCard label="In progress" value={trialsInProgress} />
            <StatCard label="Completed" value={trialsCompleted} />
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Open Trials</CardTitle>
            <Link
              to="/recruiter/trials"
              className="text-sm font-medium text-brand hover:underline"
            >
              View trials
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {openTrials.slice(0, 8).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{t.candidateName}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.clientName} · {t.startDate ? formatDate(t.startDate) : 'TBD'}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
            {openTrials.length === 0 && (
              <p className="text-sm text-muted-foreground">No open trials.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
