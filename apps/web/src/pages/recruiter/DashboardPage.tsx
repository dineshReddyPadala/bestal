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
import { Calendar, ClipboardCheck, UserCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useInterviewsList } from '../../hooks/api/useInterviews';

export function DashboardPage() {
  const candidates = useCandidatesList({ limit: 100, sort: '-createdAt' });
  const interviews = useInterviewsList({ limit: 100, sort: '-createdAt' });

  const candidateRows = candidates.data?.data ?? [];
  const interviewRows = interviews.data?.data ?? [];

  const activeCandidates = candidateRows.filter((c) => c.status === 'ACTIVE').length;
  const pendingApprovals = candidateRows.filter((c) => c.approvalStatus === 'PENDING').length;
  const upcomingInterviews = interviewRows.filter((i) =>
    ['REQUESTED', 'SCHEDULED', 'CONFIRMED'].includes(i.status),
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your recruiting pipeline at a glance"
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
        {candidates.isLoading || interviews.isLoading ? (
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
              label="Upcoming interviews"
              value={upcomingInterviews.length}
              icon={<Calendar className="h-5 w-5" />}
            />
            <StatCard
              label="Total pipeline"
              value={candidateRows.length}
              icon={<Users className="h-5 w-5" />}
            />
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Interviews</CardTitle>
            <Link
              to="/recruiter/interviews"
              className="text-sm font-medium text-brand hover:underline"
            >
              View schedule
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingInterviews.slice(0, 8).map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{i.candidateName}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.clientName} · {i.scheduledAt ? formatDate(i.scheduledAt) : 'Unscheduled'}
                  </p>
                </div>
                <StatusBadge status={i.status} />
              </div>
            ))}
            {upcomingInterviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming interviews.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
