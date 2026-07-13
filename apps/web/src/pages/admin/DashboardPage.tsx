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
import {
  Building2,
  Calendar,
  ClipboardCheck,
  FlaskConical,
  Rocket,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useClientsList } from '../../hooks/api/useClients';
import { useDeploymentsList } from '../../hooks/api/useDeployments';
import { useInterviewsList } from '../../hooks/api/useInterviews';
import { useTrialsList } from '../../hooks/api/useTrials';
import { useUsersList } from '../../hooks/api/useUsers';

export function DashboardPage() {
  const candidates = useCandidatesList({ limit: 100, sort: '-createdAt' });
  const clients = useClientsList({ limit: 100 });
  const deployments = useDeploymentsList({ limit: 100 });
  const trials = useTrialsList({ limit: 100 });
  const interviews = useInterviewsList({ limit: 20, sort: '-createdAt' });
  const users = useUsersList({ limit: 100 });

  const candidateRows = candidates.data?.data ?? [];
  const clientRows = clients.data?.data ?? [];
  const deploymentRows = deployments.data?.data ?? [];
  const trialRows = trials.data?.data ?? [];
  const interviewRows = interviews.data?.data ?? [];

  const pendingApprovals = candidateRows.filter((c) => c.approvalStatus === 'PENDING').length;
  const published = candidateRows.filter((c) => c.visibility === 'CLIENT_VISIBLE').length;
  const openTrials = trialRows.filter((t) =>
    ['REQUESTED', 'APPROVED', 'IN_PROGRESS', 'SCHEDULED'].includes(t.status),
  ).length;
  const activeDeployments = deploymentRows.filter((d) => d.status === 'ACTIVE').length;

  const isLoading =
    candidates.isLoading ||
    clients.isLoading ||
    deployments.isLoading ||
    trials.isLoading ||
    interviews.isLoading;

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title="Admin Dashboard"
        description="Live platform overview from your organization data"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/candidates/new"
              className="inline-flex h-9 items-center rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Add candidate
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Manage users
            </Link>
          </div>
        }
      />

      <div className="space-y-8 p-4 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading live metrics…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Candidates"
              value={candidateRows.length}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              label="Pending approvals"
              value={pendingApprovals}
              icon={<ClipboardCheck className="h-5 w-5" />}
            />
            <StatCard
              label="Published talent"
              value={published}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <StatCard
              label="Active clients"
              value={clientRows.filter((c) => c.status === 'ACTIVE').length}
              icon={<Building2 className="h-5 w-5" />}
            />
            <StatCard
              label="Open trials"
              value={openTrials}
              icon={<FlaskConical className="h-5 w-5" />}
            />
            <StatCard
              label="Active deployments"
              value={activeDeployments}
              icon={<Rocket className="h-5 w-5" />}
            />
            <StatCard
              label="Recent interviews"
              value={interviewRows.length}
              icon={<Calendar className="h-5 w-5" />}
            />
            <StatCard
              label="Team users"
              value={users.data?.data.length ?? 0}
              icon={<Users className="h-5 w-5" />}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent candidates</CardTitle>
              <Link to="/admin/candidates" className="text-sm font-medium text-brand hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidateRows.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to={`/admin/candidates/${c.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  <StatusBadge status={c.approvalStatus} />
                </Link>
              ))}
              {candidateRows.length === 0 && (
                <p className="text-sm text-muted-foreground">No candidates yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent interviews</CardTitle>
              <Link to="/admin/trials" className="text-sm font-medium text-brand hover:underline">
                View trials
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {interviewRows.slice(0, 6).map((i) => (
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
              {interviewRows.length === 0 && (
                <p className="text-sm text-muted-foreground">No interviews yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
